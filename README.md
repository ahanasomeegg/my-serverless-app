## Serverless REST Assignment - Distributed Systems.
​
__Name:__ ....Duan Li.....
​
__Demo:__ ... link to your YouTube video demonstration ......
​
### Context.
​
​
Context: User information
​
Table item attributes:
+ PK - string  (Partition key)  
+ SK - stringe  (Sort Key)
+ Description - string
+ otherAttr - string
​
### App API endpoints.
​
[ Provide a bullet-point list of the app's endpoints (excluding the Auth API) you have successfully implemented. ]
e.g.
 
+ POST /thing - add a new 'thing'.
+ GET /thing/{pk}/ - Get all the 'things' with a specified partition key.
+ PUT /thing/{pk}/{sk} - update all the 'things' with a specified partition key value and its attributeX satisfying the condition 
+ GET /thing/{pk}/{sk}/translation?language=fr/zh/es  translate the description into other languages
​
​
### Features.
​
#### Translation persistence (if completed)
​
 When a translation is requested, the Lambda function first checks whether the translation for the target language already exists in the DynamoDB record. If a cached translation is found, it returns the stored value immediately. If not, the function calls Amazon Translate to perform the translation, then updates the same DynamoDB record with the new translation. This approach prevents repeated calls to the translation service, reducing cost and latency.
​
{
+   "PK": "userA",
+   "SK": "item002",
+   "originalDescription": "hello",
+   "translatedText": "你好",
+   "cached": true
}

​

​
#### API Keys. (if completed)
​
In this project, API key authentication is used to secure certain API Gateway endpoints (such as POST and PUT operations). By requiring clients to provide a valid API key, the API ensures that only authorized requests are processed, thereby enhancing security.
​Implementation Details:

1. Creating a Usage Plan and API Key
In our CDK stack, we create a Usage Plan and an API Key, then associate them with the API stage. This setup ensures that any request to protected endpoints must include the correct API key.

+ code
~~~ts
// Create a Usage Plan with throttling and quota settings
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

// Create an API Key
const apiKey = api.addApiKey('ThingsApiKey', {
  apiKeyName: 'ThingsApiKey',
});

// Associate the API Key with the Usage Plan and bind it to the API stage
plan.addApiKey(apiKey);
plan.addApiStage({
  stage: api.deploymentStage,
  api: api,
});
~~~

2. Protecting Endpoints with API Key Requirement
For the endpoints that should be protected, we set the apiKeyRequired property to true. For example, the POST and PUT endpoints are configured as follows:

+ code
~~~ts
// Protect the POST endpoint: only requests with a valid API key will be allowed.
thingsResource.addMethod('POST', new apigw.LambdaIntegration(postItemLambda), {
  apiKeyRequired: true,
});

// Protect the PUT endpoint: only requests with a valid API key will be allowed.
thingsWithSk.addMethod('PUT', new apigw.LambdaIntegration(putItemLambda), {
  apiKeyRequired: true,
});
~~~

 Testing:
 When testing these endpoints with a tool like Postman or curl, ensure you include the API key in the request header as follows:

Header Name: x-api-key

Header Value: the API key 

Without the correct API key, the API Gateway will return a 403 Forbidden response, thereby protecting your endpoints.

~~~ts
// This is a code excerpt markdown 
let foo : string = 'Foo'
console.log(foo)
~~~
​
​
