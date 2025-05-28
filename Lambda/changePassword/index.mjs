import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;

// CORS 헤더 설정
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// 비밀번호 유효성 검사 정규식
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const handler = async (event) => {
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS enabled' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { userID, newPassword, isAdmin, targetUserID } = body;

    // 관리자가 아닌 경우 현재 비밀번호 확인 필요
    if (!isAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Admin privileges required' })
      };
    }

    // 새 비밀번호 유효성 검사
    if (!passwordRegex.test(newPassword)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters'
        })
      };
    }

    // 대상 사용자 조회
    const getCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        userID: targetUserID
      }
    });

    const result = await dynamoDB.send(getCommand);
    const user = result.Item;

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    const updateCommand = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: {
        userID: targetUserID
      },
      UpdateExpression: 'set password = :password',
      ExpressionAttributeValues: {
        ':password': hashedPassword
      },
      ReturnValues: 'ALL_NEW'
    });

    await dynamoDB.send(updateCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Password updated successfully' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 