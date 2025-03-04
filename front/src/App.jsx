import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePaths, setImagePaths] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);

      try {
        const convertedImages = await convertPDFToImages(selectedFile);
        setImages(convertedImages);
      } catch (err) {
        setError("PDF conversion failed: " + err.message);
        setImages([]);
      }
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
      setImages([]);
    }
  };

  const handleConfirm = async () => {
    try {
      const savedPaths = [];
      const imageName = file.name.replace(".pdf", "");

      for (let i = 0; i < images.length; i++) {
        const response = await axios.post(
          "http://localhost:3000/api/save-image",
          {
            image: images[i],
            fileName: `${imageName}.png`,
          }
        );
        savedPaths.push(response.data.path);
      }
      setImagePaths(savedPaths);
      console.log("Images saved successfully:", savedPaths);
    } catch (err) {
      console.error("Error saving images:", err);
      setError("Failed to save images. Please try again.");
    }
  };

  const convertPDFToImages = async (pdfFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          console.log("PDF file loaded...");
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          console.log("PDF document loaded, starting to render pages...");

          const imagesArray = [];
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
              console.log("Rendering page:", pageNum);
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 2.0 });
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              await page.render({
                canvasContext: context,
                viewport: viewport,
              }).promise;

              const imgURL = canvas.toDataURL("image/png");
              imagesArray.push(imgURL);
            } catch (err) {
              console.error("Error rendering page:", pageNum, err);
            }
          }

          resolve(imagesArray);
        } catch (err) {
          console.error("Error loading PDF document:", err);
          reject(err);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(pdfFile);
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    const imageName = file.name.replace(".pdf", ""); // Extract base name
    try {
      const response = await axios.post("http://localhost:3000/api/upload", {
        imageName: `${imageName}.png`,
      });

      setResult(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Upload failed. Please try again.");
    }
  };

  console.log()
  // const renderInvoiceTable = (invoice) => {
  //   return (
  //     <table
  //       style={{ borderCollapse: "collapse", width: "100%", marginTop: "20px" }}
  //     >
  //       <thead>
  //         <tr style={{ backgroundColor: "#f2f2f2" }}>
  //           <th
  //             colSpan="4"
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "12px",
  //               fontSize: "18px",
  //             }}
  //           >
  //             Invoice Details
  //           </th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         <tr>
  //           <td
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             Date:
  //           </td>
  //           <td
  //             colSpan="3"
  //             style={{ border: "1px solid #ddd", padding: "8px" }}
  //           >
  //             {invoice.date}
  //           </td>
  //         </tr>
  //         <tr>
  //           <td
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             From:
  //           </td>
  //           <td
  //             colSpan="3"
  //             style={{ border: "1px solid #ddd", padding: "8px" }}
  //           >
  //             {invoice.from.name}
  //             <br />
  //             {invoice.from.address}
  //             <br />
  //             {invoice.from.email}
  //           </td>
  //         </tr>
  //         <tr>
  //           <td
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             Bill To:
  //           </td>
  //           <td
  //             colSpan="3"
  //             style={{ border: "1px solid #ddd", padding: "8px" }}
  //           >
  //             {invoice.bill_to.name}
  //             <br />
  //             {invoice.bill_to.address}
  //           </td>
  //         </tr>
  //         <tr style={{ backgroundColor: "#f2f2f2" }}>
  //           <th style={{ border: "1px solid #ddd", padding: "8px" }}>Item</th>
  //           <th style={{ border: "1px solid #ddd", padding: "8px" }}>
  //             Quantity
  //           </th>
  //           <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
  //           <th style={{ border: "1px solid #ddd", padding: "8px" }}>Amount</th>
  //         </tr>
  //         {invoice.items.map((item, index) => (
  //           <tr key={index}>
  //             <td style={{ border: "1px solid #ddd", padding: "8px" }}>
  //               {item.item}
  //             </td>
  //             <td style={{ border: "1px solid #ddd", padding: "8px" }}>
  //               {item.quantity}
  //             </td>
  //             <td style={{ border: "1px solid #ddd", padding: "8px" }}>
  //               ${item.price}
  //             </td>
  //             <td style={{ border: "1px solid #ddd", padding: "8px" }}>
  //               ${item.amount}
  //             </td>
  //           </tr>
  //         ))}
  //         <tr>
  //           <td
  //             colSpan="3"
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               textAlign: "right",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             Total:
  //           </td>
  //           <td
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             ${invoice.total}
  //           </td>
  //         </tr>
  //         <tr>
  //           <td
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             Payment Method:
  //           </td>
  //           <td
  //             colSpan="3"
  //             style={{ border: "1px solid #ddd", padding: "8px" }}
  //           >
  //             {invoice.payment_method}
  //           </td>
  //         </tr>
  //         <tr>
  //           <td
  //             style={{
  //               border: "1px solid #ddd",
  //               padding: "8px",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             Note:
  //           </td>
  //           <td
  //             colSpan="3"
  //             style={{ border: "1px solid #ddd", padding: "8px" }}
  //           >
  //             {invoice.note}
  //           </td>
  //         </tr>
  //       </tbody>
  //     </table>
  //   );
  // };
  return (
    <div className="App ">
      <h1>Bill extraction with OpenAI Vision API</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleConfirm}>Confirm</button>
      <button onClick={handleSubmit}>Upload and Process</button>

      {images.length > 0 && (
        <div>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`page ${index + 1}`}
              style={{ maxWidth: "800px", margin: "10px" }}
            />
          ))}
        </div>
      )}

      {result && (
        <div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          {/* <h2>Processing Result:</h2>
          {renderInvoiceTable(result.invoice)} */}
        </div>
      )}
    </div>
  );
}

export default App;
