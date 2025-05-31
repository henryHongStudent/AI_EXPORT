import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Create DynamoDB client
const client = new DynamoDBClient({ region: process.env.region });
const ddb = DynamoDBDocumentClient.from(client);

// Validate user input
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
    return "Password must be at least 8 characters long and include at least one uppercase letter and one special character";
  }

  // Check if password and confirmPassword match
  if (trimmed.password !== trimmed.confirmPassword) {
    return "Password and confirm password do not match";
  }

  return null;
}

// Check for duplicate email
async function isDuplicate(email) {
  const scanParams = {
    TableName: process.env.DATABASE,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const result = await ddb.send(new ScanCommand(scanParams));
  return result.Items.length > 0;
}

// Format date to dd.MMM.yy (e.g., 28.May.25)
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

// Lambda handler
export const handler = async (event) => {
  const error = validateInput(event);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error }),
    };
  }

  const {
    name,
    email,
    password,
    address,
    profilePicture,
    phoneNumber,
    companyName,
  } = event;

  try {
    const trimmedEmail = email.trim(); // Remove whitespace from email

    // Check if email already exists
    const duplicate = await isDuplicate(trimmedEmail);
    if (duplicate) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email already exists" }),
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate formatted join date
    const joinDate = formatDate(new Date());

    // Create new user object
    const newUser = {
      userID: uuidv4(),
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      address: address?.trim() || null,
      profilePicture: profilePicture || null,
      phoneNumber: phoneNumber || null,
      companyName: companyName || null,
      joinDate: joinDate,
      isAdmin: false,
      isActive: true,
    };

    const params = {
      TableName: process.env.DATABASE,
      Item: newUser,
    };

    // Save user to DynamoDB
    await ddb.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User registered successfully." }),
    };
  } catch (error) {
    console.error("Error saving user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while registering the user.",
        error,
      }),
    };
  }
};
