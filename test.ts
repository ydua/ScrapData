import { Crawler } from "./Crawler";
import * as puppeteer from 'puppeteer';
import { logger } from "./Logger";
async function test() {

    let crawler = new Crawler();
    let browser = await puppeteer.launch({ headless: true });

    let data = await crawler.returnScrapData(browser, 1677234117);

    if (data.IsAvailableOrNot === true)
        logger.info("TEST PASSED");
    else
        logger.warn("TEST FAILED")

}

test();