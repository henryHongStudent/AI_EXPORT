import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

const client = new DynamoDBClient({ region: process.env.region });
const ddb = DynamoDBDocumentClient.from(client);

function validateInput({ userID }) {
  if (!userID) {
    return "userID is required";
  }
  return null;
}

async function logoutUser(userID) {
  const getParams = {
    TableName: "user_data",
    Key: {
      userID: userID,
    },
  };

  const userResult = await ddb.send(new GetCommand(getParams));

  if (!userResult.Item) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const updateParams = {
    TableName: "user_data",
    Key: {
      userID: userID,
    },
    UpdateExpression: "SET lastLogout = :time",
    ExpressionAttributeValues: {
      ":time": new Date().toISOString(),
    },
    ReturnValues: "UPDATED_NEW",
  };

  await ddb.send(new UpdateCommand(updateParams));

  return {
    success: true,
    message: "Logged out successfully",
  };
}

export const handler = async (event) => {
  console.log("Event:", event);
  const data = JSON.parse(event.body);
  const error = validateInput(data);
  if (error) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: error }),
    };
  }

  const { userID } = data;

  try {
    const result = await logoutUser(userID);

    if (!result.success) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: result.message }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: result.message,
      }),
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Failed to logout",
        error: error.message,
      }),
    };
  }
};
