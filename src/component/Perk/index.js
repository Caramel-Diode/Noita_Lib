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
            const fragment = new DocumentFragment();
            fragment.append($html`<div class="background ${this.perkData.type}">${this.perkData.icon}</div>`);
            if (this.instanceData.count !== 1) {
                const data_count = createElement("data");
                data_count.append(this.instanceData.count.toString());
                fragment.append(data_count);
            }
            this.#shadowRoot.append(fragment);
            this.title = `${this.perkData.name}\n${this.perkData.id}\n${this.perkData.desc}`;
        }

        #loadPanelContent() {
            const template = createElement("template");
            const pd = this.perkData;
            //prettier-ignore
            const loader = new Base.PanelAttrLoader({
                maxStack:  { value: pd.maxStack                              }, //堆叠极限
                maxInPool: { value: pd.maxInPool,  hidden:pd.maxInPool === 0 } //天赋池最大数量
            });

            template.content.append(pd.icon, this.createPanelH1(pd.id, pd.name), $html`<p>${pd.desc}</p>`, loader.container);
            this.loadPanelContent([template]);
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
