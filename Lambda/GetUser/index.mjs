import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  
  try {
    const userID = event.queryStringParameters?.userID;
    console.log("UserID from query params:", userID);

    if (!userID) {
      console.log("No userID provided in query parameters");
      return {
        statusCode: 400,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        body: JSON.stringify({ message: "userID 쿼리 파라미터가 필요합니다." })
      };
    }

    const params = {
      TableName: "user_data",
      Key: { userID }
    };
    console.log("DynamoDB params:", JSON.stringify(params, null, 2));

    const result = await ddb.send(new GetCommand(params));
    console.log("DynamoDB result:", JSON.stringify(result, null, 2));

    if (!result.Item) {
      console.log("No user found for userID:", userID);
      return {
        statusCode: 404,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        body: JSON.stringify({ message: "사용자를 찾을 수 없습니다." })
      };
    }

    const { password, ...userWithoutPassword } = result.Item;
    console.log("User data without password:", JSON.stringify(userWithoutPassword, null, 2));

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({ success: true, user: userWithoutPassword })
    };
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      statusCode: 500,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({ 
        message: "서버 오류", 
        error: error.message,
        errorType: error.name,
        errorStack: error.stack
      })
    };
  }
}; 