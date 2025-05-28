import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({ region: "ap-southeast-2" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

export const connect = async (connectionId) => {
  console.log("Connected:", connectionId);
  const params = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
      timestamp: Date.now(),
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connected" }),
    };
  } catch (error) {
    console.error("Connection error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to connect" }),
    };
  }
};

export const disconnect = async (connectionId) => {
  const params = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  try {
    await docClient.send(new DeleteCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Disconnected" }),
    };
  } catch (error) {
    console.error("Disconnection error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to disconnect" }),
    };
  }
};

export const getConnections = async () => {
  const params = {
    TableName: CONNECTIONS_TABLE,
  };

  try {
    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];
  } catch (error) {
    console.error("Get connections error:", error);
    return [];
  }
};
