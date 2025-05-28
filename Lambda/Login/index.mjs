import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT 시크릿 키 (실제 환경에서는 환경 변수나 AWS Secrets Manager 사용 권장)
const JWT_SECRET =process.env.JWT_SECRET;
// 토큰 만료 시간 (예: 1시간)
const token_expries = process.env.TOKEN_EXPIRY;

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: process.env.region});
const ddb = DynamoDBDocumentClient.from(client);

// 입력값 유효성 검사
function validateInput({ email, password }) {
  const trimmed = {
    email: email?.trim(),
    password: password,
  };

  for (const [key, value] of Object.entries(trimmed)) {
    if (!value) return `${key} is required`;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed.email)) {
    return "Invalid email format";
  }

  return null;
}

// 사용자 검색
async function findUserByEmail(email) {
  const scanParams = {
    TableName: "user_data",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const result = await ddb.send(new ScanCommand(scanParams));
  return result.Items.length > 0 ? result.Items[0] : null;
}

// Lambda 핸들러
export const handler = async (event) => {
  // API Gateway에서 오는 경우 event.body가 문자열로 되어 있음
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  
  const error = validateInput(body);
  if (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ message: error }),
    };
  }

  const { email, password } = body;

  try {
    const trimmedEmail = email.trim(); // 이메일 공백 제거

    // 이메일로 사용자 검색
    const user = await findUserByEmail(trimmedEmail);
    
    // 사용자가 없는 경우
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    // 계정 활성화 상태 확인
    if (user.isActive === false) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify({ 
          message: "This account has been deactivated. Please contact the administrator.",
          user: {
            ...user,
            password: undefined // 비밀번호 제외
          }
        }),
      };
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userID: user.userID,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn:token_expries
      }
    );

    // 비밀번호 제외한 사용자 정보
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ 
        message: "Login successful",
        token,
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ message: "Failed to login", error: error.message })
    };
  }
};
