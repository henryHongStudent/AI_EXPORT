import { ApiGatewayManagementApiClient, PostToConnectionCommand, DeleteConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { prompt } from "./prompt.mjs";
import axios from "axios";

const ENDPOINT = process.env.WEBSOCKET_ENDPOINT;
const api = new ApiGatewayManagementApiClient({ endpoint: ENDPOINT });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const s3Client = new S3Client({ region: process.env.AWS_REGION || "ap-southeast-2" });
const BUCKET_NAME = process.env.S3_BUCKET;

/**
 * Uploads a file to S3 with a unique filename
 * @param {Object} fileData - The file data object
 * @param {Buffer} fileData.content - File content as Buffer
 * @param {string} fileData.fileName - Original file name
 * @param {string} fileData.contentType - File content type
 * @param {string} fileData.username - Username for organizing files
 * @returns {Promise<Object>} - The S3 upload result
 */
export const saveToS3 = async (fileData) => {
  try {
    // Extract file information
    const { content, fileName, contentType, username } = fileData;
    
    // Validate required parameters
    if (!content || !fileName) {
      throw new Error("Missing required parameters: content or fileName");
    }
    
    // Extract the file extension from the original filename
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    // Generate a unique file ID
    const uniqueId = uuidv4();
    
    // Create a structured key for S3 (username/uniqueId_filename.ext)
    const folderPrefix = username ? `${username.replace(/[^a-zA-Z0-9]/g, '_')}/` : '';
    const key = `${folderPrefix}${uniqueId}_${fileName}`;
    
    // Determine content type if not provided
    let detectedContentType = contentType;
    if (!detectedContentType) {
      if (fileExtension === 'pdf') {
        detectedContentType = 'application/pdf';
      } else if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
        detectedContentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      } else {
        detectedContentType = 'application/octet-stream';
      }
    }
    
    // Set up S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: detectedContentType,
      ACL: 'public-read' // Make the file publicly accessible
    };
    
    // Upload to S3
    await s3Client.send(new PutObjectCommand(params));
    console.log(`File uploaded to S3: ${key}`);
    
    // Generate and return the S3 URL
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-southeast-2"}.amazonaws.com/${key}`;
    
    return {
      success: true,
      message: "File uploaded successfully",
      url: s3Url,
      key: key,
      fileName: fileName
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return {
      success: false,
      message: `Failed to upload file: ${error.message}`,
      error: error.toString()
    };
  }
};

export const disconnectClient = async (connectionId) => {
  try {
    await api.send(new DeleteConnectionCommand({ ConnectionId: connectionId }));
    console.log("WebSocket 연결 강제 종료:", connectionId);
  } catch (error) {
    console.error("WebSocket 연결 종료 실패:", error);
  }
};

export const sendMessage = async (connectionId, message) => {
  try {
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    });
    
    await api.send(command);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

export const broadcastMessage = async (connections, message) => {
  const promises = connections.map(({ connectionId }) => 
    sendMessage(connectionId, message)
  );
  
  await Promise.all(promises);
};

/**
 * Handles multipart/form-data file uploads
 * @param {Object} event - API Gateway event
 * @param {string} connectionId - WebSocket connection ID
 * @returns {Promise<Object>} - Upload result
 */
