import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const token_expries = process.env.TOKEN_EXPIRY;

const client = new DynamoDBClient({ region: process.env.region });
const ddb = DynamoDBDocumentClient.from(client);

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

export const handler = async (event) => {
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  const error = validateInput(body);
  if (error) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: error }),
    };
  }

  const { email, password } = body;

  try {
    const trimmedEmail = email.trim();

    const user = await findUserByEmail(trimmedEmail);

    if (!user) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    if (user.isActive === false) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: JSON.stringify({
          message:
            "This account has been deactivated. Please contact the administrator.",
          user: {
            ...user,
            password: undefined,
          },
        }),
      };
    }

    const token = jwt.sign(
      {
        userID: user.userID,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: token_expries }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({
        message: "Login successful",
        token,
        user: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({
        message: "Failed to login",
        error: error.message,
      }),
    };
  }
};
