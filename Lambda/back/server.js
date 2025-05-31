// backend/index.js
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const app = express();
const NodeCache = require("node-cache");
const FormData = require("form-data");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const promptText = require("./promptText");
const {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { error } = require("console");

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create document client for easier data manipulation
const ddb = DynamoDBDocumentClient.from(dynamoClient);

// Store extracted data in DynamoDB
const storeInDynamoDB = async (userId, fileId, fileName, data) => {
  const params = {
    TableName: process.env.DYNAMODB_INVOICE_DATA_TABLE,
    Item: {
      userId: { S: userId },
      fileId: { S: fileId },
      fileName: { S: fileName },
      data: { S: JSON.stringify(data) },
      createdAt: { S: new Date().toISOString() },
    },
  };

  try {
    await dynamoClient.send(new PutItemCommand(params));
  } catch (error) {
    throw error;
  }
};

// Store analysis results in S3
const storeInS3 = async (userId, fileId, data) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${userId}/${fileId}/analysis.json`,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (error) {
    throw error;
  }
};

// Store file metadata in DynamoDB
const storeFileMetadata = async (
  userId,
  fileId,
  fileName,
  fileType,
  fileSize
) => {
  const params = {
    TableName: process.env.DYNAMODB_FILES_TABLE,
    Item: {
      userId: { S: userId },
      fileId: { S: fileId },
      fileName: { S: fileName },
      fileType: { S: fileType },
      fileSize: { N: fileSize.toString() },
      createdAt: { S: new Date().toISOString() },
      status: { S: "active" },
    },
  };

  try {
    await dynamoClient.send(new PutItemCommand(params));
  } catch (error) {
    throw error;
  }
};

// Store original file content in S3
const storeFileContent = async (
  userId,
  fileId,
  fileName,
  fileContent,
  fileType
) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${userId}/${fileId}/${fileName}`,
    Body: fileContent,
    ContentType: fileType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (error) {
    throw error;
  }
};

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Get all users from DynamoDB
app.get("/api/users", async (req, res) => {
  try {
    const params = {
      TableName: "user_data",
    };

    const result = await dynamoClient.send(new ScanCommand(params));

    if (!result.Items) {
      return res.json({ users: [] });
    }

    const users = result.Items.map((item) => ({
      userID: item.userID?.S || "",
      email: item.email?.S || "",
      name: item.name?.S || "",
      isAdmin: item.isAdmin?.BOOL || false,
      isActive: item.isActive?.BOOL || true,
      createdAt: item.createdAt?.S || new Date().toISOString(),
    }));

    res.json({ users });
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      return res.status(404).json({
        error: "Users table not found",
        message: "The users table does not exist in DynamoDB",
      });
    }

    res.status(500).json({
      error: "Failed to fetch users",
      message: error.message,
    });
  }
});

const temporaryStorage = multer.memoryStorage();
const uploadPDF = multer({ storage: temporaryStorage }).array("files", 100);
const billCache = new NodeCache();

// OpenAI Vision API prompt for document analysis
const prompt = `
Analyze the document using OpenAI Vision to determine the type of document and extract as much data as possible. Organize the data into a JSON format with key-value pairs. At the root level, include a key called documentType that indicates the type of the document (e.g., invoice, contract, receipt, etc.).

Use a key-value structure where:

Keys represent labels (e.g., name, date, address, etc.)
Values represent the corresponding data extracted.
If there are multiple entries under a category (e.g., items), organize them as an array of objects, where each object contains the extracted data for that item.
Error Handling:

If the extracted data has a confidence level of 80% or below, mark the entry with an error field set to true and include an errorMessage explaining the issue (e.g., "low confidence", "missing text", "could not recognize").
If the confidence level is above 80%, set the error field to false.

If no errors are found in any of the data, the totalError field should be an empty array at the root level. If there are errors in any field, include those keys in the totalError array.
Items Structure:
If items that represent categories or tables with multiple entries , return key is "items" and value is an array of objects. Each object contains the extracted data for that item.
For each item in the array, provide the extracted data for that item, following the same structure as for other data points.
all object must have value property if value is not provided store as empty string.

Also must include total accuracy of the document in the accuracy field at the root level as key: accuracy, 
and value (xx )is the accuracy of the document.
`;

let progressCallback = null;
let progressUpdates = [];