export const handleFormDataUpload = async (event, connectionId) => {
  try {
    console.log("Form-data 업로드 처리 시작");
    
    // Parse multipart/form-data
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw new Error("Content-Type must be multipart/form-data");
    }
    
    // Extract boundary from content type
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      throw new Error("Boundary not found in Content-Type header");
    }
    
    // Parse form data parts
    const parts = parseMultipartFormData(event.body, boundary);
    console.log(`Found ${parts.length} parts in form data`);
    
    // Extract job ID and username from form fields
    let jobId = null;
    let username = null;
    const files = [];
    
    for (const part of parts) {
      if (part.filename) {
        // This is a file
        files.push({
          content: part.data,
          fileName: part.filename,
          contentType: part.contentType
        });
      } else if (part.name === 'jobId') {
        jobId = part.data.toString('utf8');
      } else if (part.name === 'username') {
        username = part.data.toString('utf8');
      }
    }
    
    if (!jobId) {
      jobId = uuidv4(); // Generate a job ID if not provided
    }
    
    // Send upload started notification
    await sendMessage(connectionId, {
      type: "UPLOAD_STARTED",
      jobId: jobId,
      message: "파일 업로드 시작",
      fileCount: files.length
    });
    
    // Process each file
    const uploadResults = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`파일 업로드 시작 [${i}]:`, file.fileName);
      
      // Send uploading notification
      await sendMessage(connectionId, {
        type: "UPLOADING_FILE",
        jobId: jobId,
        fileName: file.fileName,
        status: "uploading",
        index: i
      });
      
      try {
        // Upload file to S3
        const uploadResult = await saveToS3({
          content: file.content,
          fileName: file.fileName,
          contentType: file.contentType,
          username: username
        });
        
        if (uploadResult.success) {
          uploadResults.push({
            fileName: file.fileName,
            pdfUrl: uploadResult.url,
            key: uploadResult.key,
            success: true
          });
          
          // Send file uploaded notification
          await sendMessage(connectionId, {
            type: "FILE_UPLOADED",
            jobId: jobId,
            fileName: file.fileName,
            status: "uploaded",
            url: uploadResult.url,
            key: uploadResult.key,
            index: i
          });
        } else {
          uploadResults.push({
            fileName: file.fileName,
            error: uploadResult.message,
            success: false
          });
          
          // Send file upload error notification
          await sendMessage(connectionId, {
            type: "FILE_UPLOAD_ERROR",
            jobId: jobId,
            fileName: file.fileName,
            status: "error",
            error: uploadResult.message,
            index: i
          });
        }
      } catch (error) {
        console.error("파일 업로드 에러:", error);
        uploadResults.push({
          fileName: file.fileName,
          error: error.message,
          success: false
        });
        
        await sendMessage(connectionId, {
          type: "FILE_UPLOAD_ERROR",
          jobId: jobId,
          fileName: file.fileName,
          status: "error",
          error: error.message,
          index: i
        });
      }
    }
    
    // Send upload completed notification
    await sendMessage(connectionId, {
      type: "UPLOAD_COMPLETED",
      jobId: jobId,
      results: uploadResults
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        type: "SUCCESS",
        message: "모든 파일 업로드 완료",
        jobId: jobId,
        results: uploadResults
      })
    };
  } catch (error) {
    console.error("Form-data 업로드 처리 에러:", error);
    await sendMessage(connectionId, {
      type: "ERROR",
      message: error.message
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        type: "ERROR",
        message: error.message
      })
    };
  }
};

/**
 * Parse multipart/form-data from request body
 * @param {string|Buffer} body - Request body
 * @param {string} boundary - Form data boundary
 * @returns {Array} - Array of parsed parts
 */
function parseMultipartFormData(body, boundary) {
  // Convert body to buffer if it's a string
  const bodyBuffer = typeof body === 'string' ? Buffer.from(body, 'base64') : body;
  
  // Split body by boundary
  const boundaryBuffer = Buffer.from(`--${boundary}`, 'utf8');
  const parts = [];
  let startPos = 0;
  let endPos = bodyBuffer.indexOf(boundaryBuffer);
  
  while (endPos !== -1) {
    // Skip the first boundary
    startPos = endPos + boundaryBuffer.length;
    
    // Find the next boundary
    endPos = bodyBuffer.indexOf(boundaryBuffer, startPos);
    
    if (endPos === -1) break;
    
    // Extract part content
    const partContent = bodyBuffer.slice(startPos, endPos);
    
    // Parse part headers and data
    const headerEndPos = partContent.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEndPos !== -1) {
      const headers = partContent.slice(0, headerEndPos).toString('utf8');
      const data = partContent.slice(headerEndPos + 4); // Skip \r\n\r\n
      
      // Parse Content-Disposition header
      const contentDisposition = headers.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i);
      const contentType = headers.match(/Content-Type: ([^\r\n]+)/i);
      
      if (contentDisposition) {
        parts.push({
          name: contentDisposition[1],
          filename: contentDisposition[2] || null,
          contentType: contentType ? contentType[1] : null,
          data: data
        });
      }
    }
  }
  
  return parts;
}

