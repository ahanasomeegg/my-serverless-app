import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { APIGatewayEvent } from "aws-lambda";

const dynamoClient = new DynamoDBClient({});
const translateClient = new TranslateClient({});
const tableName = process.env.TABLE_NAME || "";

export const handler = async (event: APIGatewayEvent) => {
  try {
    // get pk, sk from pathParameters
    const pk = event.pathParameters?.pk;
    const sk = event.pathParameters?.sk;
    if (!pk || !sk) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing pk or sk in path" }),
      };
    }

    // get translation
    const targetLanguage = event.queryStringParameters?.language;
    if (!targetLanguage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing target language in query string" }),
      };
    }

    // get original records 
    const getItemRes = await dynamoClient.send(new GetItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk }
      }
    }));

    if (!getItemRes.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    const originalDescription = getItemRes.Item.description?.S || "";

    //check if it exits
    const translationAttr = `translation_${targetLanguage}`;
    const cachedTranslation = getItemRes.Item[translationAttr]?.S;
    if (cachedTranslation) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          PK: pk,
          SK: sk,
          originalDescription,
          translatedText: cachedTranslation,
          cached: true,
        }),
      };
    }

    // if not exit, invoke Amazon Translate
    const translateRes = await translateClient.send(new TranslateTextCommand({
      Text: originalDescription,
      SourceLanguageCode: "auto",
      TargetLanguageCode: targetLanguage,
    }));

    const translatedText = translateRes.TranslatedText || "";

    // update translation
    await dynamoClient.send(new UpdateItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
      UpdateExpression: `SET ${translationAttr} = :t`,
      ExpressionAttributeValues: {
        ":t": { S: translatedText },
      },
    }));

    // return result
    return {
      statusCode: 200,
      body: JSON.stringify({
        PK: pk,
        SK: sk,
        originalDescription,
        translatedText,
        cached: false,
      }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
