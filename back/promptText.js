const promptText = `Analyse the document using OpenAI Vision to determine the type of document and extract the data into an object. Use a key-value structure where keys represent labels and values represent their corresponding data. If there are multiple data entries at the same level (e.g., three items under an 'items' category), organise them as an array of objects within the parent key. Ensure the extracted data is structured logically and consistently`;

// `Extraction Requirements
// Supplier Details
// Supplier Name (supplier_name): Extract the business name of the supplier.
// Supplier Phone (supplier_phone): Extract phone number if present.
// Supplier Email (supplier_email): Extract email if present.
// Supplier Contact Information (supplier_contact_info): A combination of supplier_phone and supplier_email.
// Invoice Details
// Reference Number (reference_number): Optional. Include only if present.
// Order Number (order_number): Optional. Include only if present.
// Invoice Number (invoice_number): Extract as-is.
// Invoice Date (invoice_date): Only date information (e.g., 01/12/2024).
// Due Date (due_date): Only date information (e.g., 15/12/2024).
// GST Number (GST_number): Optional. Include only if present.
// Itemized List (for each item): all of items in the invoice.
// Item Name/Description (item_name): Extract as-is.
// Quantity (quantity): Extract if present, if missing set value: "".
// Unit Price (unit_price): Extract if present, if missing set value: "".
// Subtotal (subtotal): Extract if present, if missing set value: "".
// Total and Subtotal Calculation:
// Subtotal (subtotal): Extracted from the document, no calculation.
// GST Amount (GST_amount): Extract if present.
// Location Details : orignal image size as width and height and using top left and bottom right create a rectangle box base on actaully image size .
// Final Total (total): Extract if present.
// Bank Details:
// Bank Account Name (bank_account_name): Extract as-is.
// Bank Name (bank_name): Extract as-is.
// Account Number (account_number): Extract with dashes (-) as in the original.

// also show how much of accuracy of this doc text extraction  ?

// Example JSON Output

// {"bill_name: "bill_name" // using imageName that provided as props
//   "image_width": 1200, //actaul width of the image
//   "image_height": 800, //actaul height of the image
// "error": give error message if any
// "accuracy":50,
//   "supplier_name": {
//     "value": "Equipt Ltd",
//     "check": true,
//     "top": 50,
//     "left": 50,
//     "bottom": 150,
//     "right": 70
//   },
//   "referece:{
//    "value": " DIGGER#8",
//     "check": true,
//     "top": 50,
//     "left": 50,
//     "bottom": 150,
//     "right": 70

//   },
//   "supplier_phone": {
//     "value": "0800467009",
//     "check": true,
//     "top": 150,
//     "left": 50,
//     "bottom": 250,
//     "right": 70
//   },
//   "supplier_email": {
//     "value": "john.smith@example.com",
//     "check": true,
//     "top": 50,
//     "left": 70,
//     "bottom": 150,
//     "right": 90
//   },
//   "GST_number": {
//     "value": "123456789",
//     "check": true,
//     "top": 150,
//     "left": 90,
//     "bottom": 250,
//     "right": 110
//   },
//   "order_number": {
//     "value": "",
//     "check": true,
//     "top": 0,
//     "left": 0,
//     "bottom": 0,
//     "right": 0
//   },
//   "invoice_number": {
//     "value": "INV4159",
//     "check": true,
//     "top": 50,
//     "left": 110,
//     "bottom": 150,
//     "right": 130
//   },
//   "invoice_date": {
//     "value": "30-Nov-24",
//     "check": true,
//     "top": 150,
//     "left": 110,
//     "bottom": 250,
//     "right": 130
//   },
//   "due_date": {
//     "value": "20-Dec-24",
//     "check": true,
//     "top": 50,
//     "left": 150,
//     "bottom": 150,
//     "right": 170
//   },
//   "items": [ ///all of items in the invoice as objects in array
//     {
//       "item_name": {
//         "value": "Thwaites MACH2298 - Hire for 1 month",
//         "check": true,
//         "top": 50,
//         "left": 170,
//         "bottom": 250,
//         "right": 190
//       },
//       "quantity": {
//         "value": "1",
//         "check": true,
//         "top": 250,
//         "left": 170,
//         "bottom": 270,
//         "right": 190
//       },
//       "unit_price": {
//         "value": "3499.00",
//         "check": true,
//         "top": 270,
//         "left": 170,
//         "bottom": 350,
//         "right": 190
//       },
//       "subtotal": {
//         "value": "3499.00",
//         "check": true,
//         "top": 350,
//         "left": 170,
//         "bottom": 400,
//         "right": 190
//       }
//     }

//   ],
//   "subtotal": {
//     "value": "4456.00",
//     "check": true,
//     "top": 50,
//     "left": 250,
//     "bottom": 150,
//     "right": 270
//   },
//   "GST_amount": {
//     "value": "668.40",
//     "check": true,
//     "top": 150,
//     "left": 250,
//     "bottom": 250,
//     "right": 270
//   },
//   "total": {
//     "value": "5124.40",
//     "check": true,
//     "top": 250,
//     "left": 250,
//     "bottom": 350,
//     "right": 270
//   },
//   "bank_account_details": {
//     "bank_account_name": {
//       "value": "Equipt Ltd",
//       "check": true,
//       "top": 50,
//       "left": 310,
//       "bottom": 150,
//       "right": 330
//     },
//     "bank_name": {
//       "value": "ANZ Bank New Zealand",
//       "check": true,
//       "top": 150,
//       "left": 310,
//       "bottom": 250,
//       "right": 330
//     },
//     "account_number": {
//       "value": "38-9025-0388719-00",
//       "check": true,
//       "top": 250,
//       "left": 310,
//       "bottom": 350,
//       "right": 330
//     }
//   },
//   "difference": {
//     "value": 0.00,
//     "check": true
//   }
// }`;
