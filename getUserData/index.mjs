import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    let userID = null;

    if (event?.requestContext?.authorizer?.userID) {
      userID = event.requestContext.authorizer.userID;
      console.log("userID from authorizer:", userID);
    } else if (
      event.queryStringParameters &&
      event.queryStringParameters.userID
    ) {
      userID = event.queryStringParameters.userID;
      console.log("userID from queryStringParameters:", userID);
    } else if (event.userID) {
      userID = event.userID;
      console.log("userID from event.userID:", userID);
    } else {
      console.log("No userID found in event.");
    }

    if (!userID) {
      console.log("=== No userID found. Returning 400 ===");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Failed to find user ID",
        }),
      };
    }

    const params = {
      TableName: "user_data",
      Key: { userID },
    };

    console.log(JSON.stringify(params, null, 2));

    const result = await ddb.send(new GetCommand(params));

    console.log(JSON.stringify(result, null, 2));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "failed to find user.",
        }),
      };
    }

    const { password, ...userWithoutPassword } = result.Item;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error("=== Caught error ===");
    console.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: error.message,
        errorType: error.name,
        errorCode: error.code,
      }),
    };
  }
};
