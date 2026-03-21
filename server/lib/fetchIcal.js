import axios from "axios";
 
export async function fetchIcal(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/calendar",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch iCal from ${url}: ${error.message}`);
  }
}
 