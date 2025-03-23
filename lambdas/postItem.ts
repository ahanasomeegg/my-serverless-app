import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent } from "aws-lambda";

const client = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME || "";

export const handler = async (event: APIGatewayEvent) => {
  try {
    // Analyze the request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }
    const body = JSON.parse(event.body);

    // Assuming the client provides PK, SK, And optional descriptions, etc
    const { PK, SK, description, otherAttr } = body;
    if (!PK || !SK) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "PK and SK are required" }),
      };
    }

    // invoke PutItemCommand
    await client.send(new PutItemCommand({
      TableName: tableName,
      Item: {
        PK: { S: PK },
        SK: { S: SK },
        description: { S: description || "" },
        otherAttr: { S: otherAttr || "" },
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item created successfully" }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};