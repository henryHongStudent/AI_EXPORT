import { useState, useEffect } from "react";

export const useDocumentDetail = (userId, fileId) => {
  const [documentData, setDocumentData] = useState({
    fileUrl: "",
    extractedData: null,
    metadata: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentDetail = async () => {
      if (!userId || !fileId) {
        setError("User ID and File ID are required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const metadataResponse = await fetch(
          `${import.meta.env.VITE_FILES}/${userId}/${fileId}`
        );
        if (!metadataResponse.ok) {
          const errorData = await metadataResponse.json();
          throw new Error(errorData.error || "Failed to fetch file metadata");
        }
        const metadata = await metadataResponse.json();
        const dataResponse = await fetch(
          `${import.meta.env.VITE_FILES}/${userId}/${fileId}/data`
        );
        if (!dataResponse.ok) {
          const errorData = await dataResponse.json();
          throw new Error(errorData.error || "Failed to fetch extracted data");
        }
        const extractedData = await dataResponse.json();

        const fileUrl = `${
          import.meta.env.VITE_FILES
        }/${userId}/${fileId}/download`;

        setDocumentData({
          fileUrl,
          extractedData,
          metadata,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching document detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetail();
  }, [userId, fileId]);

  return { documentData, loading, error };
};
