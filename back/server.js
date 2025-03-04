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

app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json({ limit: "20mb" }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
// This is only for checking Subscriber URL confirmation to the AWS SNS topic.
// app.use((req, res, next) => {
//   if (req.method === "POST") {
//     let data = "";

//     req.on("data", (chunk) => {
//       data += chunk;
//     });

//     req.on("end", () => {
//       try {
//         req.rawBody = data;
//         req.body = JSON.parse(data);
//       } catch (error) {
//         console.error("Error parsing body:", error);
//         req.body = {};
//       }
//       next();
//     });
//   } else {
//     next();
//   }
// });
const temporaryStorage = multer.memoryStorage();
const uploadPDF = multer({ storage: temporaryStorage }).array("files", 100);
const billCache = new NodeCache();
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
`;

let progressCallback = null;
let progressUpdates = [];
// Open AI Vision API
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

    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
      console.log("Parsed Result:", parsedResult);
    } catch (e) {
      console.error("Error parsing result as JSON:", e);
      return null;
    }

    if (parsedResult && parsedResult.documentType) {
      console.log("Document Type:", parsedResult.documentType);
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
    console.error("Error in connectOpenAI:", error);
    progressCallback(imageName, "Error", true, null);
    throw error;
  }
};

const s3Client = new S3Client({
  region: `${process.env.AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  },
});

app.get("/", (req, res) => {
  const string = "Server is running on port 3000";
  return res.json({ message: string });
});
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
    //
    progressUpdates.push(update);

    res.write(`data: ${JSON.stringify(progressUpdates)}\n\n`);
  };

  req.on("close", () => {
    progressCallback = null;
    progressUpdates = [];
  });
});

app.post("/api/test", uploadPDF, async (req, res) => {
  const files = req.files;
  if (!files) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  console.log("Received Files:", files);

  const fileDetails = files.map((file) => ({
    originalname: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  }));

  return res.status(200).json({ files: fileDetails });
});

app.post("/api/upload", async (req, res) => {
  const files = req.body.files;

  if (!progressCallback) {
    return res.status(400).json({ message: "Progress stream not initialized" });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files provided" });
  }

  try {
    const processFile = async (file) => {
      const { imageName, imageData } = file;
      const removeHeader = imageData.replace(/^data:image\/[a-z]+;base64,/, "");

      try {
        console.log(`Uploading ${imageName}...`);
        progressCallback(imageName, "Uploading");

        const formData = new FormData();
        formData.append(
          "image",
          Buffer.from(removeHeader, "base64"),
          imageName
        );
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
          };

          try {
            const openAIResponse = await connectOpenAI(
              uploadResult.display_url,
              imageName
            );
            uploadResult.data = JSON.parse(openAIResponse);

            // console.log(`Processed ${imageName}:`, uploadResult.data);
          } catch (error) {
            console.error(
              `Error processing image ${imageName}:`,
              error.message
            );
            uploadResult.error = error.message;
          }

          return uploadResult;
        } else {
          throw new Error("Unexpected response format from ImgBB");
        }
      } catch (error) {
        console.error(`Error uploading image ${imageName}:`, error.message);
        return { name: imageName, error: error.message };
      }
    };

    const uploadResults = await Promise.all(files.map(processFile));

    console.log("Extracting succssfully processed");
    res
      .status(200)
      .json({ message: "Files processed", results: uploadResults });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res
      .status(500)
      .json({ message: "File upload failed.", error: error.message });
  }
});

app.get("/api/textraction", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  progressCallback = (fileName, data, error, documentType) => {
    const update = {
      status: fileName,
      data: data,
    };
    progressUpdates.push(update);
    res.write(`data: ${JSON.stringify(progressUpdates)}\n\n`);
  };

  req.on("close", () => {
    progressCallback = null;
    progressUpdates = [];
  });
});

const allResult = [];

app.post("/api/aws", uploadPDF, async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    const uploadResult = [];

    for (const file of files) {
      const putParams = {
        Bucket: process.env.AWS_BILL_UPLOAD_BUCKET,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
      };

      const uploadPDF = await s3Client.send(new PutObjectCommand(putParams));

      console.log(uploadPDF);
      uploadResult.push({
        fileName: file.originalname,
        s3Key: putParams.Key,
        location: `https://${process.env.BUCKET}.s3.amazonaws.com/${putParams.Key}`,
      });
    }
    res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadResult,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "File upload failed", error });
  }
});

app.post("/api/result", async (req, res) => {
  try {
    console.log(req);
    return res.status(200).json({ message: "Result received" });
    // const fileName = req.body.name;
    // const lineItems = req.body.result.ExpenseDocuments?.[0]?.LineItemGroups;
    // const summaryFields = req.body.result.ExpenseDocuments?.[0]?.SummaryFields;

    // const result = {
    //   name: fileName,
    //   link: `https://henrybillextraction.s3.amazonaws.com/${fileName}`,
    //   lineItems,
    //   summary: summaryFields,
    // };

    // allResult.push(result);

    // if (progressCallback) {
    //   progressCallback("completed", [result]);
    // }

    // console.log(allResult);
    // res.status(200).json({
    //   message: "Successfully processed result",
    //   result: result,
    // });
  } catch (error) {
    console.error("Error processing result:", error);
    res.status(500).json({ message: "Result processing failed", error });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
