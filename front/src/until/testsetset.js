// get request

const getData = async () => {
  const url = "https://dummyjson.com/products";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    throw new Error("Error fetching data");
  }
};
