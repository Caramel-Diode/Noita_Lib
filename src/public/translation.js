const translation = (() => {
    /** @type {CSVData|null} */
    let csvData = null;
    /** @type {String} */
    let _lang = "";
    return {
        /** 获取翻译 */
        get(key) {
            return csvData?.get(key, _lang);
        },
        /**
         * @param {String} data
         * @param {"en"|"ru"|"pt-br"|"es-es"|"de"|"fr-fr"|"it"|"pl"|"zh-cn"|"jp"|"ko"} lang
         */
        fromCsv(data, lang) {
            csvData = CSV.parse(data);
            _lang = lang;
        }
    };
})();
