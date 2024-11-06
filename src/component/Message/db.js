class MessageData {
    static #bgUrls = new SpriteSpliter("MessageBackgrounds", async () => {
        const reader = new FileReaderSync();
        /** @type {ImageEncodeOptions} */
        const imageEncodeOptions = { type: "image/webp", quality: 1 };
        const bitmap = await createImageBitmap(await (await fetch(embed(`#background.png`))).blob());
        const bgAmount = bitmap.width / 18; //每个背景的九点图的一半是18px
        const blobs = new Array(bgAmount);
        for (let i = 0; i < bgAmount; i++) {
            const canvas = new OffscreenCanvas(36, 24);
            const ctx = canvas.getContext("2d");
            const offset = i * 18;
            //因为是一半的九点图 需要镜像绘制另外一侧
            ctx.drawImage(bitmap, offset, 0, 18, 24, 0, 0, 18, 24);
            ctx.scale(-1, 1);
            ctx.translate(-36, 0);
            ctx.drawImage(bitmap, offset, 0, 18, 24, 0, 0, 18, 24);
            blobs[i] = canvas.convertToBlob(imageEncodeOptions);
        }
        postMessage((await Promise.all(blobs)).map(blob => reader.readAsDataURL(blob)));
    }).results;

    /** @type {Map<String,MessageData>} */
    static data = new Map();

    /** @type {{[key: String]:Promise<String>}} */
    static backgrounds = {};

    /**
     * @param {String} id
     * @param {String} text
     * @param {Number} backgroundId
     */
    constructor(id, text, backgroundId) {
        this.id = id;
        this.text = text;
        this.background = MessageData.backgrounds[backgroundId];
    }

    static init() {
        let i = 0;
        const datas = {
            important: {},
            fungal_shift: { FUNGAL_SHIFT: "你听见“?”这个词在回响，变换着色彩" },
            booby_trapped: { BOOBY_TRAPPED: "这里陷阱遍布" },
            conductive: { CONDUCTIVE: "空气像是被电离了" },
            fog_of_war: { FOG_OF_WAR_REAPPEARS: "神秘的黑暗笼罩在这里" },
            fog_of_war_clear_at_player: { FOG_OF_WAR_CLEAR_AT_PLAYER: "这里非常昏暗" },
            freezing: { FREEZING: "空气寒冷刺骨" },
            fungal: { FUNGAL: "空气中弥漫着孢子" },
            furnished: { FURNISHED: "这里让你感觉很舒适" },
            gas: { GAS_FLOODED: "空气中有燃气的味道" },
            gold: {
                GOLD_VEIN: "你感觉这里埋藏着财富",
                GOLD_VEIN_SUPER: "你感觉这里埋藏着巨大的财富"
            },
            gravity_fields: { GRAVITY_FIELDS: "你感到一股无形的力量在拉扯着你" },
            high_gravity: { HIGH_GRAVITY: "空气很是沉重" },
            hot: { HOT: "一股热浪扑面而来" },
            invisible: { INVISIBILITY: "你突然无法聚焦视线" },
            low_gravity: { LOW_GRAVITY: "空气很是轻盈" },
            moist: { FLOODED: "这些水是从哪里来的？" },
            ominous: { OMINOUS: "一切都感觉要被黑暗吞噬" },
            perforated: { PERFORATED: "这里感觉很宽敞" },
            plant_infested: { PLANT_INFESTED: "闻起来好像雨后泥土的气味" },
            shielded: { SHIELDED: "这里真是太安全了" },
            spooky: { SPOOKY: "你的后背发凉，汗毛直竖" },
            sunlight: { PROTECTION_FIELDS: "一切都沐浴在神秘的光芒之中" },
            wormy: { WORMY: "可怕的爬动声到处都是" }
        };
        for (const bgId in datas) {
            const bgIndex = i++;
            Reflect.defineProperty(this.backgrounds, bgId, {
                value: MessageData.#bgUrls.then(urls => urls[bgIndex]),
                enumerable: true
            });
            const presetDatas = datas[bgId];
            for (const id in presetDatas) this.data.set(id, freeze(new this(id, presetDatas[id], bgId)));
        }
    }
}
