/** 
 * @file Noita Web Lib
 * #home: 入口
 */
"use strict";

/** 
 * Noita Web 工具库
 * @author 半导体果冻
 * @version 1.0
 * @namespace
 */
const noitaLib = (() => {
    "other/utilities.js";
    "other/consoleCSS.js";
    "other/runtimeEnvironment.js";
    "other/damageData.js";
    "other/save.js";
    /**
     * @global
     * @namespace
     * `📁 数据库` 
     */
    const DB = {};
    "db/base.js";
    DB.state = class { };
    "db/material.js";
    "db/entity.js";
    "db/spell.js";
    "db/wand.js";
    "db/perk.js";
    DB.orb = class { };

    DB.entity.init();
    DB.spell.init();
    DB.wand.init();
    DB.perk.init();
    /**
     * @global
     * @namespace
     * `📦️ 组件`
     */
    const component = {};
    /** [基本元素](component/cursor.js) */
    "component/cursor.js";
    /** [基本元素](component/base.js) */
    "component/base.js";
    /** [实体元素](component/entity.js) */
    "component/entity.js";
    /** [法术元素](component/spell.js) */
    "component/spell.js";
    /** [法杖元素](component/wand.js) */
    "component/wand.js";
    /** [天赋元素](component/perk.js) */
    "component/perk.js";

    /** document.createElement (简写) */
    const dc = (tagName, options) => document.createElement(tagName, options);
    const lib = {
        /** `版本` `1.0` */version() {
            const VERSION = "1.0";
            const AUTHOR = "半导体果冻";
            const FONT_STYLE = "font-family:'Fira Code','HarmonyOS Sans SC';,sans-serif";
            console.log(
                `\n%c🤪%cNoita Web 构建工具库\n%cver%c${VERSION}_bate%c\nmade by ${AUTHOR}`,
                `color:#00000000;line-height:60px;font-size:60px;background-repeat:no-repeat;background-position:center;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAA6BAMAAAC64Z+PAAAAHlBMVEUAAAD/8ZD/1WcCIUD61VP+tmL+i17/blnmWFa5SlGhs86pAAAAAXRSTlMAQObYZgAAAWNJREFUeNptzsFOxCAQBuDZ3Zh4tYl3g2HPNX0B4xMYEtgnAPYJSvfsoXAz8VLe1pkptN0qWeHvxz9EeKIFAPTH6yhwtXAQ71U+GBohKjQEB9xetkCb2MAbfdcKARdqpZFCzd+l8iyEFJ0kUAz0/doelcTzk0eUUB0AAv4IpFKyxf9Y4ZL0ilBaIYDSUkt6RUqlCY5aK07oDBh0AT3Dg57TAlDBVJDaUDpbU+CsLSVtrC0jVltuWFdGrNX/gXauvGEwUsPVhnHOtHzYCnxljPvTWIHSxTs/g+s9JTxqw7ueoQ8zXPqe4BJ8HQmBwPtQG4GTCxX8nPwKI6frAtdhGDCFcVxGxpEgsgOlQDCMMdaRyCNxLDBEvirHCnGBWyqNKc0QJ4ZbTlOBlHgkrY2JrtKUc3kjc0qpQrlKeQFOj7jn7w3QnvMGTh2tdoXNQvjZQwf3cF9AuC9A2hUg7QrwtSvAibZfWguwLZbztvcAAAAASUVORK5CYII=');`,
                `${FONT_STYLE}line-height:60px;color:#DDDDDD;font-size:16px;font-weight:bold;text-shadow:0 0 3px #FFFFFF;`,
                `${FONT_STYLE}color:#FFFFFF;background-color:#50743E;padding:0 5px;border-radius:3px 0 0 3px;`,
                `${FONT_STYLE}color:#FFFFFF;background-color:#AAAAAA;padding:0 5px;border-radius:0 3px 3px 0;`,
                `${FONT_STYLE}font-size:12px;`
            );
        },
        /** # [`🔥 状态`](https://noita.wiki.gg/zh/wiki/状态) */
        state: {},
        /** # [`🧊 材料`](https://noita.wiki.gg/zh/wiki/材料) */
        material: {},
        /** # [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
        entity: {
            queryById: DB.entity.queryById,
            HTMLElement: component.entity
        },
        /** # [`✨ 法术`](https://noita.wiki.gg/zh/wiki/法术) */
        spell: {
            queryById: DB.spell.queryById,
            queryByName: DB.spell.queryByName,
            queryByExpression: DB.spell.queryByExpression,
            HTMLElement: component.spell
        },
        /** # [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
        wand: {
            HTMLElement: component.wand
        },
        /** # [`🎲 道具`](https://noita.wiki.gg/zh/wiki/道具) */
        item: {},
        /** # [`🛡️ 天赋`](https://noita.wiki.gg/zh/wiki/天赋) */
        perk: {
            queryById: DB.perk.queryById,
            queryByName: DB.perk.queryByName,
            HTMLElement: component.perk
        },
        /** # [`👿 敌人`](https://noita.wiki.gg/zh/wiki/敌人) */
        enemy: {},
        /** # [`🔮 真理魔球`](https://noita.wiki.gg/zh/wiki/真理魔球) */
        orb: { },
        //#endregion
        save: save,
        cursor: {
            add: () => NoitaCursor.add(),
            remove: () => NoitaCursor.remove()
        }
    };
    lib.version();
    Object.setPrototypeOf(lib, null);
    return Object.freeze(lib);
})();