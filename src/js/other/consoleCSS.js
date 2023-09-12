/** 控制台样式表 */
const consoleCSS =(()=>{
    const base = `font-family:'Fira Code','HarmonyOS Sans SC',sans-serif;color:#FFFFFF;font-weight:bold;padding:0 5px;border-radius:3px;margin-right:4px;`;
    return {
        base,
        log: base + `background-color:#21A366;`,
        warn: base + `background-color:#FFB833;`,
        error: base + `background-color:#C42B1C;`
    }
})();