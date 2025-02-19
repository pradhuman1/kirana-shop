import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

export const getPageContent = async(
    url: string
) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
    });
    await page.goto(url,{
        waitUntil: "domcontentloaded"
    });
    const pageContent = await page.content();
    await browser.close();
    return pageContent
}