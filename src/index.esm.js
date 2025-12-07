/** #home: 主入口 @file Noita Web Lib */
embed(`#public/polyfill.js`);
/** @type {Console} 代理console实现在非dev模式下不在控制台显示调试信息 */
let { console } = window;
embed(`#embedList.js`);
console = ((blank = _ => 0) => new Proxy({}, { get: () => blank }))();
const noitaLib = mode => {
    const ver = "1.0";
    const author = "半导体果冻";
    const font_style = "font-family:'Fira Code','HarmonyOS Sans SC';,monospace";
    const logImgBase64 = embed(`#Noita logo.webp`);
    if (mode?.toLocaleLowerCase() === "dev") console = window.console;
    //prettier-ignore
    console.log(
        `\n%cNoita%c Web 构建工具库\n%cver%c${ver}_bate%c\nmade by ${author}`,
         `color:#00000000;line-height:70px;font-size:40px;background-repeat:no-repeat;background-position:center;background-image:url('${logImgBase64}');`,
        `${font_style}line-height:60px;color:#DDDDDD;font-size:16px;font-weight:bold;text-shadow:0 0 3px #FFFFFF;`,
        `${font_style}color:#FFFFFF;background-color:#50743E;padding:0 5px;border-radius:3px 0 0 3px;`,
        `${font_style}color:#FFFFFF;background-color:#AAAAAA;padding:0 5px;border-radius:0 3px 3px 0;`,
        `${font_style}font-size:12px;`);
    return ver;
};
runAtEnd.run();
// 允许按需导入
export { translation, Material, Entity, Spell, Wand, Perk, Container, Message, Status, cursor, XML, CSV };
// 提供默认导出 允许直接使用 import noitaLib form "./noitaLib.esm.js" 的方式进行导入
export default Object.freeze(Object.assign(noitaLib, { translation, Material, Entity, Spell, Wand, Perk, Container, Message, Status, Orb, cursor, XML, CSV }));
