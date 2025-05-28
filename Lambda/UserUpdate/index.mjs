import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: "ap-southeast-2" });
const ddb = DynamoDBDocumentClient.from(client);

// S3 클라이언트
const s3Client = new S3Client({ region: "ap-southeast-2" });
const BUCKET_NAME = process.env.PROFILE_IMAGES_BUCKET;

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,PUT',

};

// 입력값 유효성 검사
function validateInput({ userID }) {
  if (!userID) {
    return "userID is required";
  }
  return null;
}

// 사용자 정보 가져오기
async function getUserById(userID) {
  const params = {
    TableName: "user_data",
    Key: {
      userID: userID,
    },
  };

  const result = await ddb.send(new GetCommand(params));
  return result.Item;
}

// S3에 이미지 업로드
async function uploadImageToS3(imageData, userID) {
  try {
    // Base64 이미지 데이터에서 실제 이미지 데이터 추출
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 파일 확장자 추출
    const fileExtension = imageData.split(';')[0].split('/')[1];
    
    // 고유한 파일명 생성
    const fileName = `${userID}/${uuidv4()}.${fileExtension}`;
    
    // S3에 업로드
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: `image/${fileExtension}`,
      ACL: 'public-read'
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // S3 URL 반환
    return `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw new Error("Failed to upload image");
  }
}

// 사용자 정보 업데이트
async function updateUser(userID, updateData) {
  // 기존 사용자 정보 확인
  const existingUser = await getUserById(userID);
  if (!existingUser) {
    return {
      success: false,
      message: "User not found",
    };
  }

  // 이메일 변경 시도 차단
  if (updateData.email && updateData.email !== existingUser.email) {
    return {
      success: false,
      message: "Email cannot be changed",
    };
  }

  // 비밀번호 변경 시 해시화
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // 프로필 이미지가 있는 경우 S3에 업로드
  if (updateData.profileImage) {
    try {
      const imageUrl = await uploadImageToS3(updateData.profileImage, userID);
      updateData.profileImageUrl = imageUrl;
      delete updateData.profileImage; // 원본 이미지 데이터 제거
    } catch (error) {
      return {
        success: false,
        message: "Failed to upload profile image",
      };
    }
  }

  // 업데이트할 필드 준비
  const updateFields = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined && key !== "email") {
      updateFields.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
  });

  // 업데이트할 필드가 없는 경우
  if (updateFields.length === 0) {
    return {
      success: true,
      message: "No fields to update",
    };
  }

  // 업데이트 명령 구성
  const updateParams = {
    TableName: "user_data",
    Key: {
      userID: userID,
    },
    UpdateExpression: `SET ${updateFields.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  // DynamoDB 업데이트 실행
  const result = await ddb.send(new UpdateCommand(updateParams));

  return {
    success: true,
    message: "User updated successfully",
    user: result.Attributes,
  };
}

// Lambda 핸들러
export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    console.log('Parsing request body');
    const body = JSON.parse(event.body);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const error = validateInput(body);
    if (error) {
      console.log('Validation error:', error);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: error }),
      };
    }

    const { userID, ...updateData } = body;
    console.log('Updating user with data:', JSON.stringify(updateData, null, 2));

    // 사용자 업데이트
    const result = await updateUser(userID, updateData);
    console.log('Update result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: result.message }),
      };
    }

    // 비밀번호 정보 제외
    if (result.user && result.user.password) {
      const { password, ...userWithoutPassword } = result.user;
      result.user = userWithoutPassword;
    }

    const response = {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result),
    };
    console.log('Sending response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to update user", error: error.message }),
    };
  }
}; 