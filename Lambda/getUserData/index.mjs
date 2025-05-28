import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: "ap-southeast-2" });
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("=== Event received ===");
  console.log(JSON.stringify(event, null, 2));
  
  try {
    // userID 추출 로직 개선
    let userID;
    
    // 1. API Gateway 요청에서 userID 추출 시도
    if (event.requestContext?.authorizer?.userID) {
      userID = event.requestContext.authorizer.userID;
    }
    // 2. 쿼리 파라미터에서 userID 추출 시도
    else if (event.queryStringParameters?.userID) {
      userID = event.queryStringParameters.userID;
    }
    // 3. 직접 Lambda 테스트에서 userID 추출 시도
    else if (event.userID) {
      userID = event.userID;
    }
    
    console.log("=== Extracted UserID ===");
    console.log(userID);
    
    if (!userID) {
      console.log("=== No userID found in any location ===");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify({ 
          success: false,
          message: "사용자 ID를 찾을 수 없습니다." 
        })
      };
    }

    // 사용자 정보 조회
    const params = {
      TableName: "user_data",
      Key: { userID: userID }
    };
    console.log("=== DynamoDB params ===");
    console.log(JSON.stringify(params, null, 2));

    const result = await ddb.send(new GetCommand(params));
    console.log("=== DynamoDB result ===");
    console.log(JSON.stringify(result, null, 2));
    
    if (!result.Item) {
      console.log("=== No user found in DynamoDB ===");
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        body: JSON.stringify({ 
          success: false,
          message: "사용자를 찾을 수 없습니다."
        })
      };
    }

    // 비밀번호 제거
    const { password, ...userWithoutPassword } = result.Item;
    console.log("=== User data without password ===");
    console.log(JSON.stringify(userWithoutPassword, null, 2));

    // Lambda Proxy Integration 응답 형식
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword
      })
    };

    console.log("=== Final Response ===");
    console.log(JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("=== Detailed error information ===");
    console.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    const errorResponse = {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
      body: JSON.stringify({ 
        success: false,
        message: "서버 오류가 발생했습니다.",
        error: error.message,
        errorType: error.name,
        errorCode: error.code
      })
    };

    console.log("=== Error Response ===");
    console.log(JSON.stringify(errorResponse, null, 2));

    return errorResponse;
  }
};
