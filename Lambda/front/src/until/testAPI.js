import axios from "axios";

export const testAPI = async (files) => {
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  try {
    const filesData = await Promise.all(
      files.map(async (file) => {
        const base64 = await convertToBase64(file);
        return {
          fileName: file.name,
          fileContent: base64,
        };
      })
    );

    const url =
      "https://vnbwscqmz8.execute-api.ap-southeast-2.amazonaws.com/default/test";

    const jsonData = {
      files: filesData,
    };

    const response = await axios.post(url, jsonData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(response.data, "posts");
    return response.data;
  } catch (error) {
    console.error("Error testing API:", error);
    throw error;
  }
};


const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

// 
// const formData = new FormData();
// files.forEach((file) => {
//   formData.append("files", file);
// });
// console.log(files); // FormData object for testing

// console.log(formData);
// try {
//   
//   const uploadResponse = await axios.post(
//     // "https://8ic34yi5dl.execute-api.ap-southeast-2.amazonaws.com/upload",

//     "http://localhost:3000/api/aws",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );

//   console.log(uploadResponse.data); 

//   if (uploadResponse.status === 200) {
//     console.log("Files uploaded successfully. Listening for progress...");

//    
//     const eventSource = new EventSource(
//       "http://localhost:3000/api/textraction"
//     );

//     eventSource.onmessage = async (event) => {
//       const data = JSON.parse(event.data);
//       console.log("Progress update:", data);

//       if (data.status === "uploaded") {
//         console.log("Files uploaded:", data.data);
//       } else if (data.status === "completed") {
//         console.log("Processing completed:", data.data);

//         
//         try {
//           const resultFromAPI = await axios.get(
//             "http://localhost:3000/api/result"
//           );
//           console.log("Result received:", resultFromAPI.data); 
//         } catch (error) {
//           console.error("Error getting result:", error);
//         }

//         eventSource.close();
//       }
//     };

//     eventSource.onerror = (error) => {
//       console.error("Error with SSE connection:", error);
//       eventSource.close();
//     };
//   }
// } catch (error) {
//   console.error("Error uploading files:", error);
// }