// Process document using OpenAI Vision API
const connectOpenAI = async (imageUrl, imageName) => {
  try {
    progressCallback(imageName, "Extracting", false, null);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = response.choices[0].message.content;
    let parsedResult = JSON.parse(result);

    if (parsedResult && parsedResult.documentType) {
      progressCallback(
        imageName,
        "Extracting",
        false,
        parsedResult.documentType
      );
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (parsedResult.totalError && parsedResult.totalError.length > 0) {
          progressCallback(
            imageName,
            "Completed",
            true,
            parsedResult.documentType
          );
        } else {
          progressCallback(
            imageName,
            "Completed",
            false,
            parsedResult.documentType
          );
        }

        resolve(result);
      }, 4000);
    });
  } catch (error) {
    progressCallback(imageName, "Error", true, null);
    throw error;
  }
};

// Initialize S3 client
const s3Client = new S3Client({
  region: `${process.env.AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  },
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Server is running!");
  return res.json({ message: "Server is running on port 3000" });
});

// SSE endpoint for progress updates
app.get("/api/progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  progressCallback = (fileName, step, error, documentType) => {
    const update = {
      name: fileName,
      step: step,
      error: error,
      type: documentType,
    };
    progressUpdates.push(update);
    res.write(`data: ${JSON.stringify(progressUpdates)}\n\n`);
  };

  req.on("close", () => {
    progressCallback = null;
    progressUpdates = [];
  });
});

// File upload and processing endpoint
app.post("/api/upload", async (req, res) => {
  const files = req.body.files;
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (!progressCallback) {
    return res.status(400).json({ message: "Progress stream not initialized" });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files provided" });
  }

  try {
    const processFile = async (file) => {
      const { imageName, imageData } = file;
      const fileId = uuidv4();
      const removeHeader = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      const fileContent = Buffer.from(removeHeader, "base64");
      const fileType = imageData.split(";")[0].split(":")[1];

      try {
        progressCallback(imageName, "Uploading");
        await storeFileContent(
          userId,
          fileId,
          imageName,
          fileContent,
          fileType
        );
        await storeFileMetadata(
          userId,
          fileId,
          imageName,
          fileType,
          fileContent.length
        );

        const formData = new FormData();
        formData.append("image", fileContent, imageName);
        formData.append("name", imageName);

        const response = await axios.post(
          "https://api.imgbb.com/1/upload",
          formData,
          {
            params: { key: process.env.IMGBB_API_KEY },
            headers: formData.getHeaders(),
          }
        );

        if (response.status === 200 && response.data && response.data.data) {
          progressCallback(imageName, "Uploaded");

          const uploadResult = {
            name: imageName,
            url: response.data.data.url,
            display_url: response.data.data.display_url,
            fileId: fileId,
          };

          try {
            const openAIResponse = await connectOpenAI(
              uploadResult.display_url,
              imageName
            );

            const parsedData = JSON.parse(openAIResponse);
            uploadResult.data = parsedData;

            await storeInS3(userId, fileId, parsedData);
            await storeInDynamoDB(userId, fileId, imageName, parsedData);
          } catch (error) {
            uploadResult.error = error.message;
          }

          return uploadResult;
        } else {
          throw new Error("Unexpected response format from ImgBB");
        }
      } catch (error) {
        return { name: imageName, error: error.message };
      }
    };

    const uploadResults = await Promise.all(files.map(processFile));
    res
      .status(200)
      .json({ message: "Files processed", results: uploadResults });
  } catch (error) {
    res
      .status(500)
      .json({ message: "File upload failed.", error: error.message });
  }
});

// Get user's file list
app.get("/api/files/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const params = {
      TableName: process.env.DYNAMODB_FILES_TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": { S: userId } },
    };
    const result = await dynamoClient.send(new QueryCommand(params));
    const files = (result.Items || []).map((item) => ({
      fileId: item.fileId.S,
      fileName: item.fileName.S,
      createdAt: item.createdAt.S,
    }));
    res.json({ files });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching files", error: error.message });
  }
});

// Get dashboard data for user
app.get("/api/dashboard/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const filesTableName = process.env.DYNAMODB_FILES_TABLE;
    const invoiceDataTableName = process.env.DYNAMODB_INVOICE_DATA_TABLE;

    if (!filesTableName || !invoiceDataTableName) {
      return res.status(500).json({ error: "Database configuration error" });
    }

    const totalFilesQuery = {
      TableName: filesTableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    const totalFilesResult = await dynamoClient.send(
      new QueryCommand(totalFilesQuery)
    );

    if (!totalFilesResult.Items || totalFilesResult.Items.length === 0) {
      return res.json({
        totalFiles: { count: 0, change: 0, increasedSinceLastWeek: true },
        processedToday: { count: 0, change: 0, increasedSinceLastWeek: true },
        averageAccuracy: {
          percentage: 0,
          change: 0,
          increasedSinceLastWeek: true,
        },
        recentDocuments: [],
      });
    }

    const totalFiles = totalFilesResult.Items.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFiles = totalFilesResult.Items.filter(
      (item) => new Date(item.createdAt.S) >= today
    ).length;

    const accuracyQuery = {
      TableName: invoiceDataTableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    const accuracyResult = await dynamoClient.send(
      new QueryCommand(accuracyQuery)
    );

    const accuracies = accuracyResult.Items.map((item) => {
      try {
        const data = JSON.parse(item.data.S);
        return typeof data.accuracy === "number" ? data.accuracy : null;
      } catch (e) {
        return null;
      }
    }).filter((acc) => acc !== null);

    const averageAccuracy =
      accuracies.length > 0
        ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
        : 0;

    const recentDocuments = totalFilesResult.Items.sort(
      (a, b) => new Date(b.createdAt.S) - new Date(a.createdAt.S)
    )
      .slice(0, 5)
      .map((item) => {
        try {
          const accuracyItem = accuracyResult.Items.find(
            (acc) => acc.fileId.S === item.fileId.S
          );
          const accuracy = accuracyItem
            ? JSON.parse(accuracyItem.data.S || '{"accuracy": 0}').accuracy || 0
            : 0;

          return {
            fileId: item.fileId.S,
            fileName: item.fileName.S,
            createdAt: item.createdAt.S,
            status: item.status.S,
            accuracy: accuracy,
          };
        } catch (e) {
          return {
            fileId: item.fileId.S,
            fileName: item.fileName.S,
            createdAt: item.createdAt.S,
            status: item.status.S,
            accuracy: 0,
          };
        }
      });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekFiles = totalFilesResult.Items.filter(
      (item) =>
        new Date(item.createdAt.S) >= lastWeek &&
        new Date(item.createdAt.S) < today
    ).length;

    const response = {
      totalFiles: {
        count: totalFiles,
        change:
          lastWeekFiles > 0
            ? (((totalFiles - lastWeekFiles) / lastWeekFiles) * 100).toFixed(1)
            : 0,
        increasedSinceLastWeek: totalFiles > lastWeekFiles,
      },
      processedToday: {
        count: todayFiles,
        change: todayFiles,
        increasedSinceLastWeek: true,
      },
      averageAccuracy: {
        percentage: averageAccuracy.toFixed(1),
        change: 0,
        increasedSinceLastWeek: true,
      },
      recentDocuments,
    };

    res.json(response);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get file metadata
app.get("/api/files/:userId/:fileId", async (req, res) => {
  const { userId, fileId } = req.params;

  try {
    const params = {
      TableName: process.env.DYNAMODB_FILES_TABLE,
      Key: {
        userId: { S: userId },
        fileId: { S: fileId },
      },
    };

    const result = await dynamoClient.send(new GetItemCommand(params));

    if (!result.Item) {
      return res.status(404).json({ error: "File not found" });
    }

    const metadata = {
      fileName: result.Item.fileName.S,
      fileType: result.Item.fileType.S,
      fileSize: parseInt(result.Item.fileSize.N),
      createdAt: result.Item.createdAt.S,
      status: result.Item.status.S,
    };

    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch file metadata" });
  }
});

// Get extracted data for file
app.get("/api/files/:userId/:fileId/data", async (req, res) => {
  const { userId, fileId } = req.params;

  try {
    const params = {
      TableName: process.env.DYNAMODB_INVOICE_DATA_TABLE,
      Key: {
        userId: { S: userId },
        fileId: { S: fileId },
      },
    };

    const result = await dynamoClient.send(new GetItemCommand(params));

    if (!result.Item) {
      return res.status(404).json({ error: "Extracted data not found" });
    }

    const extractedData = JSON.parse(result.Item.data.S);
    res.json(extractedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch extracted data" });
  }
});

// Download file from S3
app.get("/api/files/:userId/:fileId/download", async (req, res) => {
  const { userId, fileId } = req.params;

  try {
    const metadataParams = {
      TableName: process.env.DYNAMODB_FILES_TABLE,
      Key: {
        userId: { S: userId },
        fileId: { S: fileId },
      },
    };

    const metadataResult = await dynamoClient.send(
      new GetItemCommand(metadataParams)
    );

    if (!metadataResult.Item) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileName = metadataResult.Item.fileName.S;
    const fileType = metadataResult.Item.fileType.S;

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${userId}/${fileId}/${fileName}`,
    };

    try {
      const s3Response = await s3Client.send(new GetObjectCommand(s3Params));

      res.setHeader("Content-Type", fileType);
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

      s3Response.Body.pipe(res);
    } catch (s3Error) {
      res.status(500).json({ error: "Failed to fetch file from S3" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to process file download" });
  }
});

// Update user profile
app.patch("/api/user/update", async (req, res) => {
  try {
    const { userID, name, phoneNumber, address, companyName } = req.body;

    if (!userID) {
      console.error("Missing userID in request");
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const sanitizeInput = (input) => {
      if (!input) return input;
      let sanitized = input.trim();
      sanitized = sanitized.replace(/[^가-힣a-zA-Z0-9\s]/g, "");
      return sanitized;
    };

    if (name !== undefined && name !== null) {
      const sanitizedName = sanitizeInput(name);
      if (!sanitizedName || sanitizedName.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty or contain only special characters",
        });
      }
      if (sanitizedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be less than 50 characters",
        });
      }
    }

    if (phoneNumber !== undefined && phoneNumber !== null) {
      const sanitizedPhone = sanitizeInput(phoneNumber);
      if (sanitizedPhone) {
        const numbersOnly = sanitizedPhone.replace(/\D/g, "");
        if (numbersOnly.length !== 11) {
          return res.status(400).json({
            success: false,
            message: "Phone number must be exactly 11 digits",
          });
        }
        if (!/^[0-9]+$/.test(numbersOnly)) {
          return res.status(400).json({
            success: false,
            message: "Phone number must contain only numbers",
          });
        }
      }
    }

    if (address !== undefined && address !== null) {
      const sanitizedAddress = sanitizeInput(address);
      if (sanitizedAddress) {
        if (sanitizedAddress.length > 200) {
          return res.status(400).json({
            success: false,
            message: "Address must be less than 200 characters",
          });
        }
      }
    }

    if (companyName !== undefined && companyName !== null) {
      const sanitizedCompany = sanitizeInput(companyName);
      if (sanitizedCompany && sanitizedCompany.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Company name must be less than 100 characters",
        });
      }
    }

    // Get existing user data
    const getItemParams = {
      TableName: "user_data",
      Key: { userID: { S: userID } },
    };

    const existingUser = await dynamoClient.send(
      new GetItemCommand(getItemParams)
    );

    if (!existingUser.Item) {
      console.error("User not found:", userID);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare update expression and values
    let updateExpression = "SET";
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};
    let hasUpdates = false;

    if (name !== undefined && name !== null) {
      const sanitizedName = sanitizeInput(name);
      if (sanitizedName) {
        updateExpression += " #name = :name,";
        expressionAttributeNames["#name"] = "name";
        expressionAttributeValues[":name"] = { S: sanitizedName };
        hasUpdates = true;
      }
    }

    if (phoneNumber !== undefined && phoneNumber !== null) {
      const sanitizedPhone = sanitizeInput(phoneNumber);
      if (sanitizedPhone) {
        const numbersOnly = sanitizedPhone.replace(/\D/g, "");
        updateExpression += " phoneNumber = :phoneNumber,";
        expressionAttributeValues[":phoneNumber"] = { S: numbersOnly };
        hasUpdates = true;
      }
    }

    if (address !== undefined && address !== null) {
      const sanitizedAddress = sanitizeInput(address);
      if (sanitizedAddress) {
        updateExpression += " address = :address,";
        expressionAttributeValues[":address"] = { S: sanitizedAddress };
        hasUpdates = true;
      }
    }

    if (companyName !== undefined && companyName !== null) {
      const sanitizedCompany = sanitizeInput(companyName);
      if (sanitizedCompany) {
        updateExpression += " companyName = :companyName,";
        expressionAttributeValues[":companyName"] = { S: sanitizedCompany };
        hasUpdates = true;
      }
    }

    if (!hasUpdates) {
      console.error("No valid fields to update");
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Remove trailing comma
    updateExpression = updateExpression.slice(0, -1);

    const updateParams = {
      TableName: "user_data",
      Key: { userID: { S: userID } },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoClient.send(new UpdateItemCommand(updateParams));

    if (!result.Attributes) {
      console.error("Update failed - no attributes returned");
      return res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }

    return res.json({
      success: true,
      message: "User updated successfully",
      user: unmarshall(result.Attributes),
    });
  } catch (error) {
    console.error("Error in user update:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
