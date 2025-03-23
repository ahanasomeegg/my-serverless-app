import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent } from "aws-lambda";

const client = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME || "";

export const handler = async (event: APIGatewayEvent) => {
  try {
    // path parameter: pk
    const pk = event.pathParameters?.pk;
    if (!pk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing pk in path" }),
      };
    }

    // Optional query string: filterAttr
    const filterAttr = event.queryStringParameters?.filterAttr;

    // Query DynamoDB: KeyConditionExpression
    const queryRes = await client.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "PK = :p",
      ExpressionAttributeValues: {
        ":p": { S: pk }
      }
    }));

    let items = (queryRes.Items || []).map((item) => {
      return {
        PK: item.PK?.S,
        SK: item.SK?.S,
        description: item.description?.S,
        otherAttr: item.otherAttr?.S
      };
    });

    // If filterAttr exists, perform a local filter
    if (filterAttr) {
      items = items.filter((i) => i.otherAttr === filterAttr);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};