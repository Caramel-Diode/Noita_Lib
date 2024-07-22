/** 面板属性 */
class PanelAttrInfo {
    /** @type {Number} 图标索引 */ #iconIndex;

    static Icon = class Icon extends $icon(7, "面板属性") {
        static urls = asyncSpriteUrls(embed(`#panelAttrIcon2.png`));
        /** @type {PanelAttrInfo?} */ #data;

        /** @param {PanelAttrInfo} data  */
        constructor(data) {
            super(7);
            this.#data = data;
            this.className = "attr-icon";
        }

        connectedCallback() {
            const data = this.#data ?? PanelAttrInfo.query(this.getAttribute("attr.id"));
            this.alt = data.name;
            this.src = data.asyncIconUrl;
        }

        static {
            this.$defineElement("panel-attr");
        }
    };

    /**
     * 面板属性信息构造器
     * @param {Number} iconIndex 图标索引
     * @param {String} name 属性名称
     */
    constructor(iconIndex, name, className) {
        this.#iconIndex = iconIndex;
        /** @type {String} 属性名称 */ this.name = name;
        /** @type {String} 属性值类名 */ this.className = className;
    }
    /** #data: [面板属性数据](panelAttrInfo.data.js) @type {Map<String,PanelAttrInfo>} */
    static datas = new Map(embed(`#panelAttrInfo.data.js`));

    /** @return {Promise<String>} */
    get asyncIconUrl() {
        return new Promise((resolve, reject) => PanelAttrInfo.Icon.urls.then(value => resolve(value[this.#iconIndex - 1])));
    }

    /** 未加载完成的图标(对图片内容无后续操作时调用) */
    get icon() {
        return new PanelAttrInfo.Icon(this);
    }

    static query(id) {
        return this.datas.get(id);
    }
}
