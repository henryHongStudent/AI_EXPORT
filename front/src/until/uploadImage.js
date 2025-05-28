import { convertPDFToImages } from "./convertPDFToImages";
import axios from "axios";
export const uploadImage = async (
  setError,
  files,
  setIsLoading,
  setFileStatuses,
  setProcessedInvoice,
  setConfettiRun,
  confettiRun,
  userId
) => {
  setError(null);

  if (files.length === 0) {
    setError("Please select a PDF file.");
    return;
  }


  try {
    const payload = [];
    setIsLoading(true);
    const progressStatus = new EventSource(import.meta.env.VITE_PROGRESS);

    progressStatus.onmessage = (event) => {
      try {
        const updates = JSON.parse(event.data); // Expecting an array of updates

        // Make sure prevStatuses is always an array
        setFileStatuses((prevStatuses) => {
          // If prevStatuses is not an array, make it one
          const newStatuses = Array.isArray(prevStatuses)
            ? [...prevStatuses]
            : [];

          updates.forEach((update) => {
            const index = newStatuses.findIndex(
              (status) => status.name === update.name
            );

            if (index !== -1) {
              newStatuses[index] = update; // Update existing status
            } else {
              newStatuses.push(update); // Add new status
            }
          });

          return newStatuses;
        });
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    for (const file of files) {
      if (file.type === "application/pdf") {
        const convertedImages = await convertPDFToImages(file);

        convertedImages.forEach((imageData, index) => {
          const imageName = `${file.name.replace(/\.pdf$/i, "")}.png`;
          payload.push({
            imageName: imageName,
            imageData: imageData,
          });
        });
      } else {
        setError("Only PDF files are supported.");
        return;
      }
    }

    const response = await axios.post(import.meta.env.VITE_UPLOAD, {
      userId,
      files: payload,
    });

    if (response.data.results && response.data.results.length > 0) {
      setFileStatuses([]);
      setProcessedInvoice(response.data.results);
      setIsLoading(false);
    }
  } catch (err) {
    console.error("Error processing files:", err);
    setError("An error occurred while processing the files. Please try again.");
  } finally {
    setIsLoading(false);
    setConfettiRun(!confettiRun);
  }


};
