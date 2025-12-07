const Perk = (() => {
    embed(`#db.js`);
    PerkData.init();

    return class HTMLNoitaPerkElement extends $extends(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<PerkId|PerkName>} */
        perkId: { name: "perk.id" },
        /** @type {$ValueOption<String>} */
        perkCount: { name: "perk.count" }
    }) {
        /** @type {typeof PerkData.query} */
        static query = PerkData.query.bind(PerkData);
        //prettier-ignore
        static get datas() { return [...PerkData.data.all]; }
        instanceData = { amount: 1 };

        /**
         * @param {Object} [option] 构造配置
         * @param {"panel"|"icon"} [option.display] 显示模式
         * @param {String} [option.id] id或name
         * @param {Object} [option.instanceData] 实例数据
         * @param {Number} option.instanceData.amount 数量
         */
        constructor({ display, id, instanceData } = {}) {
            super();
            if (display) this.displayMode = display;
            if (id) this.perkId = id;
            if (instanceData) this.perkCount = instanceData.amount;
        }

        #loadIconContent() {
            const { icon, type, name, id, desc } = this.perkData;
            icon.classList.add("background", type);
            const blankIcon = h.div({ class: ["background", type, "blank-icon"] });
            const fragment = h(icon, blankIcon);
            if (this.instanceData.amount > 1) fragment.append(h.data(this.instanceData.amount));
            this.shadowRoot.append(fragment);
            this.setAttribute("role", "button");
            this.setAttribute("tabindex", "0");
            this.title = `${name}\n${id}`;
            hoverMsg.attachWithPanel(this, [h.pre(this.perkData.desc)]);
        }

        #loadPanelContent() {
            const pd = this.perkData;
            //prettier-ignore
            const loader = new Base.PanelAttrLoader().load({
                maxStack: { value: pd.maxStack }, //堆叠极限
                maxInPool: { value: pd.maxInPool, hidden: pd.maxInPool === 0 } //天赋池最大数量
            });
            this.loadPanelContent([h.template(pd.icon, createPanelH1(pd.id, pd.name), h.p(pd.desc), loader.container)]);
        }

        static [$css] = {
            icon: [css(embed(`#icon.css`), { name: "perk-icon" })],
            panel: [css(embed(`#panel.css`), { name: "perk-panel" })]
        };

        [$content]() {
            this.perkData = PerkData.query(this.perkId);
            const perkCount = this.perkCount;
            if (perkCount) this.instanceData.count = +perkCount;
            //prettier-ignore
            switch (this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaPerkElement #${this.perkData.id}`; }
    };
})();
h["noita-perk"] = freeze(Perk);
