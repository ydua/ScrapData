import "reflect-metadata";
import { createConnection, In, LessThan, Between } from "typeorm";
import { Data } from "./entity/Data";
import * as puppeteer from 'puppeteer';
import { Crawler } from "./Crawler";
import { SSL_OP_EPHEMERAL_RSA } from "constants";
import { logger } from "./Logger";
import { Ids } from './entity/Id';
import { Any, getManager } from 'typeorm';
var _ = require('lodash');

async function start() {

  createConnection().then(async connection => {
    let crawler = new Crawler();
    const browser = await puppeteer.launch({ headless: false });
    let tasks = [];
    let taskSize = 10;

    //BEGINS
    // for these ids, hit on page

    let lowerI = 2010;
    let upperI = 2011;

    let currentBatch = lowerI;
    while (currentBatch <= upperI) {

      logger.info(`Starting Batch for ${currentBatch}`);

      let exceptLinkIds = (await connection.manager.find(Data, {
        where: {
          LinkId: Between(currentBatch, currentBatch + taskSize),
        }
      })).map(x => x.LinkId);

      for (let i = currentBatch; i < ((currentBatch + taskSize < upperI) ? currentBatch + taskSize : upperI); i++) {
        // if i does not exist in exceptLinkIds
        if (!exceptLinkIds.some(x => x === i))
          tasks.push(doSomething(connection, crawler, browser, i));
      }

      await Promise.all(tasks);
      tasks = [];

      logger.info(`Completed Batch for ${currentBatch}`);

      //sleep for 1 sec
      await crawler.sleep(1000);
      currentBatch = currentBatch + taskSize;
    }

    //No BEGINS

    // tasks.push(doSomething(connection, crawler, browser, 134));
    // tasks.push(doSomething(connection, crawler, browser, 115));




    // for(let i=1677234117; i<=1677234120; i++){
    //     tasks.push(doSomething(connection,crawler,browser,i));

    //   // console.log("Centre Details : " + centreDetails[0]);
    //   // console.log("Child Care Provider : " + providerDetails[0]);
    //   // console.log("Address : " + addressDetails[0]);
    //   // console.log("Phone : " + contactData[0]);
    //   // console.log("Mobile : " + contactData[1]);
    //   // console.log("Email : " + contactData[2]);
    //   // console.log("Centre Url : " + contactData[3]);
    //   // console.log("IsAvailableOrNot : " + isAvailableOrNot);

    //   // await page.evaluate((fn) => console.log(`Centre name  : ${document.getElementsByTagName("h1")[0].innerText}`));
    //   // await page.evaluate((fn) => console.log(`Child care provider  : ${document.getElementsByClassName("h4")[1].innerText}`));
    //   // await page.evaluate((fn) => console.log(`Address  : ${document.getElementsByClassName("address")[0].innerText}`));
    //   // await page.evaluate((fn) => console.log(`Phone  : ${document.getElementsByClassName("service__contactLink")[0].innerText}`));
    //   // await page.evaluate((fn) => console.log(`Mobile  : ${document.getElementsByClassName("service__contactLink")[1].innerText}`));
    //   // await page.evaluate((fn) => console.log(`Email  : ${document.getElementsByClassName("service__contactLink")[2].innerText}`));
    //   // await page.evaluate((fn) => console.log(`Centre Url  : ${document.getElementsByClassName("service__contactLink")[3].innerText}`));

    // }

    await Promise.all(tasks);
    await browser.close();
    console.log('done');
  });
}

async function doSomething(connection, crawler, browser, i) {

  logger.info(`Starting Crawl for ${i}`);

  let data = await crawler.returnScrapData(browser, i)

  let scrapData = new Data();

  if (data) {
    scrapData.Address = data.Address;
    scrapData.LinkId = i;
    scrapData.Phone = data.Phone;
    scrapData.Mobile = data.Mobile;
    scrapData.Email = data.Email;
    scrapData.Url = data.CentreUrl;
    scrapData.IsAvailable = data.IsAvailableOrNot;
    scrapData.CentreName = data.CentreDetails;
    scrapData.DayCareProvider = data.ChildCareProvider;

    logger.info(`Saving Data for ${i}`);

    connection.manager
      .save(scrapData)
      .then(result => {
        console.log('saved for id ', scrapData.LinkId);
      });

    logger.info(`Completed Crawl for ${i}`);
  }
}



async function startUsingPincode() {

  createConnection().then(async connection => {
    let crawler = new Crawler();
    let browser = await puppeteer.launch({ headless: true });
    let tasks = [];
    let taskSize = 1;

    let jsonCodes = require('./australian_postcodes.json');
    let ids = []
    // for (let postcode of jsonCodes) {
    //   ids.push(postcode.postcode)
    // }
    for (let i = 5358; i < 10000; i++) {
      ids.push(i)
    }
    ids = _.uniqBy(ids, Math.floor);

    // await ProcessedIds(connection, crawler, browser);
    let browserPage = 0;
    let browserPageSize = 1;
    for (var i = 0; i < ids.length; i++) {
      browserPage++;
      if (tasks.length < taskSize) {
        tasks.push(doScrapUsingPincode(connection, crawler, browser, ids[i]));
        await sleep(1000);  
      }
      if (tasks.length >= taskSize) {
        console.log("Current Pincode is :" + ids[i]);
        await Promise.all(tasks);
        await ProcessedIds(connection, crawler, browser,ids[i]);
        tasks = [];
      }
      if (browserPage >= browserPageSize) {
        console.log("Current Pincode is :" + ids[i]);
        browser.close();
        crawler = new Crawler();
        browser = await puppeteer.launch({ headless: true });
        browserPage = 0
      }
    }


    await Promise.all(tasks);
    await browser.close();
    console.log('done');
  });
}


async function doScrapUsingPincode(connection, crawler, browser, i) {

  logger.info(`Starting Crawl for Pincode:  ${i}`);

  await crawler.ScrapDataUsingPincode(connection, browser, i)
  logger.info(`Completed Crawl for ${i}`);

}

async function sleep(ms: number) {
  return new Promise(res => {
    setTimeout(() => res(), ms);
  });
}

async function getUnprocessedIds(connection) {
  const entityManager = getManager();
  let unprocessedIds = await entityManager.find(Ids, {
    isProcessed: false
  });

  return unprocessedIds.length ? unprocessedIds.map(x => x.LinkId) : [];
}

async function ProcessedIds(connection, crawler, browser,pincode) {
  var scrapTaskSize = 5;
  var scrapTask = [];
  var toScrap = await getUnprocessedIds(connection);
  for (var j = 0; j < toScrap.length; j++) {
    if (scrapTask.length < scrapTaskSize) {
      console.log("Processing Pincode : " + pincode);
      scrapTask.push(doSomething(connection, crawler, browser, toScrap[j]));
      await sleep(1000);
    }
    if (scrapTask.length > 0) {
      await Promise.all(scrapTask);
      await connection.manager
        .update(Ids, {
          LinkId: In(toScrap)
        }, {
            isProcessed: true
          })
        .then(result => {
          console.log('saved for scrap ids : ', toScrap);
        });

      // await ProcessedIds(connection);
      scrapTask = [];
    }
  }
  await Promise.all(scrapTask);
  // await browser.close();
  console.log('done');

}

// start();  
startUsingPincode();