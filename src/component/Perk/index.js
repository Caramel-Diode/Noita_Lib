const Perk = (() => {
    embed(`#db.js`);
    PerkData.init();
    const styleSheet = {
        icon: gss(embed(`#icon.css`)),
        panel: gss(embed(`#panel.css`))
    };

    return class HTMLNoitaPerkElement extends $class(Base, {
        /** @type {$ValueOption<"icon"|"panel">} */
        displayMode: { name: "display", $default: "icon" },
        /** @type {$ValueOption<PerkId|PerkName>} */
        perkId: { name: "perk.id" },
        /** @type {$ValueOption<String>} */
        perkCount: { name: "perk.count" }
    }) {
        static query = PerkData.query;

        //prettier-ignore
        static get datas() { return [...PerkData.data.all];}

        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {PerkData} */ perkData;
        instanceData = { count: 1 };

        constructor(...param) {
            super();
            let option = null;
            if (typeof param[0] === "object") {
                option = param[0];
                if (option.id) {
                    this.setAttribute("perk.id", option.id);
                } else if (option.name) {
                    this.setAttribute("perk.name", option.name);
                } else if (option.data) {
                    this.perkData = option.data;
                }
                if (option.display) {
                    this.setAttribute("display", option.display);
                }
                if (option.instanceData) {
                    this.setAttribute("perk.count", option.instanceData.remain.toString());
                    this.instanceData = option.instanceData;
                }
            }
        }

        #loadIconContent() {
            const { icon, type, name, id, desc } = this.perkData;
            const fragment = h(h.div({ class: ["background", type] }, icon));
            if (this.instanceData.count !== 1) fragment.append(h.data(this.instanceData.count));
            this.#shadowRoot.append(fragment);
            this.title = `${name}\n${id}\n${desc}`;
        }

        #loadPanelContent() {
            const pd = this.perkData;
            //prettier-ignore
            const loader = new Base.PanelAttrLoader().load({
                maxStack:  { value: pd.maxStack                              }, //堆叠极限
                maxInPool: { value: pd.maxInPool,  hidden:pd.maxInPool === 0 } //天赋池最大数量
            });
            this.loadPanelContent([h.template(pd.icon, this.createPanelH1(pd.id, pd.name), h.p(pd.desc), loader.container)]);
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
            this.#shadowRoot.innerHTML = "";
            this.perkData = PerkData.query(this.perkId);
            const perkCount = this.perkCount;
            if (perkCount) this.instanceData.count = Number(perkCount);
            this[$symbols.initStyle]();
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": this.#loadIconContent(); break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        //prettier-ignore
        connectedCallback() { this.contentUpdate(); }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaPerkElement #${this.perkData.id}` }
    };
})();
customElements.define("noita-perk", freeze(Perk));
