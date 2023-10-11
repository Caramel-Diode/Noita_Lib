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
     * @param {DB.eneity} entityData 投射物数据
     * @returns {Promise<HTMLElement>}
     */
    static async getDataSection(entityData) {
        const pc = entityData.projectileComponent;
        const dmc = entityData.damageModelComponent;

        const section = document.createElement("section");
        const table = document.createElement("table");
        const tbody = document.createElement("tbody");
        table.append(tbody);
        section.append(table);
        const loader = super.getPanelAttrLoader(tbody);

        //#region 投射物组件
        if (pc) {
            //#region 提供实体数据加载
            const relatedLiElements = [];
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
                const li = document.createElement("li");
                li.setAttribute("related-id", entityData.id);
                li.relatedLiElements = relatedLiElements;
                li.relatedSectionElements = relatedSectionElements;
                li.append(entityData.name);
                if (num_min === num_max) {
                    if (num_min !== 0) li.append(`(${num_min})`);
                }
                else li.append(`(${num_min}~${num_max})`);
                li.classList.add("not-in-cast-state");
                li.title = "不可享受施法块属性加成";
                li.classList.add("unselected");
                relatedLiElements.push(li);
            }
            //#endregion
            //#region 简单数据加载
            /** @type {DamageData} */
            const od = pc.offeredDamage; //简写伤害数据
            if (od.projectile) loader._damage("projectileDamage", od.projectile);
            if (od.melee) loader._damage("meleeDamage", od.melee);
            if (od.electricity) loader._damage("electricityDamage", od.electricity);
            if (od.fire) loader._damage("fireDamage", od.fire);
            if (od.explosion) loader._damage("explosionDamage", od.explosion);
            if (od.ice) loader._damage("iceDamage", od.ice);
            if (od.slice) loader._damage("sliceDamage", od.slice);
            if (od.healing) loader._damage("healingDamage", od.healing);
            if (od.curse) loader._damage("curseDamage", od.curse);
            if (od.holy) loader._damage("holyDamage", od.holy);
            if (od.drill) loader._damage("drillDamage", od.drill);
            if (od.radioactive) loader._damage("radioactiveDamage", od.radioactive);
            if (pc.explosionRadius) loader._default("explosionRadius", pc.explosionRadius);
            if (pc.spreadDegrees) loader._spreadDegrees(utilities.radianToDegree(pc.spreadDegrees));//投射物散射为弧度制!
            if (pc.bounces) loader._default("bounces", pc.bounces);
            if (pc.knockbackForce) loader._default("knockbackForce", pc.knockbackForce);
            if (pc.minSpeed + pc.maxSpeed) loader._speed("speed", { min: pc.minSpeed, max: pc.maxSpeed });
            loader._lifetime({ base: pc.lifetime, fluctuation: pc.fluctuatingLifetime });
            if (relatedLiElements[0]) loader._offerEntity("projectilesProvided", relatedLiElements);
            //#endregion

        }
        //#endregion
        //#region 伤害模型组件
        if (dmc) {
            /** @type {DamageData} */
            const dm = dmc.damageMultipler; // 简写承伤系数数据
            loader._default("maxHp", dmc.maxHp);
            if (dm.projectile !== 1) loader._damage("projectileDamageMultiplier", dm.projectile);
            if (dm.melee !== 1) loader._damage("meleeDamageMultiplier", dm.melee);
            if (dm.electricity !== 1) loader._damage("electricityDamageMultiplier", dm.electricity);
            if (dm.fire !== 1) loader._damage("fireDamageMultiplier", dm.fire);
            if (dm.explosion !== 1) loader._damage("explosionDamageMultiplier", dm.explosion);
            if (dm.ice !== 1) loader._damage("iceDamageMultiplier", dm.ice);
            if (dm.healing !== 1) loader._damage("healingDamageMultiplier", dm.healing);
            if (dm.curse !== 1) loader._damage("curseDamageMultiplier", dm.curse);
            if (dm.holy !== 1) loader._damage("holyDamageMultiplier", dm.holy);
            if (dm.drill !== 1) loader._damage("drillDamageMultiplier", dm.drill);
            if (dm.radioactive !== 1) loader._damage("radioactiveDamageMultiplier", dm.radioactive);
            if (dm.physicsHit !== 1) loader._damage("physicsHitDamageMultiplier", dm.physicsHit);
            if (dm.poison !== 1) loader._damage("poisonDamageMultiplier", dm.poison);
            if (dm.overeating !== 1) loader._damage("overeatingMultiplier", dm.overeating);
            if (dmc.bloodMaterial_hurt || dmc.bloodMaterial_die) loader._bloodMaterial(dmc.bloodMaterial_hurt, dmc.bloodMaterial_die);
            if (dmc.airInLungsMax !== -1) loader._default("airInLungsMax", dmc.airInLungsMax);
            // 下次在搞
        }
        //#endregion

        return section;
    };

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