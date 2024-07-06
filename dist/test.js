import noitaLib from "./noitaLib.esm.sf.js";
console.dir(noitaLib);
noitaLib("dev");

addEventListener("load", () => {
    // noitaLib.Spell.datas.forEach(e => {
    //     // console.log(new noitaLib.Spell(e));
    //     const _ = new noitaLib.Spell(e);
    //     console.log(_);
    //     document.body.append(_);
    // });

    const cache = [];
    for (let i = 1; i < 1001; i++) {
        cache.push(`<img style="zoom: 4;" is="noita--wand" wand.icon="#${i}" title="${i - 1}.png">`);
    }
    document.body.innerHTML = cache.join("");
});
