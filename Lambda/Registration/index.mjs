import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: "ap-southeast-2" });
const ddb = DynamoDBDocumentClient.from(client);

// 입력값 유효성 검사
function validateInput({ name, email, password, confirmPassword }) {
  const trimmed = {
    name: name?.trim(),
    email: email?.trim(),
    password: password,
    confirmPassword: confirmPassword,
  };

  for (const [key, value] of Object.entries(trimmed)) {
    if (!value) return `${key} is required`;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed.email)) {
    return "Invalid email format";
  }

  const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
  if (!pwRegex.test(trimmed.password)) {
    return "Password must be at least 8 characters with 1 uppercase and 1 special character";
  }

  // 비밀번호와 확인 비밀번호 일치 여부 확인
  if (trimmed.password !== trimmed.confirmPassword) {
    return "Password and confirm password do not match";
  }

  return null;
}

// 이메일 중복 검사
async function isDuplicate(email) {
  const scanParams = {
    TableName: "user_data",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const result = await ddb.send(new ScanCommand(scanParams));
  return result.Items.length > 0;
}

// 날짜를 dd.MMM.yy 형식으로 변환 (월을 영문 약어로 변환)
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

// Lambda 핸들러
export const handler = async (event) => {
  const error = validateInput(event);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error }),
    };
  }

  const { name, email, password, address, profilePicture, phoneNumber, companyName } = event;

  try {
    const trimmedEmail = email.trim(); // 이메일 공백 제거

    // 이메일 중복 검사
    const duplicate = await isDuplicate(trimmedEmail);
    if (duplicate) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email already exists" }),
      };
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 가입일자 dd.MMM.yy 형식으로 변환
    const joinDate = formatDate(new Date());

    // 유저 객체 생성
    const newUser = {
      userID: uuidv4(), // UUID로 유저 ID 생성
      name: name.trim(),
      email: trimmedEmail, // 암호화 없이 이메일 저장
      password: hashedPassword, // 해시화된 비밀번호
      address: address?.trim() || null, // 주소 (선택 사항)
      profilePicture: profilePicture || null, // 프로파일 사진 (선택 사항)
      phoneNumber: phoneNumber || null, // 핸드폰 번호 (선택 사항)
      companyName: companyName || null, // 회사 이름 (선택 사항)
      joinDate: joinDate, // 가입 일자 (dd.MMM.yy 형식)
      isAdmin: false,
      isActive: true,
    };

    const params = {
      TableName: "user_data",
      Item: newUser,
    };

    // DynamoDB에 데이터 저장
    await ddb.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User saved successfully!" }),
    };
  } catch (error) {
    console.error("Error saving user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to save user", error }),
    };
  }
};
