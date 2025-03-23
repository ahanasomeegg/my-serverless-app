import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { join } from 'path';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';


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

    // create Usage Plan
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'ThingsUsagePlan',
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
      quota: {
        limit: 10000,
        period: apigw.Period.DAY,
      },
    });

    // create API Key
    const apiKey = api.addApiKey('ThingsApiKey', {
      apiKeyName: 'ThingsApiKey',
    });
    // Associate API Key with Usage Plan
    plan.addApiKey(apiKey);
    // Associate Usage Plan with API stages
    plan.addApiStage({
      stage: api.deploymentStage,
      api: api,
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

     thingsResource.addMethod('POST', new apigw.LambdaIntegration(postItemLambda), {
      apiKeyRequired: true, // New: Protecting POST endpoints
    });

    // create Lambda (PUT Items)
    const putItemLambda = new lambda.Function(this, 'PutItemLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'putItem.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../lambdas')),
      environment: {
      TABLE_NAME: thingsTable.tableName,
        },
      });

    // Authorize Lambda functions to write data
    thingsTable.grantWriteData(putItemLambda);

    // Add new resource path/things/{pk}/{sk}
    const thingsWithSk = thingsWithPk.addResource('{sk}');
    thingsWithSk.addMethod('PUT', new apigw.LambdaIntegration(putItemLambda), {
      apiKeyRequired: true, // New: Protecting PUT endpoints
    });

    // create Lambda 
    const getTranslationLambda = new lambda.Function(this, 'GetTranslationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getTranslation.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../lambdas')),
      environment: {
        TABLE_NAME: thingsTable.tableName,
      },
    });
    thingsTable.grantReadWriteData(getTranslationLambda);
    
    // Add permissions to getTranslationLambda
    getTranslationLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
       "translate:TranslateText",
       "comprehend:DetectDominantLanguage"
      ],
      resources: ["*"],
    }));
    
    // add translation
    const translationResource = thingsWithSk.addResource('translation');
    translationResource.addMethod('GET', new apigw.LambdaIntegration(getTranslationLambda));
 

    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/${api.deploymentStage.stageName}`,
    });
      
  }
}

