component.entity = class extends component.base {
    #shadowRoot = this.attachShadow({ mode: "closed" });

    static observedAttributes = [...super.observedAttributes, "eneity.id"];

    displayMode = undefined;

    /** @type {DB.entity} */
    entityData;

    constructor(...params) {
        super();
        if (params.length > 0) {
            if (typeof params[0] === "object") {
                this.entityData = params[0];
            } else if (typeof params[0] === "string") {
                this.setAttribute("eneity.id", params[0]);
            }
        }
    };
    /**
     * 获取投射物数据表
     * @async
     * @param {DB.eneity} 投射物数据
     * @returns {Promise<HTMLTableElement>}
     */
    static getDataSection = (() => {
        const loadAttr = super.loadPanelAttr;
        const switchFn = super.panelInfoSwitchFn;
        return /** @param {DB.entity} entityData */ async entityData => {
            const pc = entityData.projectileComponent;
            const dmc = entityData.damageModelComponent;

            const section = document.createElement("section");
            const table = document.createElement("table");
            const tbody = document.createElement("tbody");
            table.append(tbody);
            section.append(table);


            //#region 投射物组件
            if (pc) {
                //#region 简单数据加载
                /** @type {DamageData} */
                const od = pc.offeredDamage; //简写伤害数据
                if (od.projectile !== 0) loadAttr("projectileDamage", od.projectile, tbody);
                if (od.melee !== 0) loadAttr("meleeDamage", od.melee, tbody);
                if (od.electricity !== 0) loadAttr("electricityDamage", od.electricity, tbody);
                if (od.fire !== 0) loadAttr("fireDamage", od.fire, tbody);
                if (od.explosion !== 0) loadAttr("explosionDamage", od.explosion, tbody);
                if (od.ice !== 0) loadAttr("iceDamage", od.ice, tbody);
                if (od.slice !== 0) loadAttr("sliceDamage", od.slice, tbody);
                if (od.healing !== 0) loadAttr("healingDamage", od.healing, tbody);
                if (od.curse !== 0) loadAttr("curseDamage", od.curse, tbody);
                if (od.holy !== 0) loadAttr("holyDamage", od.holy, tbody);
                if (od.drill !== 0) loadAttr("drillDamage", od.drill, tbody);
                if (od.radioactive !== 0) loadAttr("radioactiveDamage", od.radioactive, tbody);
                if (pc.explosionRadius !== 0) loadAttr("explosionRadius", pc.explosionRadius, tbody);
                if (pc.spreadDegrees !== 0) loadAttr("spreadDegrees", utilities.radianToDegree(pc.spreadDegrees), tbody);//投射物散射为弧度制!
                if (pc.bounces !== 0) loadAttr("bounces", pc.bounces, tbody);
                if (pc.knockbackForce !== 0) loadAttr("knockbackForce", pc.knockbackForce, tbody);
                if (pc.minSpeed + pc.maxSpeed > 0) loadAttr("speed", { min: pc.minSpeed, max: pc.maxSpeed }, tbody);
                loadAttr("lifetime", { base: pc.lifetime, fluctuation: pc.fluctuatingLifetime }, tbody);
                //#endregion

                //#region 提供实体数据加载
                const relatedDataElements = [];
                const relatedSectionElements = [];
                for (let i = 0; i < pc.offeredEntities.length; i++) {
                    const entityData = pc.offeredEntities[i].entityData;
                    const num_min = pc.offeredEntities[i].num_min;
                    const num_max = pc.offeredEntities[i].num_max;

                    const section_ = await this.getDataSection(entityData);
                    section_.setAttribute("related-id", entityData.id);
                    section_.setAttribute("roles", "tabpanel");// 无障碍标注

                    relatedSectionElements.push(section_);
                    section.append(section_);

                    const data = document.createElement("data");
                    data.setAttribute("tabindex", "0");// 无障碍 允许tab聚焦
                    data.setAttribute("roles", "tab");
                    data.relatedDataElements = relatedDataElements;
                    data.relatedSectionElements = relatedSectionElements;
                    data.value = entityData.id;
                    data.addEventListener("click", switchFn.byMouse);
                    data.addEventListener("keydown", switchFn.byKeyboard);
                    data.append(entityData.name);
                    if (num_min === num_max) {
                        if (num_min !== 0) data.append("(", num_min, ")");
                    }
                    else data.append("(", num_min, "~", num_max, ")");
                    data.classList.add("not-in-cast-state");
                    data.title = "不可享受施法块属性加成";
                    data.classList.add("unselected");
                    relatedDataElements.push(data);
                }

                if (relatedDataElements[0]) {
                    relatedDataElements[0].click();
                    // 投射物间接提供的投射物信息会全部展示 此处点击以实现仅显示首个投射物信息
                    // relatedDataElements[0].relatedTbodyElements[0].querySelector("data")?.click();
                    loadAttr("projectilesProvided", relatedDataElements, tbody);
                }
                //#endregion

            }
            //#endregion
            //#region 伤害模型组件
            if (dmc) {
                const dm = dmc.damageMultipler; // 简写承伤系数数据
                loadAttr("maxHp", dmc.maxHp, tbody);
                // 下次在搞
            }
            //#endregion

            return section;
        };
    })();

    static {
        const superStyleSheets = super.prototype.publicStyleSheets;
        this.prototype.publicStyleSheets = {
            panel: [
                ...superStyleSheets.panel,
                gss(`"EntityElement_panel.css"`)
            ]
        };
        customElements.define("noita-entity", this);
    };

    async #loadPanelContent() {
        this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
        const fragment = document.createDocumentFragment();
        const h1 = document.createElement("h1");
        h1.setAttribute("switch.id", this.entityData.id);
        h1.setAttribute("switch.name", this.entityData.name);
        h1.setAttribute("tabindex", "0");// 无障碍 允许tab聚焦 
        h1.addEventListener("click", super.constructor.panelTitleSwitchFn.byMouse);
        h1.addEventListener("keydown", super.constructor.panelTitleSwitchFn.byKeyboard);
        h1.innerText = this.entityData.name;

        const section = await this.constructor.getDataSection(this.entityData);
        section.className = "attr-area";
        fragment.append(h1, section);
        this.#shadowRoot.append(fragment);
    };

    contentUpdate() {
        this.#shadowRoot.innerHTML = "";
        this.#shadowRoot.adoptedStyleSheets = [];

        const displayMode = this.getAttribute("display");
        if (displayMode) this.displayMode = displayMode;
        else {
            this.setAttribute("display", "panel");
            this.displayMode = "panel";
        }
        const entityId = this.getAttribute("entity.id");
        if (entityId) this.entityData = DB.entity.queryById(entityId);
        else this.entityData ??= DB.entity.$NULL;
        this.#loadPanelContent();
    };

    connectedCallback() {
        this.contentUpdate();
    };

    toString() {
        return `[obejct HTMLNoitaEntityElement #${this.entityData.id}]`;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === null) return;
        else if (newValue === oldValue) return;
        else {
            if (name === "entity.id") this.entityData = undefined;
            else if (name === "display") this.displayMode = undefined;
            this.contentUpdate();
        }
    };
};