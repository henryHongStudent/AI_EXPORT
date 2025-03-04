import { ScrollArea } from "@radix-ui/react-scroll-area";
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
      <>
        {/*  */}
        <div className="stats shadow-lg bg-primary text-center  p-2 border border-orange-200">
          {/* Processing Status */}
          {processingDocs && (
            <div className="stat">
              <div className="stat-title"> Processing</div>
              <div className="stat-value text-blue-500 ">
                {processingDocs.length}
              </div>
            </div>
          )}

          {/* Failed Status */}
          {failedDocs && (
            <div className="stat">
              <div className="stat-title">Failed</div>
              <div className="stat-value text-red-500">{failedDocs.length}</div>
            </div>
          )}

          {/* Completed Status */}
          {completedDocs && (
            <div className="stat">
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">
                {completedDocs.length}
              </div>
            </div>
          )}

          {/* Total Status */}
          {fileStatuses && (
            <div className="stat">
              <div className="stat-title">Total</div>
              <div className="stat-value">{fileStatuses.length}</div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <ScrollArea className="w-full h-full">
          <div className="w-full px-5 space-y-4">
            {fileStatuses && fileStatuses.length > 0
              ? fileStatuses.map((item, index) => (
                  <div key={index} className="flex flex-row items-center gap-3">
                    {/* File Name */}
                    <div className="w-1/6 min-w-[100px]">
                      <span className="text-sm font-medium text-gray-700">
                        {item.name.replace(/\.[^/.]+$/, "")}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex-grow bg-gray-200 rounded-full h-4">
                      <div
                        className={`${getStatusColor(
                          item.step,
                          item.error
                        )} h-4 rounded-full transition-all duration-500`}
                        style={{
                          width: `${getProgressPercentage(item.step)}%`,
                        }}
                      >
                        <div className="text-xs font-medium text-end pr-4 h-4 leading-4 text-white">
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
                      {console.log(item.error)}
                      {console.log(item.step)}
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
        </ScrollArea>
      </div>

      <div className="flex flex-col p-2">
        {fileStatuses.length > 0 && renderStatusSummary(fileStatuses)}
      </div>
    </>
  );
};

export default ProgressBar;
