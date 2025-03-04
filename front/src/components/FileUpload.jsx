import React, { useState, useRef, useEffect } from "react";
import { Upload, X, FileIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [zoom, setZoom] = useState(1); // 초기 줌 크기
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const url =
    (processedInvoice && processedInvoice[currentFileIndex]?.url) || null;

  // const url = "https://i.ibb.co/569MSW8/Bill4-png.png";
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

    testAPI(files);
    // uploadImage(
    //   setError,
    //   files,
    //   setIsLoading,
    //   setFileStatuses,
    //   setProcessedInvoice,
    //   setConfettiRun,
    //   confettiRun
    // );
  };

  const handleFiles = (files) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    const newFiles = [...selectedFiles, ...pdfFiles].slice(0, 30); // Limit to 30 files
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
  const handleZoomOut = () =>
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 1));
  const handleResetZoom = () => setZoom(1);

  const renderFileUploadArea = () => (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
          relative border-2 border-dashed rounded-lg p-4 cursor-pointer
          transition-colors duration-200 ease-in-out h-full flex flex-col items-center justify-center
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary"
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
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="w-8 h-8 text-gray-400" />
        <div className="text-sm text-center">
          <p className="font-medium text-gray-600">
            Drop your PDF files here, or{" "}
            <span className="text-primary">browse</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Supports: PDF (Max 30 files)
          </p>
        </div>
      </div>
    </div>
  );
  const renderPDFViewer = () => (
    <div className="h-full flex flex-col">
      <Toaster />
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md mb-2">
        <div className="flex items-center space-x-2 truncate">
          <FileIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium truncate">
            {processedInvoice && processedInvoice.length > 0
              ? processedInvoice[currentFileIndex].name
              : selectedFiles[currentFileIndex].name}
          </span>
        </div>
        <div className="flex justify-center items-center">
          <button onClick={handleZoomOut} className="m-2 p-2 border">
            -
          </button>
          <button onClick={handleResetZoom} className="m-2 p-2 border">
            Reset
          </button>
          <button onClick={handleZoomIn} className="m-2 p-2 border">
            +
          </button>
        </div>
        <div className="flex items-center space-x-2 h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentFileIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentFileIndex === 0}
            className="h-6 w-6 flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm">
            {processedInvoice && processedInvoice.length > 0
              ? `${currentFileIndex + 1} / ${processedInvoice.length}`
              : `${currentFileIndex + 1} / ${selectedFiles.length}`}
          </span>

          <Button
            variant="ghost"
            size="icon"
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
            className="h-6 w-6 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFile(currentFileIndex)}
            className="h-6 w-6 flex-shrink-0"
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>

      {url ? (
        <div className="relative h-full w-full overflow-auto border rounded-md">
          <img
            src={url}
            alt="Zoomable Content"
            title="Zoomable Image"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center",
            }}
            className="block mx-auto w-fit"
          />
        </div>
      ) : (
        <iframe
          src={URL.createObjectURL(selectedFiles[currentFileIndex])}
          title={`PDF Viewer ${currentFileIndex + 1}`}
          className="h-full w-full overflow-auto border rounded-md"
        />
      )}
    </div>
  );

  return (
    <div className="w-full h-full">
      <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
        test
      </a>
      {isLoading ? (
        <div className="text-center">
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
      {/* {renderPDFViewer()} */}
    </div>
  );
};

export default FileUpload;
