component.wand = class extends component.base {
    /** @type {ShadowRoot} */
    #shadowRoot = this.attachShadow({ mode: "closed" });

    static observedAttributes = [...super.observedAttributes];

    #displayMode = undefined;

    /** @type {DB.wand} */
    wandData = undefined;

    constructor(...option) {
        super();
    }

    static {
        const superStyleSheets = super.prototype.publicStyleSheets;
        this.prototype.publicStyleSheets = {
            icon: [...superStyleSheets.icon],
            panel: [...superStyleSheets.panel,
            gss(`"WandElement_panel.css"`)]
        };

        this.prototype.contentUpdate = (() => {
            /** @type {HTMLNoitaWandElement} */
            let bindThis = undefined;
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
                    if (attrStr.startsWith(">=")) {
                        return { min: Number(attrStr.slice(2)), max: Infinity };
                    } else if (attrStr.startsWith("<=")) {
                        return { min: -Infinity, max: Number(attrStr.slice(2)) };
                    } else {
                        const [min, max = ""] = attrStr.split("~");
                        if (max) return { min: Number(min), max: Number(max) };
                        else return Number(attrStr);
                    }
                }
                return defaultValue;
            };
            /** @this {HTMLNoitaWandElement} */
            return function () {
                this.#shadowRoot.innerHTML = "";
                this.#shadowRoot.adoptedStyleSheets = [];

                let displayMode = this.getAttribute("display");
                if (displayMode) this.#displayMode = displayMode;
                else {
                    this.setAttribute("display", "panel");
                    this.#displayMode = "panel";
                }
                const wandTemplate = this.getAttribute("wand.template");
                if (wandTemplate) {

                } else {
                    bindThis = this;
                    this.wandData = new DB.wand([
                        this.getAttribute("wand.name") ?? "魔杖",
                        this.getAttribute("wand.icon") ?? "AUTO",
                        attrParse("capacity", 0),
                        attrParse("draw", 1),
                        attrParse("fire-rate-wait", 1),
                        attrParse("reload-time", 0),
                        this.getAttribute("wand.shuffle") === "true",
                        attrParse("spread-degrees", 0),
                        attrParse("speed-multiplier", 1),
                        attrParse("mana-charge-speed", 0),
                        attrParse("mana-max", 0),
                        this.getAttribute("wand.static-spells") ?? "",
                        this.getAttribute("wand.dynamic-spells") ?? ""
                    ]);
                };
                if (this.#displayMode === "panel") this.#loadPanelContent(this);
                else this.#loadIconContent(this);
            };
        })();

        customElements.define("noita-wand", this);
    };

    /**
     * 加载法术列表项
     * @param {HTMLOListElement|HTMLUListElement} container 
     * @param {Array} datas 
     * @returns {Array<HTMLLIElement>}
     */
    static #loadSpellListItems(container, datas) {
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            let amount = datas[i].amount;
            let className = "";
            const option = {
                display: "icon",
                instanceData: data.instanceData
            };
            if (amount > 0) {
                className = "necessary";
            } else {
                className = "optional";
                amount = -amount;
            }
            for (let j = 0; j < amount; j++) {
                const li = document.createElement("li");
                li.className = className;
                li.append(new component.spell(data.spellDatas, option));
                container.append(li);
            }
        }
    };

    static getDataTable = (() => {
        return async wandData => {
            const table = document.createElement("table");
            const tbody = document.createElement("tbody");
            /** @type {DB.wand} */
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
            if (wd.speedMultiplier) loader._speed("speedMultiplier", wd.speedMultiplier);
            if (wd.staticSpells.length > 0) {
                const staticSpellList = document.createElement("ol");
                staticSpellList.className = "static-spells";//标记为始终法术列表
                this.#loadSpellListItems(staticSpellList, wd.staticSpells);
                loader._custom("staticSpells", [staticSpellList]);
            }
            table.append(tbody);
            return table;
        };
    })();

    async #loadIconContent() { };

    async #loadPanelContent() {
        const wd = this.wandData;
        this.#shadowRoot.adoptedStyleSheets = [
            ...this.publicStyleSheets.panel,
            gss(`:host>canvas{height:${wd.iconWidth * 5}px}`)
        ];
        const fragment = document.createDocumentFragment();

        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-label", `法杖图标:${this.wandData.name}`);// 无障碍标注
        canvas.className = "wandIcon";
        canvas.height = wd.iconWidth;
        canvas.width = 15;
        const ctx = canvas.getContext("2d");
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(
            await DB.wand.iconImage,
            wd.iconOrigin, 0,
            wd.iconWidth, 15,
            -wd.iconWidth, 0,
            wd.iconWidth, 15
        );

        const h1 = document.createElement("h1"); //法杖名
        h1.append(wd.name);
        const table = await this.constructor.getDataTable(wd);
        table.className = "attr-area";
        let dynamicSpellList;
        if (wd.shuffle)
            dynamicSpellList = document.createElement("ul");
        else
            dynamicSpellList = document.createElement("ol");
        dynamicSpellList.className = "dynamic-spells";
        if (wd.dynamicSpells.length > 0) {
            this.constructor.#loadSpellListItems(dynamicSpellList, wd.dynamicSpells);
        }
        fragment.append(canvas, h1, table, dynamicSpellList);
        this.#shadowRoot.append(fragment);
    };

    connectedCallback() {
        this.contentUpdate();
    };

    toString() {
        return `[obejct HTMLNoitaWandElement #${this.wandData.name}]`;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === null) return;
        else if (newValue === oldValue) return;
        else {
            if (name === "data-type") this.wandData = undefined;
            else if (name === "data-display") this.#displayMode = undefined;
            this.contentUpdate();
        }
    };
};