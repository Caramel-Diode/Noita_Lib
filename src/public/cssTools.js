/**
 * @typedef {{[key : keyof HTMLElementTagNameMap]: {[K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends String ? K :never]: String}} & {
 * ":host":{[K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends String ? K :never]: String};
 * "*":{[K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends String ? K :never]: String};
 * }} CSSStyleMap
 */

/**
 * 生成构造样式表
 */
const css = (() => {
    /**
     * @param {CSSStyleDeclaration} declaration
     */
    const cssText = declaration => {
        const { style } = document.createElement("html");
        const nestData = [];
        const cssTexts_important = [];
        for (const prop in declaration) {
            const data = declaration[prop];
            if (typeof data === "object") nestData.push(`${prop}{${cssText(data)}}`);
            else if (prop.startsWith("--")) style.setProperty(prop, data);
            //允许使用$简化自定义css属性的"--"前缀
            else if (prop.startsWith("$")) style.setProperty("--" + prop.slice(1), data);
            else if (prop in style) {
                // 修复带有 `!important` 的属性值无法正常设置的问题
                if (String(data).includes("!important")) {
                    /** @type {String} */
                    const text = cssText({ [prop]: data.replace("!important", "").trim() });
                    cssTexts_important.push(text.replace(";", " !important;"));
                } else style[prop] = data;
            }
        }
        return style.cssText + cssTexts_important.join("") + nestData.join("");
    };

    /**
     * @param {String | CSSStyleMap & { [key: string]:{[K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends String ? K :never]: String} }|NodeListOf<HTMLStyleElement>|HTMLStyleElement} datas
     * @param {CSSStyleSheetInit} init
     * @returns {CSSStyleSheet}
     */
    const fn = (datas, init) => {
        const styleSheet = new CSSStyleSheet(init);
        const cache = [];
        const _type = typeof datas;
        if (_type === "object") {
            for (const key in datas) {
                const data = datas[key];
                if (key.startsWith("@keyframes")) {
                    const _cache = [];
                    for (const frame in data) {
                        let frameName = frame;
                        if (!isNaN(frame)) frameName += "%";
                        _cache.push(`${frameName}{${cssText(data[frame])}}`);
                    }
                    cache.push(`${key}{${_cache.join("")}}`);
                } else if (key.startsWith("@property")) {
                    const _cache = [];
                    if (data.syntax) _cache.push(`syntax:${data.syntax}`);
                    if (data.inherits) _cache.push(`inherits:${data.syntax}`);
                    if (data.initialValue) _cache.push(`initial-value:${data.initialValue}`);
                    cache.push(`${key}{${_cache.join(";")}}`);
                } else cache.push(`${key}{${cssText(data)}}`);
            }
            styleSheet.replaceSync(cache.join(""));
        } else if (_type === "string") styleSheet.replaceSync(datas);
        return styleSheet;
    };
    return fn;
})();
window.css = css;