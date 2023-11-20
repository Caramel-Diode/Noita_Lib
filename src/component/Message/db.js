const MessageBackgroundData = class {
    static backgroundImage = util.base64ToImg(embed(`#background.png`));

    /** @type {Map<String,MessageData>} */ static #data_map = new Map();
    /** @type {Number} 辅助变量 用于记录消息背景索引 */ static #index = 0;
    /** @type {Number} 图标索引 */ #_index;
    /**
     * @param {String} id
     * @param {String} defaultContent 默认内容
     * @param {String} description 描述
     */
    constructor(id) {
        this.#_index = MessageBackgroundData.#index;
        MessageBackgroundData.#index++;
        this.id = id;
        /** @type {Promise<String>} blob_URL */ this.url = this.#getBackgroundImgURL();
    }

    async #getBackgroundImgURL() {
        const canvas_left = document.createElement("canvas"),
            canvas_right = document.createElement("canvas");
        canvas_left.height = 24;
        canvas_right.height = 24;
        canvas_left.width = 18;
        canvas_right.width = 18;
        const ctx_left = canvas_left.getContext("2d"),
            ctx_right = canvas_right.getContext("2d");
        const img = await MessageBackgroundData.backgroundImage;
        const offset = this.#_index * 18;
        ctx_left.drawImage(img, offset, 0, 18, 24, 0, 0, 18, 24);

        const data_left = ctx_left.getImageData(0, 0, 18, 24).data;
        const data_right = new Uint8ClampedArray(1728); //data_left.length
        for (let i = 0; i < 1728; i += 4) {
            // 18 * 4 = 72
            // const x = ((i / 4) % 18) + 1;
            // const y = (i - (i % 72)) / 72 + 1;
            // const x_ = 19 - x; // x的镜像位置
            // const i_ = (y - 1) * 72 + (x_ - 1) * 4;
            /*
            x_ = 19 - (((i / 4) % 18) + 1)
            x_ = 18 - ((i / 4) % 18)
            i_ = ((i - (i % 72)) / 72) * 72 + ((18 - ((i / 4) % 18)) - 1) * 4
            i_ = i - (i % 72) + 4 * (18 - ((i / 4) % 18)) - 4
            i_ = i - (i % 72) + 72 - 4 * ((i / 4) % 18) - 4
            i_ = i - (i % 72) + 68 - 4 * ((i / 4) % 18)
            i_ = 68 + i - (i % 72) - 4 * ((i / 4) % 18)
            i_ = 68 + i - (i % 72) - (4 * (i / 4) % 72)
            i_ = 68 + i - 2 * (i % 72)
            */
            const i_ = 68 + i - 2 * (i % 72);
            data_right[i_] = data_left[i];
            data_right[i_ + 1] = data_left[i + 1];
            data_right[i_ + 2] = data_left[i + 2];
            data_right[i_ + 3] = data_left[i + 3];
        }
        ctx_right.putImageData(new ImageData(data_right, 18, 24), 0, 0);

        const canvas_result = document.createElement("canvas");
        canvas_result.height = 24;
        canvas_result.width = 36;
        const ctx_result = canvas_result.getContext("2d");
        ctx_result.drawImage(canvas_left, 0, 0, 18, 24, 0, 0, 18, 24);
        ctx_result.drawImage(canvas_right, 0, 0, 18, 24, 18, 0, 18, 24);

        return util.base64ToObjectURL(canvas_result.toDataURL("image/png"), this.id);
    }

    static queryById(id) {
        const result = this.#data_map.get(id);
        if (result) return result;
        else return this.#data_map.get("important");
    }

    static init() {
        /** #data: [消息数据](data.js) @type {Array} */
        const datas = embed(`#data.js`);
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            this.#data_map.set(data.id, data);
        }
    }
};

const MessagePresetData = class {
    static #data_map = new Map();
    /** @param {Array} datas */
    constructor(datas) {
        this.id = datas[0];
        this.text = datas[1];
        this.background = MessageBackgroundData.queryById(datas[2]);
    }
    static queryById(id) {
        return this.#data_map.get(id);
    }
    static init() {
        /** #data: [生物群系修正数据](data.js) @type {Array} */
        const datas = embed(`#template.preset.data.js`);
        for (let i = 0; i < datas.length; i++) {
            const data = Object.freeze(new this(datas[i]));
            this.#data_map.set(data.id, data);
        }
    }
};
