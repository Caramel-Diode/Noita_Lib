/**
 * @typedef {Object} SpellRecipeItem
 * @prop {Array<import("@spell").SpellData>} datas 法术数据
 * @prop {{remain:Number}} instanceData 实例数据(剩余次数)
 * @prop {Number} min (最小数量)
 * @prop {Number} max (最大数量)
 */
const { isWordPart, isNumberPart, isBlank } = Lexer;

const lexer = new Lexer([
    Lexer.preset.BLANK,
    {
        id: "NUMBER",
        match(source) {
            const sign = source[0];
            if (sign !== "+" && sign !== "-" && !isNumberPart(sign)) return;
            let i = 1;
            for (; i < source.length; i++) {
                if (isNumberPart(source[i])) continue;
                return source.slice(0, i);
            }
            if (i) return source;
        },
        value: raw => +raw
    },
    Lexer.preset.SPELL_ID,
    Lexer.preset.SPELL_TAG,
    {
        id: "SPELLS_EXP",
        match(source) {
            if (!source.startsWith("[")) return;
            let i = 1;
            for (; i < source.length; i++) {
                if (source[i] === "]") return source.slice(0, i + 1);
            }
        },
        value: raw => raw.slice(1, -1)
    },
    { id: "WAVE", data: "~" },
    { id: "COLON", data: ":" },
    { id: "CARET", data: "^" }
]);

/** @throws {SyntaxError} */
const createSpellGroup = ({ id, exp }) => {
    let datas = [];
    if (id && id !== "_") datas[0] = Spell.query(id);
    if (exp) datas = Spell.queryByExp(exp);
    return { datas, instanceData: { remain: Infinity }, min: 1, max: 1 };
};

/**
 * 法术序列解析
 * @param {string} source 表达式
 * @returns {Array<SpellRecipeItem> & { includedSpells: Set<string> }}
 * @throws {SyntaxError}
 */

const parse = source => {
    if (!source) return [];
    /** @type {Array<ReturnType<typeof createSpellGroup>>} */
    const result = [];
    let currentSpellResult = result[0];
    let remainState = 0;
    let repeatState = 0;
    for (const { data, type } of lexer.tokenise(source)) {        
        currentSpellResult = result.at(-1);
        switch (type) {
            case "SPELL_ID":
                remainState = 0;
                repeatState = 0;
                result.push(createSpellGroup({ id: data }));
                break;
            case "SPELL_TAG":
                remainState = 0;
                repeatState = 0;
                result.push(createSpellGroup({ exp: "#" + data }));
                break;
            case "SPELLS_EXP":
                remainState = 0;
                repeatState = 0;
                result.push(createSpellGroup({ exp: data }));
                break;
            case "COLON":
                repeatState = 1;
                break;
            case "WAVE":
                if (repeatState === 1) currentSpellResult.max = currentSpellResult.min = 0;
                if (repeatState === 0) break;
                repeatState = 3;
                break;
            case "CARET":
                remainState = 1;
                break;
            case "NUMBER":
                if (remainState === 1) {
                    currentSpellResult.instanceData.remain = data;
                    remainState = 0;
                } else if (repeatState === 1) {
                    currentSpellResult.min = data;
                    currentSpellResult.max = data;
                    repeatState = 2;
                } else if (repeatState === 3) {
                    repeatState = 0;
                    currentSpellResult.max = data;
                    if (data > currentSpellResult.min) break;
                    [currentSpellResult.min, currentSpellResult.max] = [currentSpellResult.max, currentSpellResult.min];
                }
            //--- 无效数值
        }
    }
    Reflect.defineProperty(result, "includedSpells", {
        get() {
            new Set(result.map(({ datas }) => datas));
        },
        enumerable: false
    });
    return result;
};
