#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyServerlessAppStack } from '../lib/my-serverless-app-stack';

const app = new cdk.App();
new MyServerlessAppStack(app, 'MyServerlessAppStack', {});
