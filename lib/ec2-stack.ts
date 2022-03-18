import { Stack, StackProps, aws_iam as iam, aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as fs from "fs";

export class Ec2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 1,
      subnetConfiguration: [
        { name: "Public", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
      ],
    });

    // EC2 Instance IAM role
    const ec2InstanceIamRole = new iam.Role(this, "Ec2InstanceIamRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    // User data for Amazon Linux 2
    const userDataParameter = fs.readFileSync(
      "./src/ec2/user_data_amazon_linux2.sh",
      "utf8"
    );
    const userDataAmazonLinux2 = ec2.UserData.forLinux({
      shebang: "#!/bin/bash",
    });
    userDataAmazonLinux2.addCommands(userDataParameter);

    // EC2 Instance
    new ec2.Instance(this, "Ec2Instance", {
      instanceType: new ec2.InstanceType("t3.micro"),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc: vpc,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(8, {
            encrypted: true,
            volumeType: ec2.EbsDeviceVolumeType.GP3,
          }),
        },
      ],
      role: ec2InstanceIamRole,
      userData: userDataAmazonLinux2,
    });
  }
}
