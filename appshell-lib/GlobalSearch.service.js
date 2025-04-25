"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AHMService = exports.GlobalSearchMethod = void 0;
/*
 *  *************************************************
 *   BH [Highly] Confidential
 *   [Unpublished] Copyright 2025.  Baker Hughes
 *
 *   NOTICE:  All information contained herein is, and remains the property of Baker Hughes, and/or
 *   its affiliates.  The intellectual and technical concepts contained herein are proprietary to Baker Hughes
 *   and/or its affiliates and may be covered by patents, copyrights, and/or trade secrets.  Dissemination of this information or
 *   reproduction of this material is strictly forbidden unless prior written permission is obtained from Baker Hughes.
 *  **************************************************
 *
 */
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
const { error } = constants_1.MESSAGES.globalSearchService;
const Logger_service_1 = require("./Logger.service");
const utils_1 = require("../utils");
class GlobalSearchMethod {
    constructor() { }
    getLicenseData(rbacData) {
        let obj = { hasAccesstoSearchApp: false };
        let scopeList = [];
        if (rbacData != undefined && rbacData.length > 0) {
            const searchApp = rbacData.filter((resource) => resource.rsname === 'globalsearchapp');
            console.log("asaaa===", searchApp);
            if (searchApp.length > 0) {
                scopeList = searchApp[0].scopes;
                obj['hasAccesstoSearchApp'] = true;
            }
        }
        if (scopeList === null || scopeList === void 0 ? void 0 : scopeList.length) {
            for (const data of scopeList) {
                let [key, value] = data.split(':');
                obj[key] = value === 'enabled';
            }
        }
        return obj;
    }
    search(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const searchUrl = '/_search';
                let searchString = input.payload.searchText ? input.payload.searchText.toLowerCase() : input.payload.searchText;
                const assetIndexName = (_a = input.payload.extraData) === null || _a === void 0 ? void 0 : _a.assetIndexName;
                const caseIndexName = (_b = input.payload.extraData) === null || _b === void 0 ? void 0 : _b.caseIndexName;
                let url = input.url + assetIndexName + searchUrl;
                let dropDownSelection = input.payload.dropDownSelection;
                const licenseData = this.getLicenseData(input.rbacResponse);
                if ((licenseData === null || licenseData.hasAccesstoSearchApp) === false) {
                    return ({
                        "searchStr": input.payload.searchText,
                        "results": []
                    });
                }
                // Add cases index
                if (Object.keys(licenseData).length > 0 && licenseData.showCasesTab) {
                    url = input.url + assetIndexName + "," + caseIndexName + searchUrl;
                }
                console.log("Insights url: ", url);
                let headers = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: input.token,
                    },
                };
                const requestConfig = {
                    method: "POST",
                    url: url,
                    headers: headers.headers,
                    data: {
                        "size": 25,
                        "from": 0,
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "wildcard": {
                                            "name": `*${searchString}*`
                                        }
                                    },
                                    {
                                        "wildcard": {
                                            "description": `*${searchString}*`
                                        }
                                    }
                                ]
                            }
                        }
                    },
                };
                const response = yield (0, axios_1.default)(requestConfig)
                    .catch((error) => {
                    console.log("Error from opensearch in typeahead ===", error);
                });
                const results = ((_d = (_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.hits) === null || _d === void 0 ? void 0 : _d.hits.map((item) => ({
                    "index": item['_index'] === assetIndexName ? "Asset" : "Case",
                    "data": item['_source']
                }))) || [];
                return {
                    "searchStr": input.payload.searchText,
                    "results": results
                };
            }
            catch (err) {
                const errMsg = (0, utils_1.handleAxiosError)(err, 'GlobalSearchMethod');
                Logger_service_1.Logger.error(new Error(errMsg));
                return errMsg;
            }
        });
    }
    handleCustomEvent(input) {
        throw new Error(error.methodNotImplemented);
    }
}
exports.GlobalSearchMethod = GlobalSearchMethod;
class AHMService {
    constructor() { }
    search(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                let searchString = input.payload.searchText;
                let dropDownSelection = input.payload.dropDownSelection;
                const url = input.url;
                console.log("AHM url: ", url);
                let headers = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: input.token,
                    },
                };
                const requestConfig = {
                    method: "POST",
                    url: url,
                    headers: headers.headers,
                    data: {
                        "SearchKeyWord": `${searchString}`,
                        "filter": [{
                                "filterValue": "string",
                                "source": "string"
                            }],
                        "sorting": {
                            "sortingValue": "string"
                        }
                    }
                };
                const response = yield (0, axios_1.default)(requestConfig)
                    .catch((error) => {
                    console.log("Error from AHM svc in typeahead ===", error);
                });
                console.log("AHM search count: ", (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length);
                const results = ((_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.data.map((item) => ({
                    "index": item === null || item === void 0 ? void 0 : item.class,
                    "data": item
                }))) || [];
                return {
                    "searchStr": input.payload.searchText,
                    "results": results
                };
            }
            catch (err) {
                const errMsg = (0, utils_1.handleAxiosError)(err, 'GlobalSearchMethod');
                Logger_service_1.Logger.error(new Error(errMsg));
                return errMsg;
            }
        });
    }
    handleCustomEvent(input) {
        throw new Error(error.methodNotImplemented);
    }
}
exports.AHMService = AHMService;
