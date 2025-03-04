import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import FileUpload from "./FileUpload";
import InvoiceDetail from "./invoiceDetail";
import ProgressBar from "./ProgressBar";
import Confetti from "react-confetti";

import test from "../assets/test.json";
// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const processData = [
  {
    documentType: "Daily Hire Docket",
    name: "Puni Landfill & Truck Hire Ltd",
    date: "7/12/24",
    siteAddress: "Countdown Pukekohe",
    plantRequired: "QQ906",
    operator: "Alan",
    startTime: "9:30",
    finishTime: "11:00",
    detailsOfJob: "Used to Backstop!",
    lessLunchBreakdownEtc: "",
    travellingTime: "1",
    totalChargeableHours: "2½",
    total: {
      value: "$4",
      confidenceLevel: 95,
      error: false,
    },
    bankDetails: {
      name: { value: "EQUIPT LTD", error: false },
      bank: { value: "KiwiBank", error: false },
      accountNumber: { value: "38-9025-0388719-00", error: false },
    },

    items: [
      {
        description: "RP MT1339",
        confidenceLevel: 95,
        error: false,
      },
      {
        description: "RP 1133",
        confidenceLevel: 95,
        error: false,
      },
      {
        description: "BR 1132",
        confidenceLevel: 95,
        error: false,
      },
      {
        description: "PR 1136",
        confidenceLevel: 95,
        error: false,
      },
      {
        description: "RP 1140",
        confidenceLevel: 95,
        error: false,
      },
    ],
    totalError: ["total", "siteAddress"],
  },
];
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
    <div className="flex items-center justify-center h-full w-full p-4">
      <div className="w-full h-full rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4">
          Bill Extraction with OpenAI Vision
        </h1>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <div className="flex flex-row h-[calc(100vh-10rem)] space-x-4">
          {/* Left Side: File Upload */}
          <div className="w-3/4 flex flex-col">
            <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 overflow-hidden">
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
          <div className="w-1/4 flex flex-col justify-between">
            {processedInvoice && processedInvoice.length > 0 ? (
              <InvoiceDetail
                invoice={processedInvoice[currentFileIndex].data}
              />
            ) : (
              <div className="text-center text-gray-500">
                Please upload at least one PDF file to proceed.
              </div>
            )}
            {isLoading ? (
              <ProgressBar
                selectedFiles={selectedFiles}
                fileStatuses={fileStatuses}
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-row item-center w-full justify-center">
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
