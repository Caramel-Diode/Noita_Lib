const Material = (() => {
    embed(`#db.js`);
    MaterialData.init();
    const styleSheet = {
        icon: gss(embed(`#icon.css`)),
        panel: gss(embed(`#panel.css`))
    };
    const typeInfoMap = {
        null: ["NULL", "⚫"],
        fire: ["火焰", "🔥"],
        liquid: ["液体", "💧"],
        solid: ["固体", "🧊"],
        gas: ["气体", "💨"]
    };
    return class HTMLNoitaMaterialElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<MaterialId>} */
        materialId: { name: "material.id" },
        /** @type {$ValueOption<MaterialTag>} */
        materialTag: { name: "material.tag" },
        /** @type {$ValueOption<MaterialId>} */
        materialInherit: { name: "material.inherit" }
    }) {
        static queryById = id => MaterialData.queryById(id);
        static queryByTag = tag => MaterialData.queryByTag(tag);
        static queryReaction = keyword => MaterialData.ReactionData.query(keyword);

        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {Array<MaterialData>} */ materialDatas;
        constructor() {
            super();
        }

        //prettier-ignore
        static get datas() { return [...MaterialData.data.all]; }

        //prettier-ignore
        static get reactionDatas() { return [...MaterialData.ReactionData.data]; }

        #loadIconContent() {
            this.#shadowRoot.innerHTML = "";
            const length = this.materialDatas.length;
            if (!length) return;
            const titles = [];
            const lis = [];
            for (let i = 0; i < length; i++) {
                const data = this.materialDatas[i];
                const typeInfo = typeInfoMap[data.type];
                lis.push($html`<li>${data.icon}</li>`);
                titles.push(`${typeInfo[1]}${data.name}\n${data.id}`);
            }
            this.title = titles.join("\n\n");
            const ol = $html`<ol part=tape style="--amount:${length}">${lis}</ol>`;
            this.#shadowRoot.append(ol);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": extraStyleSheets.push(styleSheet.panel); break;
                case "icon": extraStyleSheets.push(styleSheet.icon)
            }
            super[$symbols.initStyle](extraStyleSheets);
        }

        contentUpdate() {
            const materialId = this.materialId;
            if (materialId) this.materialDatas = [MaterialData.queryById(materialId)];
            else {
                const materialTag = this.materialTag;
                if (materialTag) this.materialDatas = MaterialData.queryByTag(materialTag).list;
                else {
                    const materialInherit = this.materialInherit;
                    if (materialInherit) this.materialDatas = MaterialData.queryByInherit(materialInherit).list;
                }
            }
            this[$symbols.initStyle]();
            //prettier-ignore
            switch(this.displayMode) {
                case "panel":
                    //TODO: 等待面板内容加载函数
                    break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        connectedCallback() {
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMaterialElement < ${this.materialDatas.map(e => e.id)} >` }
    };
})();
customElements.define("noita-material", freeze(Material));
