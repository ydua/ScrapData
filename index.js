"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var puppeteer = require("puppeteer");
(function () { return __awaiter(_this, void 0, void 0, function () {
    var browser, i, page, url, isAvailableOrNot, addressDetails, providerDetails, centreDetails, contactData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer.launch({ headless: true })];
            case 1:
                browser = _a.sent();
                i = 1677234117;
                _a.label = 2;
            case 2:
                if (!(i <= 1677234120)) return [3 /*break*/, 13];
                return [4 /*yield*/, browser.newPage()];
            case 3:
                page = _a.sent();
                url = "https://www.childcarefinder.gov.au/service/" + i;
                return [4 /*yield*/, page.goto(url, {
                        timeout: 3000000
                    })];
            case 4:
                _a.sent();
                // await page.goto('https://www.childcarefinder.gov.au/service/1677234117');
                page.on('console', function (msg) { return console.log('PAGE LOG:', msg.text()); });
                return [4 /*yield*/, page.evaluate(function (fn) { return console.log("url : " + location.href); })];
            case 5:
                _a.sent();
                isAvailableOrNot = false;
                return [4 /*yield*/, page.evaluate(function () {
                        var tds = Array.from(document.querySelectorAll('.address'));
                        return tds.map(function (td) {
                            return td.innerText;
                        });
                    })];
            case 6:
                addressDetails = _a.sent();
                if (!(addressDetails.length > 0)) return [3 /*break*/, 10];
                isAvailableOrNot = true;
                return [4 /*yield*/, page.evaluate(function () {
                        var tds = Array.from(document.querySelectorAll('.h4'));
                        return tds.map(function (td) {
                            return td.innerText;
                        });
                    })];
            case 7:
                providerDetails = _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var tds = Array.from(document.getElementsByTagName("h1"));
                        return tds.map(function (td) {
                            return td.innerText;
                        });
                    })];
            case 8:
                centreDetails = _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var tds = Array.from(document.querySelectorAll('.service__contactLink'));
                        return tds.map(function (td) {
                            return td.innerText;
                        });
                    })];
            case 9:
                contactData = _a.sent();
                console.log("Centre Details : " + centreDetails[0]);
                console.log("Child Care Provider : " + providerDetails[0]);
                console.log("Address : " + addressDetails[0]);
                console.log("Phone : " + contactData[0]);
                console.log("Mobile : " + contactData[1]);
                console.log("Email : " + contactData[2]);
                console.log("Centre Url : " + contactData[3]);
                console.log("IsAvailableOrNot : " + isAvailableOrNot);
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, page.evaluate(function (fn) { return console.log("404 found"); })];
            case 11:
                _a.sent();
                _a.label = 12;
            case 12:
                i++;
                return [3 /*break*/, 2];
            case 13: return [4 /*yield*/, browser.close()];
            case 14:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
