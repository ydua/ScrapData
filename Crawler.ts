import 'reflect-metadata'
import { Data } from './entity/Data';
import { Browser } from 'puppeteer';
import { logger } from './Logger';
import { Ids } from './entity/Id';
import { Server } from 'https';
import { Any, In } from 'typeorm';
import { getManager } from "typeorm";
import { emit } from 'cluster';
import * as _ from 'lodash';

export class Crawler {
  async returnScrapData(browser: Browser, i: Number) {
    try {
      const page = await browser.newPage();
      var url = "https://www.childcarefinder.gov.au/service/" + i;
      await page.goto(url);

      await page.waitForSelector(".service__header", { timeout: 60000 }); //.waitForNavigation({timeout: 30000});

      page.on('console', msg => console.log('PAGE LOG:', msg.text()));

      await page.evaluate((fn) => console.log(`url : ${location.href}`));

      var isAvailableOrNot = false;

      // get all details using selectors.

      const addressDetails = await page.evaluate(() => {
        const tds: Array<any> = Array.from(document.querySelectorAll('.address'));
        return tds.map(td => {
          return td.innerText;
        });
      });

      let ddt = new Data();

      //return empty data if URL is not valid

      if (addressDetails.length === 0) {
        let data = {
          // Address : null,
          IsAvailableOrNot: isAvailableOrNot,
          LinkId: i,
          Address: null,
          Phone: null,
          Mobile: null,
          Email: null,
          CentreUrl: null,
          CentreDetails: null,
          ChildCareProvider: null
        }

        return data;
      }

      const providerDetails = await page.evaluate(() => {
        const tds: Array<any> = Array.from(document.querySelectorAll('.h4'));
        return tds.map(td => {
          return td.innerText;
        });
      });

      const centreDetails = await page.evaluate(() => {
        const tds = Array.from(document.getElementsByTagName("h1"))
        return tds.map(td => {
          return td.innerText;
        });
      });

      // const contactData = await page.evaluate(() => {
      //   const tds: Array<any> = Array.from(document.querySelectorAll('.service__contactLink'))
      //   return tds.map(td => {
      //     return td.innerText;
      //   });
      // });
      const contactDataContent = await page.evaluate(() => {
        const tds: Array<any> = Array.from(document.querySelectorAll('.service__contactLink'))
        return tds.map(td => {
          return td.href;
        });
      });

      let tel,mobile,mail,centreurl;
      if (contactDataContent.length > 0) {
        let telField = contactDataContent.filter(x => x.includes('tel:'));
        let urlField = contactDataContent.filter(x => !x.includes('tel:') && !x.includes('mailto:'));
        let mailField = contactDataContent.filter(x => x.includes('mailto:'));
        if(telField.length){
          tel = telField[0].split(':')[1];

          if(telField[1]){
            mobile = telField[1].split(':')[1];
          }
        }
        if(mailField.length){
          mail = mailField[0].split(':')[1];
        }
        if(urlField.length){
          centreurl = urlField[0];
        }

      }


      let data = {
        Address: addressDetails[0],
        Phone: tel, //contactData[0],
        Mobile: mobile, //contactData[0],
        Email: mail, //contactData[2],
        CentreUrl: centreurl, // contactData[3],
        IsAvailableOrNot: true,
        CentreDetails: centreDetails[0],
        ChildCareProvider: providerDetails[0],
        LinkId: i
      }

      return data;

    } catch (e) {
      let data = {
        // Address : null,
        IsAvailableOrNot: isAvailableOrNot,
        LinkId: i,
        Address: null,
        Phone: null,
        Mobile: null,
        Email: null,
        CentreUrl: null,
        CentreDetails: null,
        ChildCareProvider: null
      }

      return data;
      // logger.error(`Error for Crawling index ${i}`, e);
    }

  }


