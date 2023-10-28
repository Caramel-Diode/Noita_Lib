/** ## [`🛡️ 天赋`](https://noita.wiki.gg/zh/wiki/天赋) */
const Perk = (() => {
    embed(`#db.js`);
    PerkData.init();
    const HTMLNoitaPerkElement = class extends Base {
        static queryById = id => PerkData.queryById(id);
        static queryByName = id => PerkData.queryByName(this.name);
        static observedAttributes = Object.freeze([...super.observedAttributes, "perk.id", "perk.name", "perk.count"]);
        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            this.prototype.publicStyleSheets = {
                /** @type {Array<CSSStyleSheet>} */
                icon: [...superStyleSheets.icon, gss(embed(`#icon.css`))],
                /** @type {Array<CSSStyleSheet>} */
                panel: [...superStyleSheets.panel, gss(embed(`#panel.css`))]
            };
        }

        /** @type {ShadowRoot} */
        #shadowRoot = this.attachShadow({ mode: "closed" });
        #displayMode;

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

        async #loadIconContent() {
            const fragment = document.createDocumentFragment();
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.icon;
            const div_background = document.createElement("div");
            div_background.classList.add("background", this.perkData.type);
            div_background.append(await this.perkData.getIcon());
            fragment.append(div_background);
            if (this.instanceData.count !== 1) {
                const data_count = document.createElement("data");
                data_count.append(this.instanceData.count.toString());
                fragment.append(data_count);
            }
            this.#shadowRoot.append(fragment);
            this.title = `${this.perkData.name}\n${this.perkData.id}\n${this.perkData.description}`;
        }

        async #loadPanelContent() {
            const fragment = document.createDocumentFragment();
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
            const pd = this.perkData;
            const p = document.createElement("p"); //描述
            p.innerText = pd.description;
            /*###############################################################################*/
            const table = document.createElement("table");
            const tbody = document.createElement("tbody");
            table.append(tbody);
            const loader = new Base.panelAttrLoader(tbody);
            loader.default("maxStack", pd.maxStack); //堆叠极限
            if (pd.maxInPool) loader.default("maxInPool", pd.maxInPool); //天赋池最大数量
            /*###############################################################################*/
            fragment.append(await pd.getIcon(), this.createPanelH1(pd.id, pd.name), p, table);
            this.#shadowRoot.append(fragment);
        }

        contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            this.#shadowRoot.adoptedStyleSheets = [];
            const displayMode = this.getAttribute("display");
            if (displayMode) this.#displayMode = displayMode;
            else {
                this.setAttribute("display", "icon");
                this.#displayMode = "icon";
            }
            const perkId = this.getAttribute("perk.id");
            if (perkId) this.perkData = PerkData.queryById(perkId);
            else {
                const perkName = this.getAttribute("perk.name");
                if (perkName) this.perkData = PerkData.queryByName(perkName);
                else {
                    if (this.perkData === undefined) this.perkData = PerkData.$NULL;
                }
            }
            const perkCount = this.getAttribute("perk.count");
            if (perkCount !== null && perkCount !== "") {
                this.instanceData.count = Number(perkCount);
            }
            if (this.#displayMode === "panel") this.#loadPanelContent();
            else this.#loadIconContent();
        }

        connectedCallback() {
            this.contentUpdate();
        }

        toString() {
            return `[obejct HTMLNoitaPerkElement #${this.perkData.id}]`;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null) return;
            else if (newValue === oldValue) return;
            else {
                switch (name) {
                    case "perk.id":
                    case "perk.name":
                    case "perk.count":
                        this.perkData = null;
                        break;
                    case "display":
                        this.#displayMode = undefined;
                }
                this.contentUpdate();
            }
        }
    };
    return Object.freeze(HTMLNoitaPerkElement);
})();
customElements.define("noita-perk", Perk);
