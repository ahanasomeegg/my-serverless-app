import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent } from "aws-lambda";

const client = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME || "";

export const handler = async (event: APIGatewayEvent) => {
  try {
    const pk = event.pathParameters?.pk;
    const sk = event.pathParameters?.sk;
    if (!pk || !sk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing pk or sk in path" }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }
    const body = JSON.parse(event.body);
    //Retrieve the fields to be updated from the request body, such as description and otherAttr
    const { description, otherAttr } = body;

    // invoke DynamoDB UpdateItemCommand
    await client.send(new UpdateItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
      UpdateExpression: "SET description = :desc, otherAttr = :attr",
      ExpressionAttributeValues: {
        ":desc": { S: description || "" },
        ":attr": { S: otherAttr || "" },
      },
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully" }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};