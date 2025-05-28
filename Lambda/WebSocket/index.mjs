// @ts-check
// Lambda ES Module configuration
import { connect, disconnect } from "./connection.mjs";
import { handleMessage } from "./message.mjs";

console.log("Lambda 진입!");

export const handler = async (event) => {
  const { connectionId, eventType } = event.requestContext;

  console.log("event", event);
  console.log("event.requestContext", event.requestContext);

  try {
    switch (eventType) {
      case "CONNECT":
        return await connect(connectionId);

      case "DISCONNECT":
        return await disconnect(connectionId);

      case "MESSAGE":
        console.log("message started");
        try {
          const message = JSON.parse(event.body);
          await handleMessage(connectionId, JSON.stringify(message));
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Message processed" }),
          };
        } catch (messageError) {
          console.error("Message handling error:", messageError);
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid message format", error: messageError.message }),
          };
        }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Unsupported event type" }),
        };
    }
  } catch (error) {
    console.error("WebSocket handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
