import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "./ui/button";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const Dashboard = ({ username, onLogout }) => {
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">PDF File Upload</h1>
          <p className="text-gray-600">Welcome, {username}! Upload a PDF file to extract data.</p>
        </div>
        <Button 
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">Upload PDF Document</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 p-3"
        />
      </div>

      {images.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img src={img} alt={`Page ${index + 1}`} className="w-full" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Confirm Images
            </button>
            <button
              onClick={handleSubmit}
              disabled={imagePaths.length === 0}
              className={`px-4 py-2 text-white rounded-md ${
                imagePaths.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Process Document
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 