const Perk = (() => {
    embed(`#db.js`);
    PerkData.init();
    const styleSheet = {
        icon: css(embed(`#icon.css`)),
        panel: css(embed(`#panel.css`))
    };

    return class HTMLNoitaPerkElement extends $class(Base, {
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
            const fragment = h(h.div({ class: ["background", type] }, icon));
            if (this.instanceData.amount > 1) fragment.append(h.data(this.instanceData.amount));
            this.shadowRoot.append(fragment);
            this.title = `${name}\n${id}`;
            promptMsg.attach(this, [h.pre(this.perkData.desc)]);
        }

        #loadPanelContent() {
            const pd = this.perkData;
            //prettier-ignore
            const loader = new Base.PanelAttrLoader().load({
                maxStack: { value: pd.maxStack }, //堆叠极限
                maxInPool: { value: pd.maxInPool, hidden: pd.maxInPool === 0 } //天赋池最大数量
            });
            this.loadPanelContent([h.template(pd.icon, this.createPanelH1(pd.id, pd.name), h.p(pd.desc), loader.container)]);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch (this.displayMode) {
                case "panel": extraStyleSheets.push(styleSheet.panel); break;
                case "icon": extraStyleSheets.push(styleSheet.icon);
            }
            super[$symbols.initStyle](extraStyleSheets);
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
        contentUpdate() {
            this.shadowRoot.innerHTML = "";
            this.perkData = PerkData.query(this.perkId);
            const perkCount = this.perkCount;
            if (perkCount) this.instanceData.count = +perkCount;
            this[$symbols.initStyle]();
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
customElements.define("noita-perk", freeze(Perk));
