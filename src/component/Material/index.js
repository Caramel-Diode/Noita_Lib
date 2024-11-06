const Material = (() => {
    embed(`#db.js`);
    MaterialData.init();
    const styleSheet = {
        icon: css(embed(`#icon.css`)),
        panel: css(embed(`#panel.css`)),
        mathml: css(embed(`#MathML.css`))
    };
    const typeInfoMap = {
        null: ["NULL", "⚫"],
        fire: ["火焰", "🔥"],
        liquid: ["液体", "💧"],
        solid: ["固体", "🧊"],
        gas: ["气体", "💨"]
    };

    return class HTMLNoitaMaterialElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel"|"reaction">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<MaterialId>} */
        materialId: { name: "material.id" },
        /** @type {$ValueOption<MaterialTag>} */
        materialTag: { name: "material.tag" },
        /** @type {$ValueOption<MaterialId>} */
        materialInherit: { name: "material.inherit" }
    }) {
        static queryById = MaterialData.queryById.bind(MaterialData);
        static queryByTag = MaterialData.queryByTag.bind(MaterialData);
        static queryReaction = MaterialData.ReactionData.query.bind(MaterialData.ReactionData);

        /** @type {Array<MaterialData>} */
        materialDatas;
        /**
         * @param {Object} [option] 构造配置
         * @param {"icon"|"panel"|"reaction"} [option.display] 显示模式
         * @param {String} [option.id] 材料id
         * @param {`[${string}]`} [option.tag] 材料标签
         * @param {String} [option.inherit] 父材料
         */
        constructor({ display, tag, id, inherit } = {}) {
            super();
            if (display) this.displayMode = display;
            if (id) this.materialId;
            if (tag) this.materialTag;
            if (inherit) this.materialInherit = inherit;
        }

        //prettier-ignore
        static get datas() { return [...MaterialData.data.all]; }

        //prettier-ignore
        static get reactionDatas() { return [...MaterialData.ReactionData.data]; }

        #loadIconContent() {
            this.shadowRoot.innerHTML = "";
            const { length } = this.materialDatas;
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
            this.shadowRoot.append(h.ol({ part: "tape", style: { "--amount": length } }, lis));
        }

        /**
         * 切换面板展示内容
         * @param {Number|String} d
         */
        panelContentSwitchTo(d) {
            if (this.displayMode.startsWith("icon")) return console.warn("仅允许面板和材料反应模式使用");
            if (this.displayMode.startsWith("panel")) {
                if (typeof d === "string") this.panelContentSwitchTo(this.materialDatas.indexOf(Material.queryById(d)));
                else if (d in this.materialDatas) this.shadowRoot.querySelector("menu").children[d].click();
                else throw new ReferenceError("不存在的材料");
            } else if (this.displayMode.startsWith("reaction")) {
                const { children } = this.shadowRoot.querySelector("menu");
                if (d in children) children[d].click();
                else throw new ReferenceError("不存在的材料反应种类");
            }
        }

        /** 加载材料反应面板 */
        #loadReactionContent(index = 0) {
            const { id } = this.materialDatas[0];
            const { asCatalyzer, asInput, asOutput } = MaterialData.ReactionData.query(id);

            /**
             * 转换为`<MathML>` 字符串
             * @param {MaterialData.ReactionData} reaction
             */
            const toMathML = reaction => reaction.toString(id, "MathML");
            /* prettier-ignore */
            /** @type {Array<HTMLTemplateElement>} */
            const templates = [
                h.template({ title: "作为催化剂", HTML: asCatalyzer.map(toMathML).join("") }),
                h.template({ title: "作为原料", HTML: asInput.map(toMathML).join("") }),
                h.template({ title: "作为产物", HTML: asOutput.map(toMathML).join("") })
            ];
            templates[index].toggleAttribute("default");
            this.loadPanelContent(templates);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            /** @type {String} */
            let mode = this.displayMode;
            if (mode.startsWith("panel")) {
                mode = "panel";
                extraStyleSheets.push(styleSheet.panel);
            } else if (mode.startsWith("icon")) {
                mode = "icon";
                extraStyleSheets.push(styleSheet.icon);
            } else if (mode.startsWith("reaction")) {
                mode = "panel";
                extraStyleSheets.push(styleSheet.mathml);
            }
            super[$symbols.initStyle](extraStyleSheets, mode);
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
        contentUpdate() {
            this.shadowRoot.innerHTML = "";
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
            /** @type {String} */
            const mode = this.displayMode;
            if (mode.startsWith("panel")) {
            } else if (mode.startsWith("icon")) this.#loadIconContent();
            else if (mode.startsWith("reaction")) {
                this.#loadReactionContent(Number(mode.split(":")[1] ?? 0));
            } else throw new TypeError("不支持的显示模式");
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMaterialElement < ${this.materialDatas.map(e => e.id)} >`; }
    };
})();
customElements.define("noita-material", freeze(Material));
