/** 面板属性 */
class PanelAttrInfo {
    /** @type {Number} 图标索引 */ #iconIndex;

    static Icon = class Icon extends $icon(7, "面板属性") {
        static urls = new SpriteSpliter("PanelAttrIcons", embed(`#panelAttrIcon.png`)).results;
        /** @type {PanelAttrInfo?} */ #data;

        /** @param {PanelAttrInfo} data  */
        constructor(data) {
            super(7);
            this.#data = data;
            this.className = "attr-icon";
        }

        connectedCallback() {
            const data = this.#data ?? PanelAttrInfo.query(this.dataset.id);
            this.alt = data.name;
            this.src = data.asyncIconUrl;
        }

        static {
            this.define("panel-attr");
        }
    };

    /**
     * 面板属性信息构造器
     * @param {Number} iconIndex 图标索引
     * @param {String} id 属性ID
     * @param {String} [name] 属性名称
     */
    constructor(iconIndex, id, name = id) {
        this.#iconIndex = iconIndex + 1;
        /** @type {String} 属性名称 */
        this.name = name;
        /** @type {String} 属性值类名 */
        this.className = id.replace(/([A-Z])/g, "-$1").toLowerCase(); // 转换驼峰命名为烤串命名作为类名
    }
    /** @type {Map<String,PanelAttrInfo>} */
    static datas = (() => {
        /** @type {Array<{[key: String]:String}|Number|String>} */
        const rawData = embed(`#panelAttrInfo.data.js`);
        return rawData.reduce((map, value, index) => {
            /* prettier-ignore */
            if (typeof value === "object")
                for (const key in value) 
                    map.set(key, new this(index, key, value[key]));
            else 
                map.set("" + value, new this(index, "" + value));
            return map;
        }, new Map());
    })();

    /** @return {Promise<String>} */
    get asyncIconUrl() {
        return new Promise(resolve => PanelAttrInfo.Icon.urls.then(value => resolve(value[this.#iconIndex - 1])));
    }

    /** 未加载完成的图标(对图片内容无后续操作时调用) */
    get icon() {
        return new PanelAttrInfo.Icon(this);
    }

    static query(id) {
        return this.datas.get(id);
    }
}
