/**
 * 获取注释文本
 */
const getCommentText = data => `/*
 * Generated by parseTools.wand
 * ${new Date().toLocaleString()}
 * form "data/scripts/gun/procedural/wands.lua"
 * ${data}
 */
//prettier-ignore`;

class Wand {
    /** @param {WandTemplate} data */
    constructor(data) {
        this.name = data.name;
        this.width = data.width;
        this.capacity = data.deck_capacity;
        this.draw = data.actions_per_round;
        this.frieRateWait = data.fire_rate_wait;
        this.reloadTime = data.reload_time;
        this.shuffle = data.shuffle_deck_when_empty;
        this.spreadDegrees = data.spread_degrees;
    }
    toString(spread = false) {
        const str = JSON5.stringify([
            this.width, //=======[0] 宽度 (png 图片宽度-2)
            this.capacity, //====[1] 容量
            this.draw, //========[2] 抽取数
            this.frieRateWait, //[3] 施放延迟
            this.reloadTime, //==[4] 充能时间
            this.shuffle, //=====[5] 乱序
            this.spreadDegrees //[6] 散射
        ]);
        if (spread) return str.slice(1, -1);
        return str;
    }
}

const extraDatasAndImgs = (async () => {
    const extraDataCSV = await parseCSVFromUrl("extraData.csv");
    console.log(extraDataCSV);
    const wandnames = [...extraDataCSV.columnHeads];
    wandnames.shift(); //移除"魔杖名"(表态)
    const promiseList = [];
    /** @type {Array<{name:String,frame:Number,width:Number}>} */
    const extraDatas = [];
    for (const name of wandnames) {
        extraDatas.push({
            name,
            frame: extraDataCSV.get(name, "帧数(动画)"),
            width: -1
        });
        const iconPath = extraDataCSV.get(name, "图标路径");
        promiseList.push(PNG.removeGAMA(`/${iconPath}`));
    }
    /** @type {Array<HTMLImageElement>} */
    const extraImgs = await Promise.all(promiseList);
    const base64s = [];
    for (let i = 0; i < extraDatas.length; i++) {
        const { frame } = extraDatas[i];
        const img = extraImgs[i];
        const canvas = createElement("canvas");
        const ctx = canvas.getContext("2d");
        let paddingRight = 0;
        let paddingBottom = 0;

        if (img.height % 2 === 0) {
            // 高度应该为奇数 偶数的情况下向下补1px空白 向右补1px空白
            paddingRight = 1;
            paddingBottom = 1;
        }

        canvas.height = img.height + paddingBottom;
        // 两帧之间的2px透明间隔移除
        canvas.width = img.width - 2 * (frame - 1) + paddingRight * frame; // 这里在高度为偶数的情况下 宽度也要补充1px留白
        extraDatas[i].width = canvas.width - 2; // 最终结果中的宽度应该移除两侧留白(共2px)
        let frameWidth = 0;
        /** 这个判断着实让人难半 */
        if (frame > 1) frameWidth = img.width / frame - 2;
        else frameWidth = (img.width + paddingRight * frame) / frame - 2;
        let currentWidth = 1; // 留出1px空白
        for (let j = 0; j < frame; j++) {
            const sx = j * (frameWidth + 2) + 1;
            ctx.drawImage(img, sx, 0, frameWidth, img.height, currentWidth, 0, frameWidth, img.height);
            currentWidth += frameWidth + paddingRight;
        }
        base64s.push(canvas.toDataURL("image/png"));
    }

    return {
        /** @type {Array<HTMLImageElement>} */
        imgsCooked: await Image.from(base64s),
        extraDatas
    };
})();

(async () => {
    /** @type {HTMLButtonElement} */
    const button1 = document.querySelector(`#genData1`);
    const button2 = document.querySelector(`#genData2`);
    const button3 = document.querySelector(`#genData3`);
    const buttonText = button1.innerText;
    button1.innerText = "Loading";
    /** @type {Array<HTMLImageElement>} */
    const imgs = await Promise.all(wandTemplateDatas.map(e => PNG.removeGAMA(`/${e.file}`)));
    const { extraDatas, imgsCooked } = await extraDatasAndImgs;
    imgs.push(...imgsCooked);
    // 咱又要手写精灵图拼接了
    const canvas = createElement("canvas");
    canvas.height = 15;
    const ctx = canvas.getContext("2d");
    let totalWidth = 0;
    /** 不出意外这个应该是15 */
    let maxHeight = 0;
    for (let i = 0; i < imgs.length; i++) {
        const width = imgs[i].width - 2;
        const height = imgs[i].height - 2;
        const data = wandTemplateDatas[i];
        if (data) data.width = width;
        totalWidth += width;
        if (height > maxHeight) maxHeight = height;
    }
    canvas.width = totalWidth;
    canvas.height = maxHeight;
    // console.log(imgs);
    /** 记录当前已绘制到的宽度 */
    let currentWidth = 0;
    for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        const sw = img.width - 2;
        const sh = img.height - 2;
        ctx.drawImage(img, 1, 1, sw, sh, currentWidth, (maxHeight - sh) / 2 /* 这里需要绘制到水平居中的位置 */, sw, sh);
        currentWidth += sw;
    }
    document.querySelector("#canvas-viewport").append(canvas);
    button1.addEventListener("click", async () => {
        const data = wandTemplateDatas.map(e => new Wand(e).toString(true));
        const data_str = data.join(",\n    ");
        const comment = getCommentText(`共${data.length}条魔杖模板数据`);
        const fileContent = `${comment}\n[\n    ${data_str}\n]`;
        download(fileContent, "template.match.data.js");
    });
    button2.addEventListener("click", async () => {
        const data = extraDatas.map(e => JSON5.stringify([e.name, e.width, Number(e.frame) === 1 ? Symbol("") : Number(e.frame)]));
        const data_str = data.join(",\n    ");
        const comment = getCommentText(`共${data.length}条魔杖预设数据`);
        const fileContent2 = `${comment}\n[\n    ${data_str}\n]`;

        download(fileContent2, "template.preset.data.js");
    });
    button3.addEventListener("click", async () => {
        const data = wandTemplateDatas.map(e => new Wand(e));
        const cache = [];
        for (let i = 0; i < data.length; i++) {
            const base64 = await urlToBase64(imgs[i], 3);
            cache.push(`{"name":"#${i + 1}","description":"![](${base64})"}`);
        }
        for (let i = 0; i < extraDatas.length; i++) {
            const d = extraDatas[i];
            const base64 = await urlToBase64(imgs[1001 + i], 3);
            cache.push(`{"name":"${d.name}","description":"![](${base64})"}`);
        }
        console.log(cache.join(",\n"));
    });
    button1.innerText = buttonText;
})();