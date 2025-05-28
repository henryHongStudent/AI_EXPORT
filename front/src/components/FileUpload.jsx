import React, { useState, useRef, useEffect } from "react";
import { Upload, X, FileIcon, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { uploadImage } from "../until/uploadImage";
import { Toaster, toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { testAPI } from "@/until/testAPI";

const FileUpload = ({
  onFilesSelect,
  accept = ".pdf",
  currentFileIndex,
  setCurrentFileIndex,
  processedInvoice,
  selectedFiles,
  setSelectedFiles,
  isLoading,
  setIsLoading,
  setConfettiRun,
  setError,
  setProcessedInvoice,
  confettiRun,
  setFileStatuses,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const url = (processedInvoice && processedInvoice[currentFileIndex]?.url) || null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
    toast.success("Files selected successfully!");
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    const userId = localStorage.getItem('userID');
    uploadImage(
      setError,
      files,
      setIsLoading,
      setFileStatuses,
      setProcessedInvoice,
      setConfettiRun,
      confettiRun,
      userId
    );
  };

  const handleFiles = (files) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    const newFiles = [...selectedFiles, ...pdfFiles].slice(0, 30);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
    toast.success("Files selected successfully!");
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
    if (currentFileIndex >= newFiles.length) {
      setCurrentFileIndex(Math.max(0, newFiles.length - 1));
    }
  };

  const handleZoomIn = () => setZoom((prevZoom) => prevZoom + 0.1);
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, 1));
  const handleResetZoom = () => setZoom(1);

  const renderFileUploadArea = () => (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-8 cursor-pointer
        transition-all duration-200 ease-in-out h-full w-full flex flex-col items-center justify-center
        ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept={accept}
        multiple
        className="hidden"
        aria-label="File upload"
      />
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <div className="p-4 rounded-full bg-gray-50">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center space-y-2 w-full">
          <p className="font-medium text-gray-700">
            Drop your PDF files here, or{" "}
            <span className="text-primary font-semibold">browse</span>
          </p>
          <p className="text-gray-500 text-sm">
            Supports: PDF (Max 30 files)
          </p>
        </div>
      </div>
    </div>
  );

  const renderPDFViewer = () => (
    <div className="h-full w-full flex flex-col">
      <Toaster />
      <div className="flex items-center justify-between bg-white border-b p-3 rounded-t-lg w-full">
        <div className="flex items-center space-x-2 truncate">
          <FileIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium truncate">
            {processedInvoice && processedInvoice.length > 0
              ? processedInvoice[currentFileIndex].name
              : selectedFiles[currentFileIndex].name}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentFileIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentFileIndex === 0}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-medium min-w-[60px] text-center">
            {processedInvoice && processedInvoice.length > 0
              ? `${currentFileIndex + 1} / ${processedInvoice.length}`
              : `${currentFileIndex + 1} / ${selectedFiles.length}`}
          </span>

          <button
            onClick={() =>
              setCurrentFileIndex((prev) =>
                Math.min(
                  processedInvoice && processedInvoice.length > 0
                    ? processedInvoice.length - 1
                    : selectedFiles.length - 1,
                  prev + 1
                )
              )
            }
            disabled={
              processedInvoice && processedInvoice.length > 0
                ? currentFileIndex === processedInvoice.length - 1
                : currentFileIndex === selectedFiles.length - 1
            }
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => removeFile(currentFileIndex)}
            className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Remove file</span>
          </button>
        </div>
      </div>

      {url ? (
        <div className="relative flex-1 overflow-auto border rounded-b-lg bg-gray-50 w-full max-w-full">
          <img
            src={url}
            alt="Zoomable Content"
            title="Zoomable Image"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center",
              width: "100%",
              maxWidth: "100%"
            }}
            className="block mx-auto w-full max-w-full"
          />
        </div>
      ) : (
        <iframe
          src={URL.createObjectURL(selectedFiles[currentFileIndex])}
          title={`PDF Viewer ${currentFileIndex + 1}`}
          className="flex-1 w-full max-w-full overflow-auto border rounded-b-lg"
        />
      )}
    </div>
  );

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <div className="text-center w-full h-full">
          <DotLottieReact
            src="https://lottie.host/5a9d6de7-e552-4a58-8232-f05a5eba7700/o5V5XkIIB8.lottie"
            loop
            autoplay
            style={{
              width: "100%",
              height: "100%",
            }}
          />
          <p className="text-2xl font-bold text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text mt-4 hover:scale-105 transition-transform duration-300">
            Don't stress, Buddy's got your back{" "}
            <span className="text-black">😊</span>
          </p>
        </div>
      ) : selectedFiles.length === 0 ? (
        renderFileUploadArea()
      ) : (
        renderPDFViewer()
      )}
    </div>
  );
};

export default FileUpload;
