const Material = (() => {
    embed(`#db.js`);
    MaterialData.init();
    const styleSheet = {
        icon: gss(embed(`#icon.css`)),
        panel: gss(embed(`#panel.css`)),
        mathml: gss(embed(`#MathML.css`))
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
                lis.push(h.li(data.icon));
                titles.push(`${typeInfo[1]}${data.name}\n${data.id}`);
            }
            this.title = titles.join("\n\n");
            this.#shadowRoot.append(h.ol({ part: "tape", style: { "--amount": length } }, lis));
        }

        #loadReactionContent() {
            const data = this.materialDatas[0];
            const { asCatalyzer, asInput, asOutput } = MaterialData.ReactionData.query(data.id);
            /** @type {Array<HTMLTemplateElement>} */
            const templates = [];
            if (asCatalyzer.length) {
                const templateAsCatalyzer = h.template({ title: "作为催化剂" });
                templates.push(templateAsCatalyzer);
                const cache = [];
                for (let i = 0; i < asCatalyzer.length; i++) cache.push(asCatalyzer[i].toString(data.id, "MathML"));
                templateAsCatalyzer.innerHTML = cache.join("");
            }
            if (asInput.length) {
                const templateAsInput = h.template({ title: "作为原料" });
                templates.push(templateAsInput);
                const cache = [];
                for (let i = 0; i < asInput.length; i++) cache.push(asInput[i].toString(data.id, "MathML"));
                templateAsInput.innerHTML = cache.join("");
            }
            if (asOutput.length) {
                const template = h.template({ title: "作为产物" });
                templates.push(template);
                const cache = [];
                for (let i = 0; i < asOutput.length; i++) cache.push(asOutput[i].toString(data.id, "MathML"));
                template.innerHTML = cache.join("");
            }
            this.loadPanelContent(templates);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            let mode = this.displayMode;
            //prettier-ignore
            switch(mode) {
                case "panel": extraStyleSheets.push(styleSheet.panel); break;
                case "icon": extraStyleSheets.push(styleSheet.icon); break;
                case "reaction":
                    extraStyleSheets.push(styleSheet.mathml);
                    mode = "panel"
            }
            super[$symbols.initStyle](extraStyleSheets, mode);
        }

        contentUpdate() {
            this.#shadowRoot.innerHTML = "";
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
                case "reaction": this.#loadReactionContent(); break;
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
