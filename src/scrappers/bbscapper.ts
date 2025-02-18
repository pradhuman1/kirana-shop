const cheerio = require("cheerio");
import { getPageContent } from "../utils/stealthPuppeteer";

interface product{
    title: String,
    mrp: String,
    imageUrl: String
}

const getMrp = (
    $:any, 
    HtmlTableDataCells: any
) => {
    try{
        let mrp: string = "No MRP"
        HtmlTableDataCells.each((index: number, element: any)=>{
            if ($(element).text().trim() === 'MRP:') {
                const nextTd = $(element).next("td"); // Get the next <td>
                if (nextTd.length) {
                    mrp = nextTd.text().trim();
                    return false
                }
            }
        })
        return mrp;
    }catch(err){
        console.error("Error in getMrp:", err);
        return "No MRP";
    }

}

const getImageUrl = (
    pageUrl: string
) => {
    const bbProductId = pageUrl.split("/")[4]
    console.log(bbProductId)
    return `https://www.bigbasket.com/media/uploads/p/l/${bbProductId}`
}

const parsePageContent = (
    pageContent: any,
    url: string
) => {
    const $ = cheerio.load(pageContent);
    const title = $('[class^="Description___StyledH"]').first().text().trim();

    const mrp = getMrp($, $("td"))
    console.log(`img[src^="${getImageUrl(url)}"]`)
    const imageUrl = $(`img[src^="${getImageUrl(url)}"]`).attr("src") || "No image found";
    const data: product = {
        title,
        mrp,
        imageUrl
    }
    return data;
}

export const scrapBBdata = async (
    url: string
) => {
    const pageContent = await getPageContent(url);
    return parsePageContent(pageContent, url)
}