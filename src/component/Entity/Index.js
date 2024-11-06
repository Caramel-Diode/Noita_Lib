/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
const Entity = (() => {
    embed(`#db.js`);
    EntityData.init();
    const styleSheet = {
        panel: css(embed(`#panel.css`))
    };
    return class HTMLNoitaEntityElement extends $class(Base, {
        /** @type {$ValueOption<"panel">} */
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<String>} 实体id (path) */
        entityId: { name: "entity.id" }
    }) {
        /** @type {typeof EntityData.query} */
        static query = EntityData.query.bind(EntityData);

        #shadowRoot = this.attachShadow({ mode: "open" });
        /** @type {EntityData} */ entityData;

        /**
         * @overload
         * @param {EntityData} data
         */
        /**
         * @overload
         * @param {String} id
         */
        /**
         * @param {String|EntityData} data
         */
        constructor(data) {
            super();
            if (typeof data === "string") this.entityId = data;
            else if (typeof data === "object") this.entityData = data;
        }

        /**
         * 获取投射物数据表 (这将会暴露给法术组件使用)
         * @param {EntityData} entityData 投射物数据
         * @param {import("@spell").SpellData.ProjectileData} [extraData] 附加数据
         * @param {Array<String>} [ignore] 忽略展示
         * @param {"s"|"f"} [displayTimeUnit] 默认展示时间单位
         * @returns {HTMLElement}
         */
        static getDataSection(entityData, extraData = { drawCount_Death: 0, drawCount_Hit: 0, drawCount_Timer: 0 }, ignore = [], displayTimeUnit) {
            const loader = new this.PanelAttrLoader(ignore);
            loader.load({
                draw: { value: extraData, hidden: extraData.drawCount_Death + extraData.drawCount_Hit + extraData.drawCount_Timer === 0 },
                tag: { value: entityData.tags, hidden: !entityData.tags[0] }
            });
            const section = h.section({ role: "tabpanel" }, loader.container);
            /**
             * @param {typeof EntityData.Component.prototype} component
             */
            const createLoader = component => {
                const loader = new this.PanelAttrLoader(ignore, displayTimeUnit);
                const details = h.details({ class: "entity-component", open: true }, h.summary(component.$type), h.div(loader.container));
                section.append(details);
                return {
                    /** @type {typeof section.append} */
                    append: section.append.bind(section),
                    /** @type {typeof loader.load} */
                    load: loader.load.bind(loader)
                };
            };

            if (entityData.projectileComponent) {
                const { projectileComponent: comp } = entityData;
                const loader = createLoader(comp);

                const relatedSectionElements = [];
                const lis = [];

                // 碰撞产生的实体
                if (comp.collisionEntity) {
                    for (const path of comp.collisionEntity.split(",")) {
                        const data = EntityData.query(path);
                        const sectionOfferedEntity = this.getDataSection(data);
                        relatedSectionElements.push(sectionOfferedEntity);
                        loader.append(sectionOfferedEntity);
                        const li = h.li({ class: "relation=hit", title: "碰撞 不享受施法块属性加成" }, data.name);
                        li.relatedSectionElements = relatedSectionElements;
                        li.dataset.relatedId = sectionOfferedEntity.dataset.relatedId = "hit:" + path;
                        lis.push(li);
                    }
                }
                // 爆炸产生的实体
                if (comp.explosionEntity) {
                    for (const path of comp.explosionEntity.split(",")) {
                        const data = EntityData.query(path);
                        const sectionOfferedEntity = this.getDataSection(data);
                        relatedSectionElements.push(sectionOfferedEntity);
                        loader.append(sectionOfferedEntity);
                        const li = h.li({ class: "relation=explode", title: "爆炸 不享受施法块属性加成" }, data.name);
                        li.relatedSectionElements = relatedSectionElements;
                        li.dataset.relatedId = sectionOfferedEntity.dataset.relatedId = "explode:" + path;
                        lis.push(li);
                    }
                }
                const explosionTrigger = [];
                if (comp.onDeathExplode) explosionTrigger.push("提前失效");
                if (comp.onLifetimeOutExplode) explosionTrigger.push("存在时间结束");
                const { damage } = comp; //简写伤害数据
                let explosionDamageTarget = comp.explosionDontDamageShooter ? "非己" : "所有";
                if (!comp.explosionDamageMortals) explosionDamageTarget = "无";
                //prettier-ignore
                loader.load({
                    projectileDamage: { value: damage.projectile, hidden: !damage.projectile },
                    meleeDamage: { value: damage.melee, hidden: !damage.melee },
                    electricityDamage: { value: damage.electricity, hidden: !damage.electricity },
                    fireDamage: { value: damage.fire, hidden: !damage.fire },
                    explosionTrigger: { value: explosionTrigger.join(" 或 "), hidden: !explosionTrigger.length },
                    explosionDamage: { value: damage.explosion, hidden: !damage.explosion },
                    iceDamage: { value: damage.ice, hidden: !damage.ice },
                    sliceDamage: { value: damage.slice, hidden: !damage.slice },
                    healingDamage: { value: damage.healing, hidden: !damage.healing },
                    curseDamage: { value: damage.curse, hidden: !damage.curse },
                    holyDamage: { value: damage.holy, hidden: !damage.holy },
                    drillDamage: { value: damage.drill, hidden: !damage.drill },
                    radioactiveDamage: { value: damage.radioactive, hidden: !damage.radioactive },
                    explosionRadius: { value: comp.explosionRadius, hidden: !comp.explosionRadius },
                    spreadDegrees: { value: math.radianToDegree(comp.spreadDegrees), hidden: !comp.spreadDegrees },
                    bounces: { value: comp.bounces, hidden: !comp.bounces },
                    knockbackForce: { value: comp.knockbackForce, hidden: !comp.knockbackForce },
                    speed: { value: comp.speed },
                    lifetime: { value: comp.lifetime, },
                    damageInterval: { value: comp.damageInterval, hidden: comp.damageInterval === 1 },
                    friendlyFire: { value: comp.friendlyFire, hidden: !comp.friendlyFire },
                    explosionDamageTarget: { value: explosionDamageTarget, },
                    penetrateEntities: { value: comp.penetrateEntities, hidden: !comp.penetrateEntities },
                    penetrateWorld: { value: comp.penetrateWorld, hidden: !comp.penetrateWorld },
                    collideWithEntities: { value: comp.collideWithEntities, hidden: comp.collideWithEntities },
                    collideWithWorld: { value: comp.collideWithWorld, hidden: comp.collideWithWorld },
                    loadEntities: { value: lis, hidden: !lis[0] }
                });
            }

            if (entityData.lightningComponent) {
                const { lightningComponent: comp } = entityData;
                const loader = createLoader(comp);
                const relatedSectionElements = [];
                const lis = [];

                // 爆炸产生的实体
                if (comp.explosionEntity) {
                    for (const path of comp.explosionEntity.split(",")) {
                        const data = EntityData.query(path);
                        const sectionOfferedEntity = this.getDataSection(data);
                        relatedSectionElements.push(sectionOfferedEntity);
                        loader.append(sectionOfferedEntity);
                        const li = h.li({ class: "relation=explode", title: "爆炸 不享受施法块属性加成" }, data.name);
                        li.relatedSectionElements = relatedSectionElements;
                        li.dataset.relatedId = sectionOfferedEntity.dataset.relatedId = "explode:" + path;
                        lis.push(li);
                    }
                }

                loader.load({
                    explosionDamage: { value: comp.explosionDamage, hidden: !comp.explosionDamage && !comp.explosionDamageMortals },
                    explosionRadius: { value: comp.explosionRadius, hidden: !comp.explosionRadius },
                    loadEntities: { value: lis, hidden: !lis[0] }
                });
            }

            if (entityData.explosionComponent) {
                const { explosionComponent: comp } = entityData;
                const loader = createLoader(comp);

                const relatedSectionElements = [];
                const lis = [];
                if (comp.entity) {
                    for (const path of comp.entity.split(",")) {
                        const data = EntityData.query(path);
                        const sectionOfferedEntity = this.getDataSection(data);
                        relatedSectionElements.push(sectionOfferedEntity);
                        loader.append(sectionOfferedEntity);
                        const li = h.li({ class: "relation=explode", title: "爆炸 不享受施法块属性加成" }, data.name);
                        li.relatedSectionElements = relatedSectionElements;
                        li.dataset.relatedId = sectionOfferedEntity.dataset.relatedId = "explode:" + path;
                        lis.push(li);
                    }
                }

                loader.load({
                    trigger: { value: { type: comp.trigger, delay: comp.delay } },
                    explosionDamage: { value: comp.damage },
                    explosionRadius: { value: comp.radius },
                    loadEntities: { value: lis, hidden: !lis[0] }
                });
            }

            if (entityData.explodeOnDamageComponent) {
                const { explodeOnDamageComponent: comp } = entityData;
                const loader = createLoader(comp);
                const relatedSectionElements = [];
                const lis = [];
                if (comp.entity) {
                    for (const path of comp.entity.split(",")) {
                        const data = EntityData.query(path);
                        const sectionOfferedEntity = this.getDataSection(data);
                        relatedSectionElements.push(sectionOfferedEntity);
                        loader.append(sectionOfferedEntity);
                        const li = h.li({ class: "relation=explode", title: "爆炸 不享受施法块属性加成" }, data.name);
                        li.relatedSectionElements = relatedSectionElements;
                        li.dataset.relatedId = sectionOfferedEntity.dataset.relatedId = "explode:" + path;
                        lis.push(li);
                    }
                }

                loader.load({
                    explosionDamage: { value: comp.damage },
                    explosionRadius: { value: comp.radius },
                    loadEntities: { value: lis, hidden: !lis[0] }
                });
            }

            if (entityData.damageModelComponent) {
                const { damageModelComponent: comp } = entityData;
                /** @type {DamageData} */
                const dm = comp.damageMultipliers; // 简写承伤系数数据
                //prettier-ignore
                createLoader(comp).load({
                    maxHp: { value: comp.maxHp, },
                    projectileDamageMultiplier: { value: dm.projectile, hidden: dm.projectile === 1 },
                    meleeDamageMultiplier: { value: dm.melee, hidden: dm.melee === 1 },
                    electricityDamageMultiplier: { value: dm.electricity, hidden: dm.electricity === 1 },
                    fireDamageMultiplier: { value: dm.fire, hidden: dm.fire === 1 },
                    explosionDamageMultiplier: { value: dm.explosion, hidden: dm.explosion === 1 },
                    iceDamageMultiplier: { value: dm.ice, hidden: dm.ice === 1 },
                    sliceDamageMultiplier: { value: dm.slice, hidden: dm.slice === 1 },
                    healingDamageMultiplier: { value: dm.healing, hidden: dm.healing === 1 },
                    curseDamageMultiplier: { value: dm.curse, hidden: dm.curse === 1 },
                    holyDamageMultiplier: { value: dm.holy, hidden: dm.holy === 1 },
                    drillDamageMultiplier: { value: dm.drill, hidden: dm.drill === 1 },
                    radioactiveDamageMultiplier: { value: dm.radioactive, hidden: dm.radioactive === 1 },
                    physicsHitDamageMultiplier: { value: dm.physicsHit, hidden: dm.physicsHit === 1 },
                    poisonDamageMultiplier: { value: dm.poison, hidden: dm.poison === 1 },
                    overeatingDamageMultiplier: { value: dm.overeating, hidden: dm.overeating === 1 },
                    bloodMaterial: { value: { hurt: comp.bloodSprayMaterial, die: comp.bloodSprayMaterial }, hidden: !(comp.bloodSprayMaterial || comp.bloodSprayMaterial) },
                    airInLungsMax: { value: comp.airInLungsMax, hidden: !comp.airNeeded }
                });
            }

            if (entityData.lifetimeComponent) {
                const { lifetimeComponent: comp } = entityData;
                createLoader(comp).load({ lifetime: { value: comp.lifetime } });
            }

            if (entityData.areaDamageComponent)
                for (const comp of entityData.areaDamageComponent) {
                    const loader = createLoader(comp);
                    const { damage } = comp;
                    //prettier-ignore
                    loader.load({
                        projectileDamage: { value: damage.projectile, hidden: !damage.projectile },
                        meleeDamage: { value: damage.melee, hidden: !damage.melee },
                        electricityDamage: { value: damage.electricity, hidden: !damage.electricity },
                        fireDamage: { value: damage.fire, hidden: !damage.fire },
                        explosionDamage: { value: damage.explosion, hidden: !damage.explosion },
                        iceDamage: { value: damage.ice, hidden: !damage.ice },
                        sliceDamage: { value: damage.slice, hidden: !damage.slice },
                        healingDamage: { value: damage.healing, hidden: !damage.healing },
                        curseDamage: { value: damage.curse, hidden: !damage.curse },
                        holyDamage: { value: damage.holy, hidden: !damage.holy },
                        drillDamage: { value: damage.drill, hidden: !damage.drill },
                        radioactiveDamage: { value: damage.radioactive, hidden: !damage.radioactive },
                        physicsHitDamage: { value: damage.physicsHit, hidden: !damage.physicsHit },
                        poisonDamage: { value: damage.poison, hidden: !damage.poison },
                        overeatingDamage: { value: damage.overeating, hidden: !damage.overeating },
                        damageInterval: { value: comp.damageInterval }
                    });
                    if (comp.circleRadius) loader.load({ damageRadius: { value: comp.circleRadius } });
                    else loader.load({ damageArea: { value: comp.size + "" } });
                }

            if (entityData.gameAreaEffectComponent)
                for (const comp of entityData.gameAreaEffectComponent)
                    createLoader(comp).load({
                        effectRadius: { value: comp.radius },
                        effectInterval: { value: comp.cd, hidden: comp.cd < 1 }
                    });

            if (entityData.homingComponent)
                for (const comp of entityData.homingComponent)
                    createLoader(comp).load({
                        homingRadius: { value: comp.distance },
                        homingTarget: { value: comp.targetWhoShot ? "施放者" : comp.targetTag }
                    });

            if (entityData.hitBoxComponent) {
                const { hitBoxComponent: comp } = entityData;
                createLoader(comp).load({
                    hitArea: { value: "" + comp.size },
                    damageMultiplier: { value: comp.damageMultiplier, hidden: comp.damageMultiplier === 1 }
                });
            }
            return section;
        }

        /**
         * 从xml中创建实体
         * @param {String} data XML字符串
         */
        static fromXML(data) {
            return XML.parse(data);
        }

        async #loadPanelContent() {
            const ed = this.entityData;
            const template = h.template(this.createPanelH1(ed.id, ed.name), await HTMLNoitaEntityElement.getDataSection(this.entityData));
            this.loadPanelContent([template]);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch (this.displayMode) {
                case "panel": extraStyleSheets.push(styleSheet.panel);
            }
            super[$symbols.initStyle](extraStyleSheets);
        }

        /**
         * @override
         * @see Base#contentUpdate
         */
        contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            const entityId = this.entityId;
            console.log(entityId);

            if (entityId) this.entityData = EntityData.queryById(entityId);
            else this.entityData ??= EntityData.$NULL;
            this[$symbols.initStyle]();
            //prettier-ignore
            switch (this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon":
                    //TODO: 等待图标内容内容加载函数
                    break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaEntityElement #${this.entityData.id}`; }
    };
})();
customElements.define("noita-entity", freeze(Entity));
