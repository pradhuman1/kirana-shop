/*
todo
Write scrapper for 
1. BB
2. BBsathi
3. Lotswholesale
*/
import { scrapBBdata } from "./bbscapper"
import { getBigBasketLink } from "../utils/googleSearch"
import { data } from "cheerio/dist/commonjs/api/attributes";

// const validateUrl = (
//     url: any
// ) => {
//     if (url == null) {
//         throw new Error("Empty url!! Unable to scrap product")
//         return false
//     }
//     return true
// }

export const scrapProduct = async (
    ean: string
) => {
    try{
        const bbLink = await getBigBasketLink(ean);
        if (bbLink != null) {
            return scrapBBdata(bbLink);
        }
        return new Error("Unable to find EAN on google")
    }catch(err){
        console.log(err)
        return new Error("Unable to scrap product")
    }
}


// scrapProduct("7622202216831");
