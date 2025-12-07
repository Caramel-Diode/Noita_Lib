/**
 * @typedef {{[K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string ? CSSStyleDeclaration[K] : never} & {[K:string]: StyleAttrs}} StyleAttrs 样式属性
 */

/** @typedef {`:${"hover"|"dir()"|"visited"|"checked"|"defined"|"open"|"popover-open"|"modal"|"fullscreen"|"picture-in-picture"|"enabled"|"disabled"|"read-only"|"read-write"|"placeholder-shown"|"autofill"|"default"|"indeterminate"|"blank"|"valid"|"invalid"|"in-range"|"out-of-range"|"required"|"optional"|"user-valid"|"user-invalid"|"lang()"|"any-link"|"link"|"local-link"|"target"|"target-within"|"scope"|"playing"|"paused"|"seeking"|"buffering"|"stalled"|"muted"|"volume-locked"|"current"|"past"|"future"|"root"|"empty"|"nth-child()"|"nth-last-child()"|"first-child"|"last-child"|"only-child"|"nth-of-type()"|"nth-last-of-type()"|"first-of-type"|"last-of-type"|"only-of-type"|"host"|"host()"|"host-context()"|"has-slotted"|"active"|"focus"|"focus-visible"|"focus-within"|"is()"|"not()"|"where()"|"has()"|"state()"|"left"|"right"|"first"}`} PseudoClasses*/

/**
 * @typedef {{[key in (keyof HTMLElementTagNameMap)|"*"|"[attr=]"|PseudoClasses]: StyleAttrs} } CSSStyleMap
 */

/**
 * 生成构造样式表
 */
const css = (() => {
    /**
     * @param {StyleAttrs} declaration
     * @returns {string}
     */
    const cssText = declaration => {
        const sheet = new CSSStyleSheet();
        /** @type {CSSStyleRule} */
        const { style } = sheet.cssRules[sheet.insertRule(`*{}`)];
        const result = [];
        for (const prop in declaration) {
            /** @type {string} */
            let data = declaration[prop];
            if (typeof data === "object") {
                result.push(`${prop}{${cssText(data)}}`);
                continue;
            }
            data = String(data).trim();
            // CSS content 属性设置是无效的 这里要单独记录
            if (prop === "content") result.push(`content:"${data}";`);
            else if (prop.startsWith("--")) style.setProperty(prop, data);
            //允许使用$简化自定义css属性的"--"前缀
            else if (prop.startsWith("$")) style.setProperty("--" + prop.slice(1), data);
            else if (prop in style) {
                // 修复带有 `!important` 的属性值无法正常设置的问题
                if (data.endsWith("!important")) result.push(cssText({ [prop]: data.slice(0, -10) }).slice(0, -1) + " !important;");
                else style[prop] = data;
            }
        }
        return style.cssText + result.join("");
    };

    /**
     * @param {string | CSSStyleMap} [datas]
     * @param {CSSStyleSheetInit & {name:string}} [init]
     * @returns {CSSStyleSheet}
     */
    const fn = (datas = "", init = {}) => {
        if (typeof datas === "object") {
            const cache = [];
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
            return fn(cache.join(""), init);
        }
        datas = String(datas);
        init.baseURL ??= URL.createObjectURL(new Blob([datas], { type: "text/css" }));
        init.name ??= "";
        const sheet = new CSSStyleSheet(init);
        Reflect.defineProperty(sheet, "href", { value: init.baseURL, configurable: false });
        sheet.replaceSync(`@layer ${init.name}{${datas}}`);
        // return (await import(URL.createObjectURL(new Blob([cssText], { type: "text/css" })), { with: { type: "css" } })).default;
        return sheet;
    };
    return fn;
})();
window.css = css;
