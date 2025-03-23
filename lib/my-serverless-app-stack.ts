import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { join } from 'path';
import * as cdk from 'aws-cdk-lib';

export class MyServerlessAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create DynamoDB table
    const thingsTable = new dynamodb.Table(this, 'ThingsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY, 
    });

    // create Lambda (GET Items)
    const getItemsLambda = new lambda.Function(this, 'GetItemsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getItems.handler', 
      code: lambda.Code.fromAsset(join(__dirname, '../lambdas')), 
      environment: {
        TABLE_NAME: thingsTable.tableName
      },
    });

    // give Lambda permission to read tables
    thingsTable.grantReadData(getItemsLambda);

    // create API Gateway
    const api = new apigw.RestApi(this, 'ThingsApi', {
      restApiName: 'Things Service',
    });

    // /things
    const thingsResource = api.root.addResource('things');

    // /things/{pk}
    const thingsWithPk = thingsResource.addResource('{pk}');

    // GET /things/{pk} -> getItemsLambda
    thingsWithPk.addMethod('GET', new apigw.LambdaIntegration(getItemsLambda));

    // Lambda (POST Items)
    const postItemLambda = new lambda.Function(this, 'PostItemLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'postItem.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../lambdas')),
      environment: {
       TABLE_NAME: thingsTable.tableName,
       },
    });
     thingsTable.grantWriteData(postItemLambda);

     thingsResource.addMethod('POST', new apigw.LambdaIntegration(postItemLambda));


    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/${api.deploymentStage.stageName}`,
    });
      
  }
}

