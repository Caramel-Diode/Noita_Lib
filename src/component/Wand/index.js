/** ## [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
const Wand = (() => {
    embed(`#db.js`);
    WandData.init();
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
    const li_necessary = document.createElement("li");
    const li_optional = document.createElement("li");

    /**
     * 加载法术列表项
     * @param {HTMLOListElement|HTMLUListElement} container
     * @param {Array<SpellRecipeItem>} datas
     * ---
     * ### 重复片段(废弃)
     * ```html
     * <li class=" |optional">
     *     <noita-spell {{attr}}></noita-spell>
     * </li>
     * ```
     */
    const loadSpellListItems = (container, datas) => {
        /* 不要使用字符串拼接
        const resultHTMLs = [];
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            resultHTMLs.push(`<li><noita-spell ${data.attrStr}></noita-spell></li>`.repeat(data.min), `<li class="optional"><noita-spell ${data.attrStr}></noita-spell></li>`.repeat(data.max - data.min));
        }
        container.innerHTML = resultHTMLs.join("");
        */
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            const { min, max } = data;
            let j = 0;
            for (; j < min; j++) {
                const li = document.createElement("li");
                li.append(new Spell(data));
                container.append(li);
            }
            for (; j < max; j++) {
                const li = document.createElement("li");
                li.className = "optional";
                li.append(new Spell(data));
                container.append(li);
            }
        }
    };
    const HTMLNoitaWandElement = class extends Base {
        static observedAttributes = Object.freeze([...super.observedAttributes, "wand.name", "wand.template", "wand.icon", "wand.capacity", "wand.draw", "wand.fire-rate-wait", "wand.reload-time", "wand.shuffle", "wand.spread-degrees", "wand.speed-multiplier", "wand.mana-charge-speed", "wand.mana-max", "wand.static-spells", "wand.dynamic-spells"]);

        /** @type {ShadowRoot} */ #shadowRoot = this.attachShadow({ mode: "closed" });
        /**  @type {DisplayMode}  */ #displayMode = undefined;

        /** @type {WandData} */ wandData = undefined;

        constructor(option) {
            super();
            if (option) {
                this.#displayMode = option.display ?? "panel";
                if (option.data) {
                    const data = option.data;
                    if (data.template) this.wandData = WandData.getDataByTemplate(data.template);
                    else this.wandData = new WandData([data.name ?? "魔杖", data.icon ?? "AUTO", data.capacity ?? 0, data.draw ?? 1, data.fireRateWait ?? 0, data.reloadTime ?? 0, data.shuffle ?? false, data.spreadDegrees ?? 0, data.speedMultiplier ?? 1, data.manaChargeSpeed ?? 0, data.manaMax ?? 0, data.staticSpells ?? "", data.dynamicSpells ?? ""]);
                }
            }
        }

        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            this.prototype.publicStyleSheets = {
                icon: [...superStyleSheets.icon],
                panel: [...superStyleSheets.panel, gss(embed(`#panel.css`))]
            };
        }

        async #loadIconContent() {}

        async #loadPanelContent() {
            const wd = this.wandData;
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
            const fragment = document.createDocumentFragment();

            const h1 = document.createElement("h1"); //法杖名
            h1.innerText = wd.name;
            //#region 属性区
            /*###############################################################################*/
            const table = document.createElement("table");
            const tbody = document.createElement("tbody");

            const loader = new Base.panelAttrLoader(tbody);
            loader.default("shuffle", wd.shuffle ? "是" : "否");
            loader.draw(wd.draw);
            loader.castCD("fireRateWait", wd.fireRateWait);
            loader.castCD("reloadTime", wd.reloadTime);
            loader.manaMaxOrCapacity("manaMax", wd.manaMax);
            loader.manaChargeSpeed(wd.manaChargeSpeed);
            loader.manaMaxOrCapacity("capacity", wd.capacity);
            if (wd.spreadDegrees) loader.spreadDegrees(wd.spreadDegrees);
            if (wd.speedMultiplier !== 1) loader.speed("speedMultiplier", wd.speedMultiplier);
            if (wd.staticSpells.length > 0) {
                const staticSpellList = document.createElement("ol");
                staticSpellList.className = "static-spells"; //标记为始终法术列表
                loadSpellListItems(staticSpellList, wd.staticSpells);
                loader.custom("staticSpells", [staticSpellList]);
            }
            table.append(tbody);
            /*###############################################################################*/
            //#endregion
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
                this.wandData = WandData.getDataByTemplate(templateName);
            } else {
                this.wandData;
                bindThis = this;
                this.wandData = new WandData([this.getAttribute("wand.name") ?? "魔杖", this.getAttribute("wand.icon") ?? "AUTO", attrParse("capacity", 0), attrParse("draw", 1), attrParse("fire-rate-wait", 0), attrParse("reload-time", 0), this.getAttribute("wand.shuffle") === "true", attrParse("spread-degrees", 0), attrParse("speed-multiplier", 1), attrParse("mana-charge-speed", 0), attrParse("mana-max", 0), this.getAttribute("wand.static-spells") ?? "", this.getAttribute("wand.dynamic-spells") ?? ""]);
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
    };
    return Object.freeze(HTMLNoitaWandElement);
})();
customElements.define("noita-wand", Wand);