  async saveIds(connection, linkIds: Array<number>, pincode) {

    const entityManager = getManager();
    var copyOflinkIds = linkIds;
    linkIds = _.uniq(linkIds.map(x => Number(x)));
    var diff = _.difference(copyOflinkIds,linkIds);
    const preExisting = await entityManager.find(Ids, {
      LinkId: In(linkIds.map(x => x.toString()))
    });

    let remaining = _.uniq(diff);
    if (preExisting.length) {
      // get all the linkId in pre existing ids
      let pre_existing_ids = _.uniq(preExisting.map(x => Number(x.LinkId)));
      console.log(pre_existing_ids);
      // get all unique ids which are not in pre-existing ids
      console.log(linkIds.filter(x => pre_existing_ids.indexOf(x) < 0).length);
      remaining = _.difference(linkIds,pre_existing_ids);
      // resultingIds = _.uniq(linkIds.filter(x => pre_existing_ids.indexOf(x) < 0))
      console.log(remaining.length);
    }
  

    let newEntities = remaining.map(i => new Ids(i,pincode));

    await entityManager
      .save(newEntities)
      .then(result => {
        console.log('saved for pincode : ', pincode);
      });
    // await connection.manager
    //   .save(ids)
    //   .then(result => {
    //     console.log('saved for pincode : ', pincode);
    //   });
  }


  async ScrapDataUsingPincode(connection, browser: Browser, i: Number) {
    try {
      const page = await browser.newPage();
      var isAvailableOrNot = false;

      // //todo: sending pincode and getting list of centreIds
      // var urlToSent = "https://www.childcarefinder.gov.au/search/nsw/2000/haymarket?geo=-33.8708464%2C151.20732999999996&service_type=ZCDC%2CZFDC%2CZOSH&page=3";
      var urlToSent = "https://www.childcarefinder.gov.au/";
      await page.goto(urlToSent);
      await page.waitForSelector("#main_search", { timeout: 60000 });
      await page.click("#main_search");
      var pincode = i;
      await page.keyboard.type(`${i}`);
      await page.keyboard.press('Enter');
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));

      await page.evaluate((fn) => console.log(`url : ${location.href}`));

      await this.sleep(10000);
      await page.waitForSelector(".result", { timeout: 60000 });
      //todo: get all ids
      let ids = await page.evaluate(() => {
        const tds12: Array<any> = Array.from(document.querySelectorAll('.h3'));
        return tds12.map(td => {
          return td.id;
        });
      });


      if (ids.length > 0) {
        //getting page url
        var url = page.url();
        var originalUrl = url;
        var searchForMoreIds = true;
        var pageNo = 2;
        while (searchForMoreIds) {
          const newPage = await browser.newPage();
          searchForMoreIds = false;
          var createdUrl = originalUrl + "&page=" + pageNo;
          var checkFor = "&page=" + pageNo;
          // await page.goto(createdUrl);
          await newPage.goto(createdUrl);
          await this.sleep(10000);
          url = newPage.url();
          if (url.includes(checkFor)) {
            // if (url === createdUrl) {
            await newPage.waitForSelector(".result", { timeout: 60000 });
            //todo: get all ids
            this.sleep(5000);
            const moreIds = await newPage.evaluate(() => {
              // const moreIds = await newPage.evaluate(() => {
              const tds121: Array<any> = Array.from(document.querySelectorAll('.h3'));
              return tds121.map(td => {
                return td.id;
              });
            });
            if (moreIds.length > 0) {
              // let union = [...moreIds, ...ids];
              ids.push(...moreIds)
            }
            searchForMoreIds = true;
            pageNo++;
            newPage.close();
          }
          // page.close();
        }
      }

      if (ids.length > 0) {
        await this.saveIds(connection, ids, i);
      } else {
        logger.info("No Centre Detail found @Pincode: " + pincode);
      }
      page.close();
      return true;
      //end of todo: sending pincode and getting list of centreIds
    } catch (e) {
      logger.error("Incorrect Pincode : " + pincode);
      // logger.error(`Error for Crawling index ${i}`, e);
      return true;
    }
  }


  async sleep(ms: number) {
    return new Promise(res => {
      setTimeout(() => res(), ms);
    });
  }

}
