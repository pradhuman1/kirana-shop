import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

const searchGoogle = async (
    query: string
) => {
    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
        console.error("Missing Google API Key or CSE ID. Check your .env file.");
        return;
    }

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}`;

    try {
        const response = await axios.get(url);
        const results = response.data.items;
        if (results && results.length > 0) {
            return results;
        } else {
            console.log("No results found.");
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
};

export const getBigBasketLink = async (
    ean: string
) => {
    const googleResults: any = await searchGoogle(ean);
    let bbUrl = null
    googleResults.forEach((item: any, index: number) => {
        if (item.link.includes("www.bigbasket.com")) {
            bbUrl = item.link
            return
        }
    });
    return bbUrl
}

