class ContainerData {
    /** @type {Map<String,>} */
    static data = new Map();
    /**
     * @param {String} id
     * @param {String} name
     * @param {String} desc
     * @param {String} paths
     */
    constructor(datas) {
        /** @type {String} */ this.id = datas[0];
        /** @type {String} */ this.name = datas[1];
        /** @type {String} */ this.desc = datas[2];
        /** @type {String} */ this.paths = datas[3];
    }
    createSVG(clipValue = -1, mixColor = "") {
        const svg = createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add(this.id);
        svg.setAttribute("height", 16);
        svg.setAttribute("width", 16);
        svg.innerHTML = this.paths;
        if (clipValue !== -1) svg.style.setProperty("--percentage", clipValue);
        if (mixColor) svg.style.setProperty("--mix-color", mixColor);
        return svg;
    }
    static query(id) {
        return this.data.get(id) ?? this.data.get("common");
    }
    static init() {
        //prettier-ignore
        [
            ["common", "瓶子", "用来盛装液体的魔法玻璃瓶<br/>光标置于物品上时，按$0饮用", `<path d="M5 2v1h2V2" fill="#777777"/><path d="M7 2h1v1H7" fill="#959595"/><path d="M8 2h3v1H8" fill="#c3c3c3"/><path class="fill-5a5a5a" d="M6 3v4H5v1H4v1H3v3h1v1h1v1h6v-1h-1V3"/><path class="fill-777777" d="M10 3H7v1H6v4H5v3h1v1h1v1h5v-1h1v-1h-3z"/><path class="fill-959595" d="M10 4H7v3H6v4h1v1h5v-1h1V9h-1V8h-1V7h-1"/><path class="fill-c3c3c3" d="M9 4H8v2H7v4h1v1h3v-1h1V9h-1V8h-1V5H9"/>`],
            ["conical", "瓶子", "用来盛装液体的魔法玻璃瓶<br/>光标置于物品上时，按$0饮用", `<path d="M9 2h1v1H9" fill="#c3c3c3"/><path d="M7 2h2v1H7" fill="#959595"/><path d="M6 2v1h1V2z" fill="#777777"/><path class="fill-5a5a5a" d="M8 3H7v2H6v2H5v2H4v2H3v2h1v1h4"/><path class="fill-777777" d="M8 3v1H7v1H6v3H5v3H4v2h4v1h4v-1H9V3"/><path class="fill-959595" d="M8 4h1v3h1v2h1v2h1v2H8"/><path class="fill-c3c3c3" d="M9 5h1v2h1v2h1v2h1v2h-1v-2h-1V9h-1V7H9z"/>`],
            ["jar", "罐子", "本质上它只是个普通的玻璃罐子，但...<br/>光标置于物品上时，按$0饮用", `<path d="M4 2H5V3H4" fill="#5a5a5a"/><path d="M5 2h2v1H5" fill="#777777"/><path d="M7 2h1v1H7" fill="#959595"/><path d="M8 2h4v1H8" fill="#c3c3c3"/><path class="fill-5a5a5a" d="M5 3h6V4H5"/><path class="fill-c3c3c3" d="M4 4h8v7H4"/><path class="fill-5a5a5a" d="M4 4v1h1V4zm0 2v3h1V6zm0 4v3h1v-3zm1 3v1h6v-1h1v-1h-2v1H9v-1H8v1H7v-1H6v1z"/><path class="fill-959595" d="M5 4v8h7V9h-1v1h-1v1H9v-1H8V9H7V7H6V6h1V5H6V4zm4 6h1V9H9z"/><path class="fill-777777" d="M4 5v1h2V5zm1 2v1h1V7zM4 9v1h1v3h1v-2h1v-1H6V9zm3 2v2h1v-2zm4 0v1h1v-1zm-2 1v1h1v-1z"/>`],
            ["bag", "口袋", "搬运粉末材料的方便口袋", `<path class="fill-7a6a44" d="M6 5h7v3h1v2h1v3h-1v1h-1v1H2v-1H1v-3h1V9h4z"/><path class="fill-937f52" d="M7 5v1H5v1H4v1H3v3h1v1H3v1h1v1h1v-1h1v1h1v-1h2v-1h1v1h1v-2h1v-1h1V9h-1V7h-1V6H8V5zm5 6v1h1v-1zm-9 1v-1H2v1z"/><path d="M6 9h3v1h1v1h1v1H4v-1h1v-1h1" fill="#494664"/><path d="M7 8h1v1h1v2H8v1H7v-1H6v-1h1v1h1V9H7" fill="#585670"/><path d="M13 1h1v2h-1v1H9V3H8V1h2v1h3" fill="#937f52"/><path d="M8 2h2v1h1v1h1V2h2v1h-1v1h-1v1h-2V4H9V3H8" fill="#7a6a44"/><path d="M7 4h3v1h3v1h-3V5H7" fill="#434157"/>`]
        ].forEach(v => {
            const data = Object.freeze(new this(v));
            this.data.set(data.id, data);
        });
    }
}
