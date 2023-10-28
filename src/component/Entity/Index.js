/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
const Entity = (() => {
    embed(`#db.js`);
    EntityData.init();
    const HTMLNoitaEntityElement = class extends Base {
        static queryById = id => EntityData.queryById(id);
        static observedAttributes = Object.freeze([...super.observedAttributes, "eneity.id"]);

        #shadowRoot = this.attachShadow({ mode: "closed" });
        displayMode = undefined;
        /** @type {EntityData} */ entityData;

        constructor(...params) {
            super();
            if (params.length > 0) {
                if (typeof params[0] === "object") {
                    this.entityData = params[0];
                } else if (typeof params[0] === "string") {
                    this.setAttribute("eneity.id", params[0]);
                }
            }
        }

        /**
         * 获取投射物数据表 (这将会暴露给法术组件使用)
         * @param {EntityData} entityData 投射物数据
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
            const loader = new super.panelAttrLoader(tbody);

            //#region 投射物组件
            if (pc) {
                //#region 提供实体数据加载
                const relatedLiElements = [];
                const relatedSectionElements = [];
                for (let i = 0; i < pc.offeredEntities.length; i++) {
                    const entityData = pc.offeredEntities[i].entityData;
                    const num_min = pc.offeredEntities[i].num_min;
                    const num_max = pc.offeredEntities[i].num_max;
                    // 递归获取投射物提供的投射物数据
                    const section_offeredEntity = await this.getDataSection(entityData);
                    section_offeredEntity.setAttribute("related-id", entityData.id);
                    section_offeredEntity.setAttribute("roles", "tabpanel"); // 无障碍标注
                    relatedSectionElements.push(section_offeredEntity);
                    section.append(section_offeredEntity);
                    const li = document.createElement("li");
                    li.setAttribute("related-id", entityData.id);
                    li.relatedLiElements = relatedLiElements;
                    li.relatedSectionElements = relatedSectionElements;
                    li.append(entityData.name);
                    if (num_min === num_max) {
                        if (num_min !== 0) li.append(`(${num_min})`);
                    } else li.append(`(${num_min}~${num_max})`);
                    li.classList.add("not-in-cast-state");
                    li.title = "不可享受施法块属性加成";
                    li.classList.add("unselected");
                    relatedLiElements.push(li);
                }
                //#endregion
                //#region 简单数据加载
                /** @type {DamageData} */
                const od = pc.offeredDamage; //简写伤害数据
                if (od.projectile) loader.damage("projectileDamage", od.projectile);
                if (od.melee) loader.damage("meleeDamage", od.melee);
                if (od.electricity) loader.damage("electricityDamage", od.electricity);
                if (od.fire) loader.damage("fireDamage", od.fire);
                if (od.explosion) loader.damage("explosionDamage", od.explosion);
                if (od.ice) loader.damage("iceDamage", od.ice);
                if (od.slice) loader.damage("sliceDamage", od.slice);
                if (od.healing) loader.damage("healingDamage", od.healing);
                if (od.curse) loader.damage("curseDamage", od.curse);
                if (od.holy) loader.damage("holyDamage", od.holy);
                if (od.drill) loader.damage("drillDamage", od.drill);
                if (od.radioactive) loader.damage("radioactiveDamage", od.radioactive);
                if (pc.explosionRadius) loader.default("explosionRadius", pc.explosionRadius);
                if (pc.spreadDegrees) loader.spreadDegrees(util.radianToDegree(pc.spreadDegrees)); //投射物散射为弧度制!
                if (pc.bounces) loader.default("bounces", pc.bounces);
                if (pc.knockbackForce) loader.default("knockbackForce", pc.knockbackForce);
                if (pc.speed.min + pc.speed.max) loader.speed("speed", pc.speed);
                loader.lifetime(pc.lifetime);
                if (relatedLiElements[0]) loader.offerEntity("projectilesProvided", relatedLiElements);
                //#endregion
            }
            //#endregion
            //#region 伤害模型组件
            if (dmc) {
                /** @type {DamageData} */
                const dm = dmc.damageMultipler; // 简写承伤系数数据
                loader.default("maxHp", dmc.maxHp);
                if (dm.projectile !== 1) loader.damage("projectileDamageMultiplier", dm.projectile);
                if (dm.melee !== 1) loader.damage("meleeDamageMultiplier", dm.melee);
                if (dm.electricity !== 1) loader.damage("electricityDamageMultiplier", dm.electricity);
                if (dm.fire !== 1) loader.damage("fireDamageMultiplier", dm.fire);
                if (dm.explosion !== 1) loader.damage("explosionDamageMultiplier", dm.explosion);
                if (dm.ice !== 1) loader.damage("iceDamageMultiplier", dm.ice);
                if (dm.healing !== 1) loader.damage("healingDamageMultiplier", dm.healing);
                if (dm.curse !== 1) loader.damage("curseDamageMultiplier", dm.curse);
                if (dm.holy !== 1) loader.damage("holyDamageMultiplier", dm.holy);
                if (dm.drill !== 1) loader.damage("drillDamageMultiplier", dm.drill);
                if (dm.radioactive !== 1) loader.damage("radioactiveDamageMultiplier", dm.radioactive);
                if (dm.physicsHit !== 1) loader.damage("physicsHitDamageMultiplier", dm.physicsHit);
                if (dm.poison !== 1) loader.damage("poisonDamageMultiplier", dm.poison);
                if (dm.overeating !== 1) loader.damage("overeatingMultiplier", dm.overeating);
                if (dmc.bloodMaterial_hurt || dmc.bloodMaterial_die) loader.bloodMaterial(dmc.bloodMaterial_hurt, dmc.bloodMaterial_die);
                if (dmc.airInLungsMax !== -1) loader.default("airInLungsMax", dmc.airInLungsMax);
                // 下次在搞
            }
            //#endregion

            return section;
        }


        static {
            const superStyleSheets = super.prototype.publicStyleSheets;
            this.prototype.publicStyleSheets = {
                panel: [...superStyleSheets.panel, gss(embed(`#panel.css`))]
            };
        }

        async #loadPanelContent() {
            this.#shadowRoot.adoptedStyleSheets = this.publicStyleSheets.panel;
            const fragment = document.createDocumentFragment();
            const ed = this.entityData;
            const section = await HTMLNoitaEntityElement.getDataSection(this.entityData);
            fragment.append(this.createPanelH1(ed.id, ed.name), section);
            this.#shadowRoot.append(fragment);
        }

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
            if (entityId) this.entityData = EntityData.queryById(entityId);
            else this.entityData ??= EntityData.$NULL;
            this.#loadPanelContent();
        }

        connectedCallback() {
            this.contentUpdate();
        }

        toString() {
            return `[obejct HTMLNoitaEntityElement #${this.entityData.id}]`;
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === null) return;
            else if (newValue === oldValue) return;
            else {
                if (name === "entity.id") this.entityData = undefined;
                else if (name === "display") this.displayMode = undefined;
                this.contentUpdate();
            }
        }
    };
    return Object.freeze(HTMLNoitaEntityElement);
})();
customElements.define("noita-entity", Entity);
