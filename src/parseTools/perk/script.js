/**
 * 获取注释文本
 */
const getCommentText = data => `/*
 * Generated by parseTools.perk
 * ${new Date().toLocaleString()}
 * form "data/scripts/perks/perk_list.lua"
 * ${data}
 */
//prettier-ignore`;

const zh_cn = langData.getZH_CN;

class Perk {
    /** @param {typeof perkDatas[0]} data */
    constructor(data) {
        /** 天赋id */
        this.id = data.id;
        /** @type {Number} 天赋类型 */
        this.type = data.type;
        this.nameKey = data.name.slice(1);
        this.name = zh_cn(this.nameKey) ?? this.nameKey;
        this.descKey = data.desc.slice(1);
        this.desc = zh_cn(this.descKey) ?? this.descKey;
        this.maxStack = data.stackable_maximum;
        this.maxInPool = data.max_in_perk_pool;
        this.gameEffect = data.game_effect;
        this.usableByEnemies = data.usable_by_enemies;
    }
    toString() {
        return JSON5.stringify([
            this.id, //==================[0] id
            this.name, //================[1] 名称
            this.desc, //================[2] 描述
            this.type, //================[3] 类型
            this.maxStack, //============[4] 堆叠极限
            this.maxInPool, //===========[5] 天赋池最大数量
            this.gameEffect, //==========[6] GameEffect
            this.usableByEnemies, //=====[7] 敌人能否使用
            this.nameKey, //=============[8] 名称翻译键
            this.descKey //==============[9] 描述翻译键
        ]);
    }
}
addEventListener("DOMContentLoaded", async () => {
    /** @type {HTMLButtonElement} */
    const button = document.querySelector(`#genData`);
    const buttonText = button.innerText;
    button.innerText = "Loading";
    const _getImgDataWithoutBg = await getImgDataWithoutBg;
    const essencesCSV = CSV.parse(await (await fetch("essences.csv")).text());
    // console.log(essencesCSV);
    // 从1开始是为了跳过"id"
    for (let i = 1; i < essencesCSV.columnHeads.length; i++) {
        const id = essencesCSV.columnHeads[i];
        perkDatas.push({
            id: id,
            name: essencesCSV.get(id, "nameKey"),
            desc: essencesCSV.get(id, "descKey"),
            type: Number(essencesCSV.get(id, "type")),
            stackable_maximum: Number(essencesCSV.get(id, "maxStack")),
            max_in_perk_pool: Number(essencesCSV.get(id, "maxInPool")),
            game_effect: essencesCSV.get(id, "gameEffect"),
            usable_by_enemies: Number(essencesCSV.get(id, "usableByEnemies")),
            icon: essencesCSV.get(id, "icon"),
            isEssences: true
        });
    }

    const disposablePerksCSV = CSV.parse(await (await fetch("disposablePerks.csv")).text());
    const disposablePerkIDs = [...disposablePerksCSV.columnHeads];
    disposablePerkIDs.shift(); // 移除"id"
    perkDatas.forEach(e => {
        if (disposablePerkIDs.includes(e.id)) e.type = 2;
    });

    // 这里需要过滤背景 不能用createSprite 创建了
    // const canvas = await createSprite(iconUrls, {
    //     clip: { sx: 2, sy: 2 },
    //     size: { width: 12, height: 12 }
    // });

    /** @type {Array<HTMLImageElement>} */
    const imgs = await Promise.all(perkDatas.map(e => PNG.removeGAMA(`/${e.icon}`)));
    const canvas = createElement("canvas");
    canvas.height = 12;
    canvas.width = 12 * perkDatas.length;
    const ctx = canvas.getContext("2d");

    for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        let type = "common";
        if (perkDatas[i].isEssences) {
            type = "essence";
        }
        const imgData = _getImgDataWithoutBg(img, type);
        ctx.putImageData(imgData, i * 12 - 2, -2, 2, 2, 12, 12);
    }
    document.querySelector("#canvas-viewport").append(canvas);
    button.addEventListener("click", () => {
        /** @type {Array<Perk>} */
        const data = perkDatas.map(e => new Perk(e));
        // console.log(data);
        const fileContent = `${getCommentText(`共${perkDatas.length}条天赋数据`)}\n[\n    ${data.join(",\n    ")}\n]`;
        download(fileContent, "perk.data.js");
    });
    button.innerText = buttonText;
});
