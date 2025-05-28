import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import FileUpload from "./FileUpload";
import InvoiceDetail from "./invoiceDetail";
import ProgressBar from "./ProgressBar";
import Confetti from "react-confetti";
import { FileText } from "lucide-react";
// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const InvoiceUploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState();
  const [processedInvoice, setProcessedInvoice] = useState();
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileStatuses, setFileStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confettiRun, setConfettiRun] = useState(false);
  const handleFilesSelect = (files) => {
    setSelectedFiles(files);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-6 bg-gray-50">
      <div className="w-full  bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-center space-x-3">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              EXTRACTOR with OpenAI Vision
            </h1>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <div className="flex flex-row w-full h-[calc(100vh-12rem)] p-6 space-x-6">
          {/* Left Side: File Upload */}
          <div className="w-3/4 flex flex-col">
            <div className="flex-grow bg-white rounded-xl border border-gray-200 overflow-hidden">
              <FileUpload
                setError={setError}
                onFilesSelect={handleFilesSelect}
                processedInvoice={processedInvoice}
                setProcessedInvoice={setProcessedInvoice}
                setCurrentFileIndex={setCurrentFileIndex}
                currentFileIndex={currentFileIndex}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setConfettiRun={setConfettiRun}
                confettiRun={confettiRun}
                setFileStatuses={setFileStatuses}
              />
            </div>
          </div>

          {/* Right Side: Invoice Details */}
          <div className="w-1/4 flex flex-col space-y-6">
            <div className="flex-grow bg-white rounded-xl border border-gray-200 p-4 overflow-auto">
              {isLoading ? (
                <ProgressBar
                  selectedFiles={selectedFiles}
                  fileStatuses={fileStatuses}
                />
              ) : processedInvoice && processedInvoice.length > 0 ? (
                <InvoiceDetail
                  invoice={processedInvoice[currentFileIndex].data}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 font-medium">
                      Please upload at least one PDF file to proceed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed inset-0 pointer-events-none">
          <Confetti
            recycle={false}
            run={confettiRun}
            numberOfPieces={500}
            gravity={0.3}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceUploadForm;
