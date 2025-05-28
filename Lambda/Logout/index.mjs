import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand
} from "@aws-sdk/lib-dynamodb";

// CORS 헤더 변수 선언
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: process.env.region });
const ddb = DynamoDBDocumentClient.from(client);

// 입력값 유효성 검사
function validateInput({ userID }) {
  if (!userID) {
    return "userID is required";
  }
  return null;
}

// 사용자 로그아웃 처리
async function logoutUser(userID) {
  // 사용자 정보 확인
  const getParams = {
    TableName: "user_data",
    Key: {
      userID: userID
    }
  };

  const userResult = await ddb.send(new GetCommand(getParams));
  
  // 사용자가 존재하지 않는 경우
  if (!userResult.Item) {
    return {
      success: false,
      message: "User not found"
    };
  }

  // 로그아웃 시간 기록 (선택적으로 사용)
  const updateParams = {
    TableName: "user_data",
    Key: {
      userID: userID
    },
    UpdateExpression: "SET lastLogout = :time",
    ExpressionAttributeValues: {
      ":time": new Date().toISOString()
    },
    ReturnValues: "UPDATED_NEW"
  };

  await ddb.send(new UpdateCommand(updateParams));
  
  return {
    success: true,
    message: "Logged out successfully"
  };
}

// Lambda 핸들러
export const handler = async (event) => {
  console.log("Event:",event);
  const data = JSON.parse(event.body)
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
    // 로그아웃 처리
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
        message: result.message
      }),
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Failed to logout", error: error.message }),
    };
  }
}; 