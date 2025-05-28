import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS enabled' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    console.log('Request body:', body);
    const { userID } = body;

    if (!userID) {
      console.error('UserID is missing in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'User ID is required'
        })
      };
    }

    // Get current user status
    const getParams = {
      TableName: 'user_data',
      Key: { userID }
    };
    console.log('Get params:', getParams);

    const getResult = await docClient.send(new GetCommand(getParams));
    console.log('Get result:', getResult);
    
    const user = getResult.Item;
    if (!user) {
      console.error('User not found:', userID);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'User not found'
        })
      };
    }

    // Toggle isActive status
    const newStatus = !user.isActive;
    console.log('Status change:', { 
      userID: user.userID,
      email: user.email,
      currentStatus: user.isActive, 
      newStatus 
    });

    // Update user status
    const updateParams = {
      TableName: 'user_data',
      Key: { userID },
      UpdateExpression: 'SET isActive = :isActive',
      ExpressionAttributeValues: {
        ':isActive': newStatus
      },
      ReturnValues: 'ALL_NEW'
    };
    console.log('Update params:', updateParams);

    const updateResult = await docClient.send(new UpdateCommand(updateParams));
    console.log('Update result:', updateResult);

    if (!updateResult.Attributes) {
      console.error('Update failed - no attributes returned');
      throw new Error('Failed to update user status');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updateResult.Attributes;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword
      })
    };

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
  