export const handleMessage = async (connectionId, message) => {
  console.log("handleMessage 진입:", { connectionId, message });
  try {
    const data = JSON.parse(message);
    console.log("Parsed data:", data);

    // 파일 업로드 처리
    if (data.type === "UPLOAD_FILE") {
      console.log("============== 파일 업로드 처리 시작 ==============");

      // 파일 업로드 시작 알림
      await sendMessage(connectionId, {
        type: "UPLOAD_STARTED",
        jobId: data.jobId || uuidv4(),
        message: "파일 업로드 시작",
        timestamp: new Date().toISOString(),
      });

      const uploadResults = [];
      const files = Array.isArray(data.files) ? data.files : [data.files];
      console.log(`처리할 파일 수: ${files.length}`);

      // 각 파일 처리
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`============== 파일 업로드 [${i}/${files.length}] ==============`);
        console.log(`파일명: ${file.fileName}`);

        // 업로드 진행 상태 알림
        await sendMessage(connectionId, {
          type: "UPLOADING_FILE",
          jobId: data.jobId,
          fileName: file.fileName,
          status: "uploading",
          index: i,
          total: files.length,
          timestamp: new Date().toISOString(),
        });

        try {
          console.log(`파일 내용 길이(base64): ${file.base64Content.length}`);
          // S3에 파일 업로드
          const uploadResult = await saveToS3({
            content: Buffer.from(file.base64Content, "base64"),
            fileName: file.fileName,
            contentType: file.contentType,
            username: data.username,
          });

          if (uploadResult.success) {
            console.log(`파일 업로드 성공: ${file.fileName}`);
            uploadResults.push({
              fileName: file.fileName,
              pdfUrl: uploadResult.url,
              key: uploadResult.key,
              success: true,
            });

            // 파일 업로드 완료 알림
            await sendMessage(connectionId, {
              type: "FILE_UPLOADED",
              jobId: data.jobId,
              fileName: file.fileName,
              status: "uploaded",
              url: uploadResult.url,
              key: uploadResult.key,
              index: i,
              total: files.length,
              timestamp: new Date().toISOString(),
            });

            // 업로드 완료 후 자동으로 OpenAI 처리 시작
            console.log(`============== OpenAI 처리 시작: ${file.fileName} ==============`);
            try {
              // OpenAI API 호출
              try {
                // 이미지 URL에서 base64 데이터 가져오기
                const imageResponse = await axios.get(uploadResult.url, { responseType: 'arraybuffer' });
                const base64Image = Buffer.from(imageResponse.data).toString('base64');
                const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
                const dataUrl = `data:${mimeType};base64,${base64Image}`;

                const response = await openai.chat.completions.create({
                  model: "gpt-4o-mini",
                  messages: [
                    {
                      role: "user",
                      content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: dataUrl } },
                      ],
                    },
                  ],
                  response_format: { type: "json_object" },
                });

                const result = response.choices[0]?.message?.content;
                console.log("OpenAI 응답:", result);

                let parsedResult;
                try {
                  parsedResult = JSON.parse(result);
                  console.log("Parsed Result:", parsedResult);
                } catch (e) {
                  console.error("Error parsing result as JSON:", e);
                  throw new Error("Failed to parse OpenAI response as JSON");
                }

                if (parsedResult && parsedResult.documentType) {
                  console.log("Document Type:", parsedResult.documentType);
                  await sendMessage(connectionId, {
                    type: "OPENAI_PROCESSING_PROGRESS",
                    jobId: data.jobId,
                    fileName: file.fileName,
                    status: "processing",
                    documentType: parsedResult.documentType,
                    timestamp: new Date().toISOString(),
                  });
                }

                // OpenAI 처리 완료 알림
                await sendMessage(connectionId, {
                  type: "OPENAI_PROCESSING_COMPLETED",
                  jobId: data.jobId,
                  fileName: file.fileName,
                  status: "completed",
                  result: parsedResult,
                  hasError: parsedResult.totalError && parsedResult.totalError.length > 0,
                  documentType: parsedResult.documentType,
                  timestamp: new Date().toISOString(),
                });

              } catch (openaiError) {
                console.error("OpenAI 처리 에러:", openaiError);
                await sendMessage(connectionId, {
                  type: "OPENAI_PROCESSING_ERROR",
                  jobId: data.jobId,
                  fileName: file.fileName,
                  status: "error",
                  error: openaiError.message,
                  timestamp: new Date().toISOString(),
                });
              }
            } catch (error) {
              console.error(`============== 파일 업로드 예외 발생 [${i}] ==============`, error);
              uploadResults.push({
                fileName: file.fileName,
                error: error.message,
                success: false,
              });

              await sendMessage(connectionId, {
                type: "FILE_UPLOAD_ERROR",
                jobId: data.jobId,
                fileName: file.fileName,
                status: "error",
                error: error.message,
                index: i,
                total: files.length,
                timestamp: new Date().toISOString(),
              });
            }
          } else {
            console.error(`파일 업로드 실패: ${file.fileName}`, uploadResult.message);
            uploadResults.push({
              fileName: file.fileName,
              error: uploadResult.message,
              success: false,
            });

            // 파일 업로드 실패 알림
            await sendMessage(connectionId, {
              type: "FILE_UPLOAD_ERROR",
              jobId: data.jobId,
              fileName: file.fileName,
              status: "error",
              error: uploadResult.message,
              index: i,
              total: files.length,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`============== 파일 업로드 예외 발생 [${i}] ==============`, error);
          uploadResults.push({
            fileName: file.fileName,
            error: error.message,
            success: false,
          });

          await sendMessage(connectionId, {
            type: "FILE_UPLOAD_ERROR",
            jobId: data.jobId,
            fileName: file.fileName,
            status: "error",
            error: error.message,
            index: i,
            total: files.length,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 모든 파일 업로드 완료 알림
      console.log("============== 모든 파일 업로드 완료 ==============");
      await sendMessage(connectionId, {
        type: "UPLOAD_COMPLETED",
        jobId: data.jobId,
        results: uploadResults,
        timestamp: new Date().toISOString(),
      });

      return {
        type: "SUCCESS",
        message: "모든 파일 업로드 및 OpenAI 처리 완료",
        uploadResults: uploadResults,
      };
    }

    if (data.type === "START_PROCESSING") {
      console.log("START_PROCESSING 시작");
      // 1. 처리 시작 알림
      await sendMessage(connectionId, {
        type: "PROCESSING_STARTED",
        jobId: data.jobId,
        message: "문서 처리 시작"
      });

      // 2. 파일별로 처리
      const results = [];
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        console.log(`파일 처리 시작 [${i}]:`, file);
        await sendMessage(connectionId, {
          type: "PROCESSING_FILE",
          jobId: data.jobId,
          fileName: file.fileName || file.imageName,
          status: "processing",
          index: i
        });

        try {
          // 파일 URL 확인
          const pdfUrl = file.pdfUrl || file.url;
          if (!pdfUrl) {
            throw new Error("파일 URL이 제공되지 않았습니다.");
          }
          
          console.log("OpenAI Vision API 호출 준비:", pdfUrl);
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: pdfUrl } }
                ]
              }
            ],
            response_format: { type: "json_object" }
          });
          console.log("OpenAI Vision API 응답:", JSON.stringify(response));

          const result = response.choices[0]?.message?.content;
          results.push({
            name: file.fileName || file.imageName,
            data: result ? JSON.parse(result) : null
          });

          // 3. 파일 처리 완료 알림
          await sendMessage(connectionId, {
            type: "FILE_PROCESSED",
            jobId: data.jobId,
            fileName: file.fileName || file.imageName,
            status: "done",
            result: result ? JSON.parse(result) : null,
            index: i
          });
        } catch (error) {
          console.error("OpenAI Vision API 호출 에러:", error);
          results.push({
            name: file.fileName || file.imageName,
            error: error.message
          });
          await sendMessage(connectionId, {
            type: "FILE_ERROR",
            jobId: data.jobId,
            fileName: file.fileName || file.imageName,
            status: "error",
            error: error.message,
            index: i
          });
        }
      }

      // 4. 전체 처리 완료 알림
      console.log("모든 파일 처리 완료");
      await sendMessage(connectionId, {
        type: "PROCESSING_COMPLETED",
        jobId: data.jobId,
        results
      });
      await disconnectClient(connectionId);

      return {
        type: "SUCCESS",
        message: "모든 파일 처리 완료"
      };
    }

    // 테스트용 PING 메시지 처리
    if (data.type === "PING") {
      console.log("PING 메시지 수신");
      return {
        type: "PONG",
        message: "pong!"
      };
    }
    
    // 메시지 타입에 따른 처리
    switch (data.type) {
      case "GET_STATUS":
        console.log("GET_STATUS 메시지 수신");
        // 상태 조회 로직
        return {
          type: "STATUS_UPDATE",
          jobId: data.jobId,
          status: "processing" // 실제 상태값으로 대체
        };
        
      default:
        console.log("Unknown message type:", data.type);
        return {
          type: "ERROR",
          message: "Unknown message type"
        };
    }
  } catch (error) {
    console.error("handleMessage 최상위 에러:", error);
    await sendMessage(connectionId, {
      type: "ERROR",
      message: error.message
    });
    await disconnectClient(connectionId);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
        stack: error.stack
      }),
    };
  }
};