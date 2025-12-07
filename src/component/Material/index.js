const Material = (() => {
    embed(`#db.js`);
    MaterialData.init();
    const typeInfoMap = {
        null: ["NULL", "⚫"],
        fire: ["火焰", "🔥"],
        liquid: ["液体", "💧"],
        solid: ["固体", "🧊"],
        gas: ["气体", "💨"]
    };

    return class HTMLNoitaMaterialElement extends $extends(Base, {
        /** @type {$ValueOption<"icon"|"panel"|"panel-reaction"|"panel-reaction-catalyzer"|"panel-reaction-input"|"panel-reaction-output">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<MaterialId>} */
        materialId: { name: "material.id" },
        /** @type {$ValueOption<MaterialTag>} */
        materialTag: { name: "material.tag" },
        /** @type {$ValueOption<MaterialId>} */
        materialInherit: { name: "material.inherit" }
    }) {
        /** @type {typeof MaterialData.queryById} */
        static queryById = MaterialData.queryById.bind(MaterialData);
        /** @type {typeof MaterialData.queryByTag} */
        static queryByTag = MaterialData.queryByTag.bind(MaterialData);
        /** @type {typeof MaterialData.ReactionData.query} */
        static queryReaction = MaterialData.ReactionData.query.bind(MaterialData.ReactionData);

        /** @type {Array<MaterialData>} */
        materialDatas;
        /**
         * @param {Object} [option] 构造配置
         * @param {"panel-reaction"|"panel-reaction-catalyzer"|"panel-reaction-input"|"panel-reaction-output"} [option.display] 显示模式
         * @param {String} [option.id] 材料id
         * @param {`[${string}]`} [option.tag] 材料标签
         * @param {String} [option.inherit] 父材料
         */
        constructor({ display, tag, id, inherit } = {}) {
            super();
            if (display) this.displayMode = display;
            if (id) this.materialId = id;
            if (tag) this.materialTag = tag;
            if (inherit) this.materialInherit = inherit;
        }

        //prettier-ignore
        static get datas() { return [...MaterialData.data.all]; }

        static get materialTags() {
            return MaterialData.tags;
        }

        //prettier-ignore
        static get reactionDatas() { return [...MaterialData.ReactionData.data]; }

        #loadIconContent() {
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
                else throw new ReferenceError("不存在的选项卡");
            }
        }

        /** 加载材料反应面板 */
        #loadReactionContent(index = 0) {
            const [, , reactionType = "all"] = this.displayMode.split("-");

            const { asCatalyzer, asInput, asOutput } = MaterialData.ReactionData.query(this.materialId || this.materialTag);

            /** 代理材料 (当未指定具体材料时 不使用代理材料) */
            const agentMaterial = this.materialId || void 0;
            /**
             * 转换为`<MathML>` 字符串
             * @param {MaterialData.ReactionData} reaction
             */
            const toMathML = reaction => reaction.toString(agentMaterial, "MathML");

            /** @type {Array<HTMLTemplateElement>} */
            const templates = [];
            if (reactionType === "all" || reactionType === "catalyzer") templates.push(h.template({ title: "作为催化剂", HTML: asCatalyzer.map(toMathML).join("") }));
            if (reactionType === "all" || reactionType === "input") templates.push(h.template({ title: "作为原料", HTML: asInput.map(toMathML).join("") }));
            if (reactionType === "all" || reactionType === "output") templates.push(h.template({ title: "作为产物", HTML: asOutput.map(toMathML).join("") }));
            templates[index].toggleAttribute("default");
            this.loadPanelContent(templates);
        }

        static [$css] = {
            icon: [css(embed(`#icon.css`), { name: "material-icon" })],
            panel: [css(embed(`#panel.css`), { name: "material-panel" })]
        };

        /** @override */
        [$content]() {
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

            /** @type {String} */
            const mode = this.displayMode;
            if (mode.startsWith("panel-reaction")) {
                this.#loadReactionContent(Number(mode.split(":")[1] ?? 0));
            } else if (mode.startsWith("icon")) this.#loadIconContent();
            else if (mode.startsWith("panel")) {
            } else throw new TypeError("不支持的显示模式");
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaMaterialElement < ${this.materialDatas.map(e => e.id)} >`; }
    };
})();
h["noita-material"] = freeze(Material);
