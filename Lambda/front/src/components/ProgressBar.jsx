import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const ProgressBar = ({ fileStatuses }) => {
  const isLoading = (status) => {
    return status !== "Completed";
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case "Uploading":
        return 50;
      case "Uploaded":
        return 60;
      case "Extracting":
        return 75;
      case "Completed":
        return 100;
      case "Fail":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusColor = (status, error) => {
    if (error == true) return "bg-orange-500";
    switch (status) {
      case "Uploading":
        return "bg-blue-500";
      case "Uploaded":
        return "bg-yellow-500";
      case "Extracting":
        return "bg-purple-500";
      case "Completed":
        return "bg-green-500";
      case "Fail":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderStatusSummary = (fileStatuses) => {
    const renderDocList = (docs) =>
      docs.map((item, index) => (
        <span key={item.name} className="text-gray-700">
          {item.name}
          {index < docs.length - 1 ? ", " : ""}
        </span>
      ));

    const processingDocs = fileStatuses.filter(
      (item) => item.step === "Extracting"
    );
    const failedDocs = fileStatuses.filter((item) => item.step === "Fail");
    const completedDocs = fileStatuses.filter(
      (item) => item.step === "Completed"
    );

    return (
      <div className="flex flex-row justify-between items-center gap-4 bg-gray-50 rounded-xl shadow border border-gray-200 px-6 py-3 mt-4">
        {/* Processing Status */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 font-medium mb-1">Processing</div>
          <div className="text-lg font-bold text-blue-600">{processingDocs.length}</div>
        </div>
        {/* Failed Status */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 font-medium mb-1">Failed</div>
          <div className="text-lg font-bold text-red-500">{failedDocs.length}</div>
        </div>
        {/* Completed Status */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 font-medium mb-1">Completed</div>
          <div className="text-lg font-bold text-green-600">{completedDocs.length}</div>
        </div>
        {/* Total Status */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 font-medium mb-1">Total</div>
          <div className="text-lg font-bold text-gray-800">{fileStatuses.length}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="w-full h-full overflow-y-auto max-h-[500px]">
          <div className="w-full px-2 space-y-4">
            {fileStatuses && fileStatuses.length > 0
              ? fileStatuses.map((item, index) => (
                  <div key={index} className="flex flex-row items-center gap-3">
                    {/* File Name */}
                    <div className="w-1/6 min-w-[100px]">
                      <span className="text-sm font-semibold text-gray-800 truncate block">
                        {item.name.replace(/\.[^/.]+$/, "")}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex-grow bg-gray-100 rounded-full h-4">
                      <div
                        className={`${getStatusColor(
                          item.step,
                          item.error
                        )} h-4 rounded-full transition-all duration-500 flex items-center`}
                        style={{
                          width: `${getProgressPercentage(item.step)}%`,
                        }}
                      >
                        <div className="text-xs font-semibold text-end pr-4 h-4 leading-4 text-white w-full truncate">
                          {item.type} {item.step || "Pending"}
                          {isLoading(item.step) && (
                            <span className="loading-dots ml-1">...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Status Icon */}
                    <div className="w-[40px]">
                      {(item.step === "Uploading" ||
                        item.step === "Uploaded") && (
                        <DotLottieReact
                          src="https://lottie.host/bf7dd674-74dc-4b65-8b06-1f6e05b2ec1e/NSTy6qE68t.lottie"
                          loop
                          autoplay
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                        />
                      )}
                      {item.step === "Extracting" && (
                        <DotLottieReact
                          src="https://lottie.host/68fbe2f9-d562-4656-a77c-7331c8b2f77a/ZNXD6edL5n.lottie"
                          loop
                          autoplay
                          style={{
                            width: "60px",
                            height: "60px",
                            marginLeft: "-10px",
                          }}
                        />
                      )}
                      {item.step === "Completed" && item.error === false && (
                        <DotLottieReact
                          src="https://lottie.host/e008375f-f06a-4f67-8a66-267abcb03ae2/8RiRLPhcEs.lottie"
                          autoplay
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                        />
                      )}
                      {item.step === "Fail" && (
                        <DotLottieReact
                          src="https://lottie.host/872359af-8823-4e59-98c4-e7b259987b80/DrXmdEAUyV.lottie"
                          autoplay
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                        />
                      )}
                      {item.error === true && item.step === "Completed" && (
                        <DotLottieReact
                          src="https://lottie.host/7520da7f-e0c6-4c06-a114-95d5b7f6885d/XglD5PWyXE.lottie"
                          loop
                          autoplay
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col p-2">
        {fileStatuses.length > 0 && renderStatusSummary(fileStatuses)}
      </div>
    </>
  );
};

export default ProgressBar;
