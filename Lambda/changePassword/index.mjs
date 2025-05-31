import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,PUT",
};

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "CORS enabled" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { userID, newPassword, isAdmin, targetUserID } = body;

    if (!passwordRegex.test(newPassword)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message:
            "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters",
        }),
      };
    }

    const targetID = isAdmin ? targetUserID : userID;

    const getCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        userID: targetID,
      },
    });

    const result = await dynamoDB.send(getCommand);
    const user = result.Item;

    if (!user) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateCommand = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userID: targetID,
      },
      UpdateExpression: "set password = :password",
      ExpressionAttributeValues: {
        ":password": hashedPassword,
      },
      ReturnValues: "ALL_NEW",
    });

    await dynamoDB.send(updateCommand);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: "Password successfully changed",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
