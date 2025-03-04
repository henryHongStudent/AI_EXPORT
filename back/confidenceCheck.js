export const confidenceCheck = (data) => {
  // TODO: Implement confidence check logic here
  // Return true if confidence is high, false otherwise

  try {
    //TODO : loop all of data and check confidence
    // if confidence is high return call uploadToZoho method
    // if not , send to frontend to check confidence again by user
  } catch (error) {
    throw error;
  }
};

const uploadToZoho = (data) => {
  try {
    const url = "https://api.zoho.com/invoice/v3/invoices";
    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Post error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};
