const promptText= `
Analyze the document using OpenAI Vision to determine the type of document and extract as much data as possible. Organize the data into a JSON format with key-value pairs. At the root level, include a key called documentType that indicates the type of the document (e.g., invoice, contract, receipt, etc.).

Use a key-value structure where:

Keys represent labels (e.g., name, date, address, etc.)
Values represent the corresponding data extracted.
If there are multiple entries under a category (e.g., items), organize them as an array of objects, where each object contains the extracted data for that item.

For each extracted data point, include its location coordinates in the document using a "boundingBox" object with the following structure:
{
  "x": number, // x-coordinate of the top-left corner
  "y": number, // y-coordinate of the top-left corner
  "width": number, // width of the bounding box
  "height": number, // height of the bounding box
  "page": number // page number where the data was found (1-based)
}

Error Handling:

If the extracted data has a confidence level of 80% or below, mark the entry with an error field set to true and include an errorMessage explaining the issue (e.g., "low confidence", "missing text", "could not recognize").
If the confidence level is above 80%, set the error field to false.

If no errors are found in any of the data, the totalError field should be an empty array at the root level. If there are errors in any field, include those keys in the totalError array.

Items Structure:
If items that represent categories or tables with multiple entries, return key is "items" and value is an array of objects. Each object contains the extracted data for that item.
For each item in the array, provide the extracted data for that item, following the same structure as for other data points.
All objects must have value property if value is not provided store as empty string.

For each extracted field, ensure to include:
1. The actual value
2. Confidence score
3. Bounding box coordinates
4. Page number
5. Error status (if applicable)

Example of the expected response format:
{
  "documentType": "invoice",
  "invoiceNumber": {
    "value": "INV-2024-001",
    "confidence": 0.95,
    "boundingBox": {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 30,
      "page": 1
    }
  },
  "items": [
    {
      "description": {
        "value": "Product A",
        "confidence": 0.98,
        "boundingBox": {
          "x": 150,
          "y": 300,
          "width": 200,
          "height": 25,
          "page": 1
        }
      }
    }
  ]
}
`;