import { parseCSV } from "./csvParser.mjs";

const url_csvDev = import.meta.resolve("./lang/common_dev.csv");
const url_csvBase = import.meta.resolve("./lang/common_base.csv");
const url_csvOriginal = import.meta.resolve("./lang/原版.csv");

/** @type {import("./csvParser.mjs").CSVData} */
const data_dev = parseCSV(await (await fetch(url_csvDev)).text());
/** @type {import("./csvParser.mjs").CSVData} */
const data_base = parseCSV(await (await fetch(url_csvBase)).text());
/** @type {import("./csvParser.mjs").CSVData} 原版 */
const data_original = parseCSV(await (await fetch(url_csvOriginal)).text());
/**
 *
 * @param {String} id
 * @returns {String}
 */
export const getZH_CNlangData = (id) => {
    let log = `%c查询 %c[${id}]%c`;
    let result = data_dev.get(id, "zh-cn");
    if (result) log += ` → '${result}' from ${url_csvDev}`;
    else {
        result = data_dev.get(id, "en");
        if (result) log += ` → '${result}' from ${url_csvDev} 回退en`;
        else {
            result = data_base.get(id, "zh-cn");
            log += ` → '${result}' from ${url_csvBase}`;
        }
    }
    console.log(log, "padding:2px", "color:#33b563;border:1px solid #ffffff;padding:2px", "");
    return result;
};
export const originalData = data_original