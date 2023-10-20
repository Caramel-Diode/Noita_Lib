/** ## [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
const Wand = (() => {
    embed(`#db.js`);
    db_wand.init();
    /** @type {Wand} */ let bindThis = undefined;
    /**
     * 属性解析
     * @param {String} attrName 属性名
     * @param {Number} [defaultValue = 0] 默认值
     * @returns {Number|{min:Number,max:Number}}
     */
    const attrParse = (attrName, defaultValue = 0) => {
        /** @type {String} */
        const attrStr = bindThis.getAttribute(`wand.${attrName}`);
        if (attrStr) {
            if (attrStr.startsWith(">=")) return { min: Number(attrStr.slice(2)), max: Infinity };
            else if (attrStr.startsWith("<=")) return { min: -Infinity, max: Number(attrStr.slice(2)) };
            else {
                const [min, max = ""] = attrStr.split("~");
                if (max) return { min: Number(min), max: Number(max) };
                else return Number(attrStr);
            }
        }
        return defaultValue;
    };
    /**
     * 加载法术列表项
     * @param {HTMLOListElement|HTMLUListElement} container
     * @param {Array} datas
     * @returns {Array<HTMLLIElement>}
     */
    const loadSpellListItems = (container, datas) => {
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            let amount = datas[i].amount;
            let className = "";
            const option = {
                display: "icon",
                instanceData: data.instanceData
            };
            if (amount > 0) className = "necessary";
            else {
                className = "optional";
                amount = -amount;
            }
            for (let j = 0; j < amount; j++) {
                const li = document.createElement("li");
                li.className = className;
                li.append(new Spell(data.spellDatas, option));
                container.append(li);
            }
        }
    };
    return Object.freeze(
        class extends Base {
            static observedAttributes = Object.freeze([...super.observedAttributes, "wand.name", "wand.template", "wand.icon", "wand.capacity", "wand.draw", "wand.fire-rate-wait", "wand.reload-time", "wand.shuffle", "wand.spread-degrees", "wand.speed-multiplier", "wand.mana-charge-speed", "wand.mana-max", "wand.static-spells", "wand.dynamic-spells"]);

            /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
            /**  @type {DisplayMode}  */ #displayMode = undefined;

            /** @type {db_wand} */ wandData = undefined;

            constructor(option) {
                super();
                if (option) {
                    this.#displayMode = option.display ?? "panel";
                    if (option.data) {
                        const data = option.data;
                        if (data.template) this.wandData = db_wand.getDataByTemplate(data.template);
                        else this.wandData = new db_wand([data.name ?? "魔杖", data.icon ?? "AUTO", data.capacity ?? 0, data.draw ?? 1, data.fireRateWait ?? 0, data.reloadTime ?? 0, data.shuffle ?? false, data.spreadDegrees ?? 0, data.speedMultiplier ?? 1, data.manaChargeSpeed ?? 0, data.manaMax ?? 0, data.staticSpells ?? "", data.dynamicSpells ?? ""]);
                    }
                }
            }

            static {
                const superStyleSheets = super.prototype.publicStyleSheets;
                this.prototype.publicStyleSheets = {
                    icon: [...superStyleSheets.icon],
                    panel: [...superStyleSheets.panel, gss(embed(`#panel.css`))]
                };
                customElements.define("noita-wand", this);
            }

            /**
             * 获取法杖数据表
             * @param {db_wand} wandData
             * @returns {HTMLElement}
             */
            static async getDataTable(wandData) {
                const table = document.createElement("table");
                const tbody = document.createElement("tbody");
                const wd = wandData;
                const loader = super.getPanelAttrLoader(tbody);
                loader._default("shuffle", wd.shuffle ? "是" : "否");
                loader._draw(wd.draw);
                loader._castCD("fireRateWait", wd.fireRateWait);
                loader._castCD("reloadTime", wd.reloadTime);
                loader._manaMaxOrCapacity("manaMax", wd.manaMax);
                loader._manaChargeSpeed(wd.manaChargeSpeed);
                loader._manaMaxOrCapacity("capacity", wd.capacity);
                if (wd.spreadDegrees) loader._spreadDegrees(wd.spreadDegrees);
                if (wd.speedMultiplier !== 1) loader._speed("speedMultiplier", wd.speedMultiplier);
                if (wd.staticSpells.length > 0) {
                    const staticSpellList = document.createElement("ol");
                    staticSpellList.className = "static-spells"; //标记为始终法术列表
                    loadSpellListItems(staticSpellList, wd.staticSpells);
                    loader._custom("staticSpells", [staticSpellList]);
                }
                table.append(tbody);
                return table;
            }

            async #loadIconContent() {}

            async #loadPanelContent() {
                const wd = this.wandData;
                this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
                const fragment = document.createDocumentFragment();

                const h1 = document.createElement("h1"); //法杖名
                h1.append(wd.name);
                const table = await this.constructor.getDataTable(wd);
                table.className = "attr-area";
                let dynamicSpellList;
                if (wd.shuffle) dynamicSpellList = document.createElement("ul");
                else dynamicSpellList = document.createElement("ol");
                dynamicSpellList.className = "dynamic-spells";
                if (wd.dynamicSpells.length > 0) loadSpellListItems(dynamicSpellList, wd.dynamicSpells);

                fragment.append(await wd.icon.getIcon(), h1, table, dynamicSpellList);
                this.#shadowRoot.append(fragment);
            }

            contentUpdate() {
                this.#shadowRoot.innerHTML = "";
                this.#shadowRoot.adoptedStyleSheets = [];

                let displayMode = this.getAttribute("display");
                if (displayMode) this.#displayMode = displayMode;
                else if (this.#displayMode) {
                    this.setAttribute("display", "panel");
                    this.#displayMode = "panel";
                }
                const templateName = this.getAttribute("wand.template");
                if (templateName) {
                    this.wandData = db_wand.getDataByTemplate(templateName);
                } else {
                    this.wandData;
                    bindThis = this;
                    this.wandData = new db_wand([this.getAttribute("wand.name") ?? "魔杖", this.getAttribute("wand.icon") ?? "AUTO", attrParse("capacity", 0), attrParse("draw", 1), attrParse("fire-rate-wait", 0), attrParse("reload-time", 0), this.getAttribute("wand.shuffle") === "true", attrParse("spread-degrees", 0), attrParse("speed-multiplier", 1), attrParse("mana-charge-speed", 0), attrParse("mana-max", 0), this.getAttribute("wand.static-spells") ?? "", this.getAttribute("wand.dynamic-spells") ?? ""]);
                }
                if (this.#displayMode === "panel") this.#loadPanelContent(this);
                else this.#loadIconContent(this);
            }

            connectedCallback() {
                this.contentUpdate();
            }

            toString() {
                return `[obejct HTMLNoitaWandElement #${this.wandData.name}]`;
            }

            attributeChangedCallback(name, oldValue, newValue) {
                if (oldValue === null) return;
                else if (newValue === oldValue) return;
                else this.contentUpdate();
            }
        }
    );
})();
