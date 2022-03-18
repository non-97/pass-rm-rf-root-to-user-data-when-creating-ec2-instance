#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Ec2Stack } from "../lib/ec2-stack";

const app = new cdk.App();
new Ec2Stack(app, "Ec2Stack");
