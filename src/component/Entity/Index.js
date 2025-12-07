/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
const Entity = (() => {
    embed(`#db.js`);
    EntityData.init();

    const entityComponentHoverPanelMap = {
        ProjectileComponent: h`noita-panel`("投射物组件 实体会具备投射物的相关特性。"),
        AIAttackComponent: h`noita-panel`("AI攻击组件 实体会继续远程攻击。"),
        AnimalAIComponentComponent: h`noita-panel`("动物AI组件"),
        LightningComponent: h`noita-panel`("闪电组件"),
        ExplosionComponent: h`noita-panel`("爆炸组件 此组件的爆炸不具备施放者信息。"),
        ExplodeOnDamageComponent: h`noita-panel`("受伤爆炸组件 此组件的爆炸不具备施放者信息。"),
        DamageModelComponent: h`noita-panel`("伤害模型组件 实体可以受到伤害。"),
        LifetimeComponent: h`noita-panel`("存在时间组件 限制实体可存在的最大时间。"),
        AreaDamageComponent: h`noita-panel`("伤害领域组件 造成范围伤害。"),
        GameAreaEffectComponent: h`noita-panel`("游戏效果领域组件 对范围施加游戏效果。"),
        HomingComponent: h`noita-panel`("追踪组件"),
        HitboxComponent: h`noita-panel`("碰撞箱组件 定义实体碰撞体积。"),
        VelocityComponent: h`noita-panel`("速度组件"),
        GameEffectComponent: h`noita-panel`("游戏效果组件"),
        LaserEmitterComponent: h`noita-panel`("射线发射组件"),
        ItemPickUpperComponent: h`noita-panel`("物品拾取组件 获得拾取和使用物品的能力。"),
        GenomeDataComponent: h`noita-panel`("基因组数据组件"),
        MagicConvertMaterialComponent: h`noita-panel`("材料转化组件"),
        CellEaterComponent: h`noita-panel`("材料吞噬组件"),
        VariableStorageComponent: h`noita-panel`("变量存储组件"),
        VariableStorageComponents: h`noita-panel`("变量存储组件(多个)")
    };

    return class HTMLNoitaEntityElement extends $extends(Base, {
        /** @type {$ValueOption<"panel">} */
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<String>} 实体id (path) */
        entityId: { name: "entity.id" },
        /** @type {$ValueOption<string>} */
        entityFoldComponents: { name: "entity.fold-components", $default: "" }
    }) {
        /** @type {typeof EntityData.query} */
        static query = EntityData.query.bind(EntityData);

        /** @type {typeof EntityData.queryByName} */
        static queryByName = EntityData.queryByName.bind(EntityData);

        /** @type {typeof EntityData.queryByTag} */
        static queryByTag = EntityData.queryByTag.bind(EntityData);

        /** @type {typeof EntityData.queryByPath} */
        static queryByPath = EntityData.queryByPath.bind(EntityData);

        /** @type {typeof EntityData.queryByComponent} */
        static queryByComponent = EntityData.queryByComponent.bind(EntityData);

        static get entityComponents() {
            return EntityData.entityComponents;
        }

        static get entityTags() {
            return EntityData.entityTags;
        }

        static get datas() {
            return [...EntityData.datas.values()];
        }

        /** @type {EntityData} */
        entityData;

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
            this.attachShadow({ mode: "open" });
            if (typeof data === "string") this.entityId = data;
            else if (typeof data === "object") this.entityData = data;
        }

        /**
         * 获取实体数据表 (这也会暴露给法术组件使用)
         * @param {EntityData} entityData 投射物数据
         * @param {Object} option 配置
         * @param {import("@spell").SpellData.ProjectileData} option.extraData 额外数据
         * @param {Array<string>} option.ignore 忽略展示属性
         * @param {"s"|"f"} option.timeUnit 时间单位
         * @param {Array<string>} option.foldComponents 需要折叠的组件
         * @returns {HTMLElement}
         */
        static getDataSection(entityData, { extraData = { drawCount_Death: 0, drawCount_Hit: 0, drawCount_Timer: 0 }, ignore = [], timeUnit = "s", foldComponents = [] } = {}) {
            const loader = new this.PanelAttrLoader(ignore);
            loader.load({
                draw: { value: extraData, hidden: extraData.drawCount_Death + extraData.drawCount_Hit + extraData.drawCount_Timer === 0 },
                tag: { value: entityData.tags, hidden: !entityData.tags[0] },
                dropMoney: { value: entityData.dropMoney, hidden: !entityData.dropMoney }
            });
            const section = h.section({ role: "tabpanel", class: "attrs" }, loader.container);
            if (entityData["/* undefined */"] === 0) section.classList.add("empty");
            /** @param {typeof EntityData.Component.prototype} component*/
            const createLoader = ({ $type }, multiple = false) => {
                const loader = new this.PanelAttrLoader(ignore, timeUnit);
                const summary = h.summary($type + (multiple ? "s" : ""));
                hoverMsg.attach(summary, entityComponentHoverPanelMap[$type + (multiple ? "s" : "")]);
                const details = h.details({ class: "entity-component", open: true }, summary, h.div(loader.container));
                details.open = !foldComponents.includes($type);
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
                    explosionDestroyDurability: { value: comp.explosionDestroyDurability, hidden: !comp.explosionDestroyDurability },
                    explosionDestroyEnergy: { value: comp.explosionDestroyEnergy, hidden: !comp.explosionDestroyEnergy },
                    explosionCreateMaterial: { value: comp.explosionCreateMaterial, hidden: !comp.explosionCreateMaterial },
                    spreadDegrees: { value: _Math.radianToDegree(comp.spreadDegrees), hidden: !comp.spreadDegrees },
                    bounces: { value: comp.bounces, hidden: !comp.bounces },
                    knockbackForce: { value: comp.knockbackForce, hidden: !comp.knockbackForce },
                    speed: { value: comp.speed },
                    lifetime: { value: comp.lifetime },
                    damageInterval: { value: comp.damageInterval, hidden: comp.damageInterval === 1 },
                    collideWithShooterFrames: { value: comp.collideWithShooterFrames, hidden: !comp.friendlyFire },
                    friendlyFire: { value: comp.friendlyFire },
                    explosionDamageTarget: { value: explosionDamageTarget },
                    destroyDurability: { value: comp.destroyDurability, hidden: !comp.destroyDurability },
                    destroyPenetrationCoeff: { value: comp.destroyPenetrationCoeff, hidden: !comp.destroyPenetrationCoeff },
                    collideWithTag: { value: comp.collideWithTag },
                    penetrateEntities: { value: comp.penetrateEntities },
                    penetrateWorld: { value: comp.penetrateWorld },
                    collideWithEntities: { value: comp.collideWithEntities },
                    collideWithWorld: { value: comp.collideWithWorld },
                    onCollisionDie: { value: comp.onCollisionDie },
                    damageScaledBySpeed: { value: comp.damageScaledBySpeed },
                    dieOnLowVelocity: { value: comp.dieOnLowVelocity },
                    dieOnLiquidCollision: { value: comp.dieOnLiquidCollision },
                    doMovetoUpdate: { value: !comp.doMovetoUpdate },
                    loadEntities: { value: lis, hidden: !lis[0] }
                });
            }

            if (entityData.animalAIComponent) {
                const { animalAIComponent: comp } = entityData;
                createLoader(comp).load({
                    dashMeleeDamage: { value: comp.dashDamage, hidden: !comp.dashDamage },
                    commonMeleeDamage: { value: comp.meleeDamage, hidden: !comp.meleeDamage.max },
                    attackOnlyIfAttacked: { value: comp.attackOnlyIfAttacked },
                    defecatesAndPees: { value: comp.defecatesAndPees },
                    dontCounterAttackOwnHerd: { value: comp.dontCounterAttackOwnHerd },
                    senseCreatures: { value: comp.senseCreatures },
                    senseCreaturesThroughWalls: { value: comp.senseCreaturesThroughWalls },
                    triesToRangedAttackFriends: { value: comp.triesToRangedAttackFriends }
                });
            }

            if (entityData.aIAttackComponent) {
                for (const comp of entityData.aIAttackComponent) {
                    const loader = createLoader(comp);
                    const relatedSectionElements = [];
                    const lis = [];
                    const data = EntityData.query(comp.entity);
                    const sectionOfferedEntity = this.getDataSection(data);
                    relatedSectionElements.push(sectionOfferedEntity);
                    loader.append(sectionOfferedEntity);
                    const li = h.li();
                    if (comp.count.isFixed && comp.count.median === 1) li.append(data.name);
                    else li.append(`${data.name}(${comp.count})`);
                    li.relatedSectionElements = relatedSectionElements;
                    li.dataset.relatedId = sectionOfferedEntity.dataset.relatedId = comp.entity;
                    lis.push(li);
                    loader.load({
                        scanningRadius: { value: comp.distance },
                        attackInterval: { value: comp.framesBetween },
                        attackProbability: { value: comp.useProbability, hidden: comp.useProbability === 1 },
                        projectilesUsed: { value: lis, hidden: !lis[0] }
                    });
                }
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
                    explosionDestroyDurability: { value: comp.explosionDestroyDurability, hidden: !comp.explosionDestroyDurability },
                    explosionDestroyEnergy: { value: comp.explosionDestroyEnergy, hidden: !comp.explosionDestroyDurability },
                    explosionCreateMaterial: { value: comp.explosionCreateMaterial, hidden: !comp.explosionCreateMaterial },
                    // explosionDamageTarget: {value: comp.ex},
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
                    explosionDestroyDurability: { value: comp.explosionDestroyDurability, hidden: !comp.explosionDestroyDurability },
                    explosionDestroyEnergy: { value: comp.explosionDestroyEnergy, hidden: !comp.explosionDestroyDurability },
                    explosionCreateMaterial: { value: comp.explosionCreateMaterial, hidden: !comp.explosionCreateMaterial },
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
                    explosionDestroyDurability: { value: comp.explosionDestroyDurability, hidden: !comp.explosionDestroyDurability },
                    explosionDestroyEnergy: { value: comp.explosionDestroyEnergy, hidden: !comp.explosionDestroyDurability },
                    explosionCreateMaterial: { value: comp.explosionCreateMaterial, hidden: !comp.explosionCreateMaterial },
                    loadEntities: { value: lis, hidden: !lis[0] }
                });
            }

            if (entityData.damageModelComponent) {
                const { damageModelComponent: comp } = entityData;
                /** @type {DamageData} */
                const dm = comp.damageMultipliers; // 简写承伤系数数据
                comp.materialDamageData;
                comp.fallingDamage;
                createLoader(comp).load({
                    maxHp: { value: comp.maxHp },
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
                    bloodMaterial: { value: { hurt: comp.bloodSprayMaterial, die: comp.bloodMaterial }, hidden: !(comp.bloodSprayMaterial || comp.bloodMaterial) },
                    airInLungsMax: { value: comp.airInLungsMax, hidden: !comp.airNeeded },
                    materialDamages: { value: comp.materialDamageData, hidden: !Object.keys(comp.materialDamageData).length },
                    fallingDamage: { value: comp.fallingDamage.toString(), hidden: !comp.fallingDamages },
                    fallingDamageHeight: { value: comp.fallingDamageHeight.toString("px"), hidden: !comp.fallingDamages },
                    physicsObjectsDamage: { value: comp.physicsObjectsDamage }
                });
            }

            if (entityData.genomeDataComponent) {
                const { genomeDataComponent: comp } = entityData;
                createLoader(comp).load({
                    predator: { value: comp.isPredator },
                    berserkDontAttackFriends: { value: comp.berserkDontAttackFriends },
                    herd: { value: comp.herd }
                });
            }

            if (entityData.lifetimeComponent) {
                const { lifetimeComponent: comp } = entityData;
                createLoader(comp).load({ lifetimeMax: { value: comp.lifetime } });
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
                        damageInterval: { value: comp.damageInterval },
                        target: {value: comp.target }
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
            if (entityData.velocityComponent) {
                const { velocityComponent: comp } = entityData;
                createLoader(comp).load({
                    airFriction: { value: comp.airFriction },
                    gravity: { value: comp.gravity, hidden: comp.gravity === 0 },
                    mass: { value: comp.mass },
                    speedMax: { value: comp.speedMax }
                });
            }
            if (entityData.gameEffectComponent)
                for (const comp of entityData.gameEffectComponent) {
                    createLoader(comp).load({
                        effectType: { value: comp.effectType },
                        duration: { value: comp.duration }
                    });
                }
            if (entityData.laserEmitterComponent)
                for (const comp of entityData.laserEmitterComponent) {
                    createLoader(comp).load({
                        projectileDamage: { value: comp.damage, hidden: !comp.damage },
                        destroyDurability: { value: comp.destroyDurability },
                        destroyEnergy: { value: comp.destroyEnergy },
                        hitArea: { value: "" + comp.size },
                        particleMaterial: { value: comp.material }
                    });
                }

            if (entityData.cellEaterComponent) {
                for (const comp of entityData.cellEaterComponent) {
                    const loader = createLoader(comp);
                    loader.load({
                        eatRadius: { value: comp.radius },
                        eatProbability: { value: comp.eatProbability },
                        onlyEatStain: { value: comp.onlyStain },
                        eatDynamicPhysicsBodies: { value: comp.eatDynamicPhysicsBodies },
                        ...(comp.limitedMaterials
                            ? {
                                  //白名单模式
                                  eatMaterials: { value: { enum: comp.materials }, hidden: !comp.materials.length }
                              }
                            : {
                                  //黑名单模式
                                  ignoredEatMaterials: {
                                      value: {
                                          enum: comp.ignoredMaterials,
                                          tag: comp.ignoredMaterialTag
                                      },
                                      hidden: !comp.ignoredMaterials.length && !comp.ignoredMaterialTag
                                  }
                              })
                    });
                }
            }

            if (entityData.magicConvertMaterialComponent) {
                for (const comp of entityData.magicConvertMaterialComponent) {
                    const loader = createLoader(comp);

                    loader.load({
                        materialConvertRadius: { value: comp.radius },
                        materialConvertEntities: { value: comp.convertEntities },
                        igniteMaterials: { value: comp.igniteMaterials, hidden: !comp.igniteMaterials },
                        materialConvertMap: { value: comp.convertMap, hidden: !Object.keys(comp.convertMap).length }
                    });
                }
            }

            if (entityData.itemPickUpperComponent) {
                const { itemPickUpperComponent: comp } = entityData;
                createLoader(comp).load({
                    dropItems: { value: comp.dropItems },
                    isImmuneToKicks: { value: comp.isImmuneToKicks }
                });
            }

            if (entityData.variableStorageComponent) {
                const attrs = {};
                for (const varName in entityData.variableStorageComponent) {
                    const comp = entityData.variableStorageComponent[varName];
                    attrs["var." + varName] = { value: comp };
                    // createLoader(comp).load({ ["var." + varName]: { value: comp } });
                }
                createLoader({ $type: "VariableStorageComponent" }, Object.keys(attrs).length > 1).load(attrs);
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
            const template = h.template(createPanelH1(ed.path, ed.name), await HTMLNoitaEntityElement.getDataSection(this.entityData, { foldComponents: this.entityFoldComponents.split(" ") }));
            this.loadPanelContent([template]);
        }

        static [$css] = { panel: [css(embed(`#panel.css`), { name: "entity-panel" })] };

        [$content]() {
            const entityId = this.entityId;
            if (entityId) this.entityData = EntityData.queryById(entityId);
            else this.entityData ??= EntityData.$NULL;
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
h["noita-entity"] = freeze(Entity);
