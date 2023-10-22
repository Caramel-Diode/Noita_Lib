/** 面板属性 */
const PanelAttrInfo = class {
    static panelAttrIcons = util.base64ToImg(embed(`#panelAttrIcon.png`));

    /** @type {Number} 图标索引 */ #iconIndex;
    /**
     * 面板属性信息构造器
     * @param {Number} iconIndex 图标索引
     * @param {String} name 属性名称
     */
    constructor(iconIndex, name) {
        this.#iconIndex = iconIndex;
        /** @type {String} 属性名称 */ this.name = name;
    }
    /** #data: [面板属性数据](panelAttrInfo.data.js) @type {Map<String,PanelAttrInfo>} */
    static #datas = new Map(embed(`#panelAttrInfo.data.js`));

    async getIcon() {
        const canvas = document.createElement("canvas");
        canvas.className = "attr-icon";
        canvas.setAttribute("aria-label", `面板属性图标:${this.name}`); // 无障碍标注
        canvas.title = this.name;
        canvas.width = 7;
        canvas.height = 7;
        canvas.getContext("2d").drawImage(await this.constructor.panelAttrIcons, (this.#iconIndex - 1) * 7, 0, 7, 7, 0, 0, 7, 7);
        return canvas;
    }

    static query(id) {
        return this.#datas.get(id);
    }
};
