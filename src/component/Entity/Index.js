/** @typedef {import("TYPE").EntityData} EntityData */
/** @typedef {import("TYPE").EntityData.DamageModelComponent} EntityData.DamageModelComponent */
/** @typedef {import("TYPE").EntityData.ProjectileComponent} EntityData.ProjectileComponent */
/** @typedef {import("TYPE").EntityData.OfferedEntityData} EntityData.OfferedEntityData */
/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
const Entity = (() => {
    embed(`#db.js`);
    EntityData.init();
    const styleSheet = {
        panel: gss(embed(`#panel.css`))
    };
    return class HTMLNoitaEntityElement extends $class(Base, {
        /** @type {$ValueOption<"panel">} */
        displayMode: { name: "display", $default: "panel" },
        /** @type {$ValueOption<String>} */
        entityId: { attrName: "entity.id" }
    }) {
        static queryById = EntityData.queryById;

        #shadowRoot = this.attachShadow({ mode: "closed" });
        /** @type {EntityData} */ entityData;

        constructor(...params) {
            super();
            if (params.length) {
                if (typeof params[0] === "object") this.entityData = params[0];
                else if (typeof params[0] === "string") this.setAttribute("eneity.id", params[0]);
            }
        }

        /**
         * 获取投射物数据表 (这将会暴露给法术组件使用)
         * @param {EntityData} entityData 投射物数据
         * @param {import("@spell").SpellData.ProjectileData} [extraData] 附加数据
         * @returns {HTMLElement}
         */
        static getDataSection(entityData, extraData = { drawCount_Death: 0, drawCount_Hit: 0, drawCount_Timer: 0 }, ignore = []) {
            const pc = entityData.projectileComponent;
            const dmc = entityData.damageModelComponent;

            const loader = new this.PanelAttrLoader(ignore);
            const section = h.section({ role: "tabpanel" }, loader.container);

            //#region 投射物组件
            if (pc) {
                //#region 提供实体数据加载
                const relatedSectionElements = [];
                const lis = [];
                for (let i = 0; i < pc.offeredEntities.length; i++) {
                    const entityData = pc.offeredEntities[i].entityData;
                    const num_min = pc.offeredEntities[i].num_min;
                    const num_max = pc.offeredEntities[i].num_max;
                    // 递归获取投射物提供的投射物数据
                    const section_offeredEntity = this.getDataSection(entityData);
                    section_offeredEntity.setAttribute("related-id", entityData.id);
                    section_offeredEntity.setAttribute("roles", "tabpanel"); // 无障碍标注
                    relatedSectionElements.push(section_offeredEntity);
                    section.append(section_offeredEntity);
                    const li = createElement("li");
                    li.setAttribute("related-id", entityData.id);
                    li.relatedSectionElements = relatedSectionElements;
                    li.append(entityData.name);
                    if (num_min === num_max) {
                        if (num_min !== 0) li.append(`(${num_min})`);
                    } else li.append(`(${num_min}~${num_max})`);
                    li.setAttribute("entity.relation", "null");
                    li.title = "不可享受施法块属性加成";
                    lis.push(li);
                }
                //#endregion
                /** @type {DamageData} */ const od = pc.offeredDamage; //简写伤害数据

                //#region 简单数据加载
                //prettier-ignore
                loader.load({
                    draw:                { value: extraData,                                           hidden: extraData.drawCount_Death + extraData.drawCount_Hit + extraData.drawCount_Timer === 0 },
                    projectileDamage:    { value: od.projectile,                                       hidden: !od.projectile                 },
                    meleeDamage:         { value: od.melee,                                            hidden: !od.melee                      },
                    electricityDamage:   { value: od.electricity,                                      hidden: !od.electricity                },
                    fireDamage:          { value: od.fire,                                             hidden: !od.fire                       },
                    explosionDamage:     { value: od.explosion,                                        hidden: !od.explosion                  },
                    iceDamage:           { value: od.ice,                                              hidden: !od.ice                        },
                    sliceDamage:         { value: od.slice,                                            hidden: !od.slice                      },
                    healingDamage:       { value: od.healing,                                          hidden: !od.healing                    },
                    curseDamage:         { value: od.curse,                                            hidden: !od.curse                      },
                    holyDamage:          { value: od.holy,                                             hidden: !od.holy                       },
                    drillDamage:         { value: od.drill,                                            hidden: !od.drill                      },
                    radioactiveDamage:   { value: od.radioactive,                                      hidden: !od.radioactive                },
                    explosionRadius:     { value: pc.explosionRadius,                                  hidden: !pc.explosionRadius            },
                    spreadDegrees:       { value: math_.radianToDegree(pc.spreadDegrees),          hidden: !pc.spreadDegrees              },
                    bounces:             { value: pc.bounces,                                          hidden: !pc.bounces                    },
                    knockbackForce:      { value: pc.knockbackForce,                                   hidden: !pc.knockbackForce             },
                    speed:               { value: pc.speed,                                               },
                    lifetime:            { value: pc.lifetime,                                                                                },
                    projectilesProvided: { value: lis,                                                 hidden: !lis[0]                        }
                });
                //#endregion
            }
            //#region 伤害模型组件
            if (dmc) {
                /** @type {DamageData} */ const dm = dmc.damageMultipler; // 简写承伤系数数据
                //prettier-ignore
                loader.load({
                    maxHp:                       { value: dmc.maxHp,                                                                                                                   },
                    projectileDamageMultiplier:  { value: dm.projectile,                                                    hidden: dm.projectile === 1                                },
                    meleeDamageMultiplier:       { value: dm.melee,                                                         hidden: dm.melee === 1                                     },
                    electricityDamageMultiplier: { value: dm.electricity,                                                   hidden: dm.electricity === 1                               },
                    fireDamageMultiplier:        { value: dm.fire,                                                          hidden: dm.fire === 1                                      },
                    explosionDamageMultiplier:   { value: dm.explosion,                                                     hidden: dm.explosion === 1                                 },
                    iceDamageMultiplier:         { value: dm.ice,                                                           hidden: dm.ice === 1                                       },
                    healingDamageMultiplier:     { value: dm.healing,                                                       hidden: dm.healing === 1                                   },
                    curseDamageMultiplier:       { value: dm.curse,                                                         hidden: dm.curse === 1                                     },
                    holyDamageMultiplier:        { value: dm.holy,                                                          hidden: dm.holy === 1                                      },
                    drillDamageMultiplier:       { value: dm.drill,                                                         hidden: dm.drill === 1                                     },
                    radioactiveDamageMultiplier: { value: dm.radioactive,                                                   hidden: dm.radioactive === 1                               },
                    physicsHitDamageMultiplier:  { value: dm.physicsHit,                                                    hidden: dm.physicsHit === 1                                },
                    poisonDamageMultiplier:      { value: dm.poison,                                                        hidden: dm.poison === 1                                    },
                    overeatingDamageMultiplier:  { value: dm.overeating,                                                    hidden: dm.overeating === 1                                },
                    bloodMaterial:               { value: { hurt: dmc.bloodMaterial_hurt, die: dmc.bloodMaterial_die },     hidden: !(dmc.bloodMaterial_hurt || dmc.bloodMaterial_die) },
                    airInLungsMax:               { value: dmc.airInLungsMax,                                                hidden: dmc.airInLungsMax === -1                           }
                });
            }
            //#endregion
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
            const template = createElement("template");
            const ed = this.entityData;
            const section = await HTMLNoitaEntityElement.getDataSection(this.entityData);
            template.content.append(this.createPanelH1(ed.id, ed.name), section);
            this.loadPanelContent([template]);
        }

        /** @param {Array<CSSStyleSheet>} [extraStyleSheets] 额外样式表 */
        [$symbols.initStyle](extraStyleSheets = []) {
            // extraStyleSheets.push(styleSheet.base);
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": extraStyleSheets.push(styleSheet.panel)
            }
            super[$symbols.initStyle](extraStyleSheets);
        }

        contentUpdate() {
            this.#shadowRoot.innerHTML = "";
            const entityId = this.entityId;
            if (entityId) this.entityData = EntityData.queryById(entityId);
            else this.entityData ??= EntityData.$NULL;
            this[$symbols.initStyle]();
            //prettier-ignore
            switch(this.displayMode) {
                case "panel": this.#loadPanelContent(); break;
                case "icon": 
                    //TODO: 等待图标内容内容加载函数
                    break;
                default: throw new TypeError("不支持的显示模式");
            }
        }

        connectedCallback() {
            this.contentUpdate();
        }

        //prettier-ignore
        get [Symbol.toStringTag]() { return `HTMLNoitaEntityElement #${this.entityData.id}` }
    };
})();
customElements.define("noita-entity", freeze(Entity));
