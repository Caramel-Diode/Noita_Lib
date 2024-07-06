/** @typedef {import("TYPE").MessageBackgroundId} MessageBackgroundId */
/** @typedef {import("TYPE").MessagePresetId} MessagePresetId */
/** @typedef {import("TYPE").MessageBackgroundData} MessageBackgroundData */
/**
 * @template {MessagePresetId} T
 * @typedef {import("TYPE").MessagePresetData<T>} MessagePresetData
 * */

class MessageBackgroundData {
    static backgroundImage = asyncImg(embed(`#background.png`));

    /** @type {Map<MessageBackgroundId,MessageBackgroundData>} */ static data_map = new Map();

    /**
     * @param {String} id
     * @param {Promise<String>} url 默认内容
     */
    constructor(id, url) {
        /** @type {String} id */ this.id = id;
        /** @type {Promise<String>} blob_URL */ this.url = url;
    }

    static async #getBackgroundImgURL(index) {
        const canvas = new OffscreenCanvas(36, 24);
        const ctx = canvas.getContext("2d");
        const offset = index * 18;
        ctx.drawImage(await this.backgroundImage, offset, 0, 18, 24, 0, 0, 18, 24);
        ctx.scale(-1, 1);
        ctx.translate(-36, 0);
        ctx.drawImage(await this.backgroundImage, offset, 0, 18, 24, 0, 0, 18, 24);
        return URL.createObjectURL(await canvas.convertToBlob());
        // const canvas_left = new OffscreenCanvas(18, 24),
        //     canvas_right = new OffscreenCanvas(18, 24),
        //     canvas_result = new OffscreenCanvas(36, 24);

        // const ctx_left = canvas_left.getContext("2d"),
        //     ctx_right = canvas_right.getContext("2d"),
        //     ctx_result = canvas_result.getContext("2d");

        // const offset = index * 18;
        // ctx_left.drawImage(await this.backgroundImage, offset, 0, 18, 24, 0, 0, 18, 24);

        // const data_left = ctx_left.getImageData(0, 0, 18, 24).data;
        // const data_right = new Uint8ClampedArray(1728); //data_left.length
        // for (let i = 0; i < 1728; i += 4) {
        //     // 18 * 4 = 72
        //     // const x = ((i / 4) % 18) + 1;
        //     // const y = (i - (i % 72)) / 72 + 1;
        //     // const x_ = 19 - x; // x的镜像位置
        //     // const i_ = (y - 1) * 72 + (x_ - 1) * 4;
        //     /*
        // x_ = 19 - (((i / 4) % 18) + 1)
        // x_ = 18 - ((i / 4) % 18)
        // i_ = ((i - (i % 72)) / 72) * 72 + ((18 - ((i / 4) % 18)) - 1) * 4
        // i_ = i - (i % 72) + 4 * (18 - ((i / 4) % 18)) - 4
        // i_ = i - (i % 72) + 72 - 4 * ((i / 4) % 18) - 4
        // i_ = i - (i % 72) + 68 - 4 * ((i / 4) % 18)
        // i_ = 68 + i - (i % 72) - 4 * ((i / 4) % 18)
        // i_ = 68 + i - (i % 72) - (4 * (i / 4) % 72)
        // i_ = 68 + i - 2 * (i % 72)
        // */
        //     const i_ = 68 + i - 2 * (i % 72);
        //     data_right[i_] = data_left[i];
        //     data_right[i_ + 1] = data_left[i + 1];
        //     data_right[i_ + 2] = data_left[i + 2];
        //     data_right[i_ + 3] = data_left[i + 3];
        // }
        // ctx_right.putImageData(new ImageData(data_right, 18, 24), 0, 0);

        // ctx_result.drawImage(canvas_left, 0, 0, 18, 24, 0, 0, 18, 24);
        // ctx_result.drawImage(canvas_right, 0, 0, 18, 24, 18, 0, 18, 24);

    }

    /** @param {MessageBackgroundId} id */
    static query = id => this.data_map.get(id) ?? this.data_map.get("important");

    static init() {
        /** #data: [消息数据](data.js) @type {Array} */
        embed(`#data.js`).forEach((v, i) => {
            const data = Object.freeze(new this(v, this.#getBackgroundImgURL(i)));
            this.data_map.set(data.id, data);
        });
    }
}

class MessagePresetData {
    /** @type {Map<MessagePresetId,MessagePresetData>} */ static data_map = new Map();
    /** @param {Array} datas */
    constructor(datas) {
        this.id = datas[0];
        this.text = datas[1];
        this.background = MessageBackgroundData.query(datas[2]);
    }
    /** @param {MessagePresetId} id */
    static query = id => this.data_map.get(id);

    static init() {
        /** #data: [生物群系修正数据](data.js) @type {Array} */
        const datas = embed(`#template.preset.data.js`);
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            this.data_map.set(data.id, data);
        }
    }
}
