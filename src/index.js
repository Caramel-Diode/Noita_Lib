/** #home: 主入口 @file Noita Web Lib */
"use strict";
// API补丁
embed(`#public/polyfill.js`);
/**
 * `NoitaLib` **`🏠️入口`**
 * @author 半导体果冻
 * @version 1.0
 */
const noitaLib = (() => {
    /** @type {Console} 代理console实现在非dev模式下不在控制台显示调试信息 */
    let console = ((blank = _ => 0) => new Proxy({}, { get: () => blank }))();
    
    const env = {
        dev: false,
        offscreen: false
    };
    embed(`#embedList.js`);
    /**
     *
     * @param {string} mode
     * @returns {string}
     */
    const noitaLib = mode => {
        const ver = "1.0";
        const author = "半导体果冻";
        const font_style = "font-family:'Fira Code','HarmonyOS Sans SC',monospace;";
        const logImgBase64 = embed(`#Noita logo.webp`);
        for (const p of (mode ?? "").split(/\s+/)) env[p.toLowerCase()] = true;
        if (env.dev) console = window.console;
        offscreenCSS.disabled = !env.offscreen;
        //prettier-ignore
        console.log(
            `\n%cNoita%c Web 构建工具库\n%cver%c${ver}_bate%c\nmade by ${author}`,
             `color:#0000;line-height:70px;font-size:40px;background-repeat:no-repeat;background-position:center;background-image:url('${logImgBase64}');`,
            `${font_style}line-height:60px;color:#DDD;font-size:16px;font-weight:bold;text-shadow:0 0 3px #FFF;`,
            `${font_style}color:#FFF;background-color:#50743E;padding:0 5px;border-radius:3px 0 0 3px;`,
            `${font_style}color:#FFF;background-color:#AAA;padding:0 5px;border-radius:0 3px 3px 0;`,
            `${font_style}font-size:12px;`);
        return ver;
    };
    runAtEnd.run();
    return Object.freeze(Object.assign(noitaLib, { translation, Material, Entity, Spell, Wand, Perk, Container, Message, Status, Orb, cursor, XML, CSV }));
})();
