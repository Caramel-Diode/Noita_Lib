/** @typedef {"panel"|"icon"} DisplayMode 展示模式 */
const Base = (() => {
    embed(`#db.js`);
    return Object.freeze(
        class extends HTMLElement {
            static observedAttributes = Object.freeze(["display"]);

            static {
                /** @type {CSSStyleSheet} */
                const styleSheet_base = gss(embed(`#base.css`));
                this.prototype.publicStyleSheets = {
                    icon: [styleSheet_base, gss(embed(`#icon.css`))],
                    panel: [styleSheet_base, gss(embed(`#panel.css`))]
                };
            }

            /**
             * 面板标题转换
             * **`name ⇌ id`**
             */
            static panelTitleSwitchFn = (() => {
                const main = event => {
                    /** @type {HTMLHeadingElement} */
                    const h1 = event.target;
                    const id = h1.getAttribute("switch.id");
                    const name = h1.getAttribute("switch.name");
                    if (h1.innerText === id) {
                        h1.innerText = name;
                    } else if (h1.innerText === name) {
                        h1.innerText = id;
                    } else {
                        console.error("内容意外修改");
                    }
                };
                return {
                    /**
                     * 用于鼠标触发 `左键`
                     * @param {MouseEvent} event
                     */
                    byMouse: event => {
                        main(event);
                    },
                    /**
                     * 用于键盘触发 `Enter`
                     * @param {KeyboardEvent} event
                     */
                    byKeyboard: event => {
                        if (event.key === "Enter") main(event);
                        else if (event.key === "Escape") event.target.blur();
                    }
                };
            })();

            /**
             * 获取面板属性加载器
             */
            static getPanelAttrLoader = (() => {
                /** @borrows utilities.frameToSecond as fts */
                const fts = util.frameToSecond;
                /** @borrows utilities.addPlusSign as aps */
                const aps = util.addPlusSign;
                /** @borrows utilities.getExactDegree as ged */
                const ged = util.getExactDegree;

                const panelInfoSwitchFn = (() => {
                    const main = event => {
                        const forceToHidden = event.target.classList.contains("selected"); // 再次点击已选中的target时强制隐藏
                        const relatedSectionElements = event.target.relatedSectionElements;
                        const relatedLiElements = event.target.relatedLiElements;
                        for (let element of relatedSectionElements) {
                            element.hidden = element.getAttribute("related-id") !== event.target.getAttribute("related-id") || forceToHidden;
                        }
                        for (let element of relatedLiElements) {
                            element.classList.replace("selected", "unselected");
                            // element.setAttribute("aria-selected", "false");// 无障碍标注
                        }
                        if (!forceToHidden) {
                            event.target.classList.replace("unselected", "selected");
                            // event.target.setAttribute("aria-selected", "true");// 无障碍标注
                        }
                    };
                    return {
                        /**
                         * 用于鼠标触发 `左键`
                         * @param {MouseEvent} event
                         */
                        byMouse: event => {
                            main(event);
                        },
                        /**
                         * 用于键盘触发 `Enter`
                         * @param {KeyboardEvent} event
                         */
                        byKeyboard: event => {
                            if (event.key === "Enter") main(event);
                            else if (event.key === "Escape") event.target.blur();
                        }
                    };
                })();

                const panelAttrInfo = db_base.panelAttrInfo;

                const unitConvert = (() => {
                    /**
                     * 单位转换 `秒 ⇌ 帧`
                     * @param {HTMLElement} element
                     */
                    const _ = element => {
                        /** @type {HTMLTableCellElement} */
                        if (element.getAttribute("display") === "SECOND") {
                            element.innerText = element.getAttribute("value.frame");
                            element.setAttribute("display", "FRAME");
                        } else {
                            element.innerText = element.getAttribute("value.second");
                            element.setAttribute("display", "SECOND");
                        }
                    };
                    return {
                        /**
                         * 用于鼠标触发 `左键`
                         * @param {MouseEvent} e
                         */
                        byMouse(e) {
                            _(e.target);
                        },
                        /**
                         * 用于键盘触发 `Enter`
                         * @param {KeyboardEvent} e
                         */
                        byKeyboard(e) {
                            if (e.key === "Enter") _(e.target);
                            else if (e.key === "Escape") e.target.blur();
                        }
                    };
                })();

                const attrLoader = class {
                    /** @type {Node} 目标容器 */ container;
                    constructor(target) {
                        this.container = target;
                    }
                    /**
                     * 加载属性表行
                     * @param {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"bloodMaterial"|"maxHp"|"immunity"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"|"airInLungsMax"|"patternDegrees"|"trailMaterial"|"trailMaterialAmount"|"material"|"materialAmount"} type
                     * @param {String|Node|{second:number,frame:Number}} content
                     */
                    async #loadTr(type, content) {
                        const tr = document.createElement("tr");
                        const th = document.createElement("th");
                        const td = document.createElement("td");
                        /** @type {panelAttrInfo} */
                        let attrInfo = panelAttrInfo.datas.get(type);
                        th.append(await attrInfo.getIcon(), attrInfo.name);
                        const contentType = typeof content;
                        if (contentType === "string") {
                            td.append(content);
                        } else if (contentType === "object") {
                            if (content instanceof Node) {
                                // html节点 直接插入
                                td.append(content);
                            } else {
                                // 单位换算信息 默认显示`秒`
                                td.setAttribute("tabindex", "0"); // 无障碍 可被键盘聚焦
                                td.addEventListener("click", unitConvert.byMouse);
                                td.addEventListener("keydown", unitConvert.byKeyboard);
                                td.setAttribute("display", "SECOND");
                                td.setAttribute("value.second", content.second);
                                td.setAttribute("value.frame", content.frame);
                                td.append(content.second);
                            }
                        }
                        tr.append(th, td);
                        this.container.append(tr);
                    }
                    /**
                     * 加载`施放延迟`|`充能时间`面板属性
                     * @param {"fireRateWait"|"lifetime"} type CD类型
                     * @param {Number|{min:Number,max:Number}} value
                     * @param {Boolean} [needSign]
                     */
                    _castCD(type, value, needSign = false) {
                        let unitConvertData = { second: "", frame: "" };
                        if (typeof value === "number") {
                            unitConvertData.second = fts(value);
                            unitConvertData.frame = value;
                            if (needSign) {
                                unitConvertData.second = aps(unitConvertData.second);
                                unitConvertData.frame = aps(unitConvertData.frame);
                            }
                            unitConvertData.second = `${unitConvertData.second}s`;
                            unitConvertData.frame = `${unitConvertData.frame}f`;
                        } else if (typeof value === "object") {
                            if (value.min === -Infinity) {
                                if (needSign) {
                                    unitConvertData.second = `≤ ${aps(fts(value.max))}s`;
                                    unitConvertData.frame = `≤ ${aps(value.max)}f`;
                                } else {
                                    unitConvertData.second = `≤ ${fts(value.max)}s`;
                                    unitConvertData.frame = `≤ ${value.max}f`;
                                }
                            } else if (value.max === Infinity) {
                                if (needSign) {
                                    unitConvertData.second = `≥ ${aps(fts(value.min))}s`;
                                    unitConvertData.frame = `≥ ${aps(value.min)}f`;
                                } else {
                                    unitConvertData.second = `≥ ${fts(value.min)}s`;
                                    unitConvertData.frame = `≥ ${value.min}f`;
                                }
                            } else if (needSign) {
                                unitConvertData.second = `${aps(fts(value.min))}s ~ ${aps(fts(value.max))}s`;
                                unitConvertData.frame = `${aps(value.min)}f ~ ${aps(value.max)}f`;
                            } else {
                                unitConvertData.second = `${fts(value.min)}s ~ ${fts(value.max)}s`;
                                unitConvertData.frame = `${value.min}f ~ ${value.max}f`;
                            }
                        }
                        this.#loadTr(type, unitConvertData);
                    }
                    /**
                     * 加载`存在时间`面板属性
                     * @param {Number|{base:Number,fluctuation:Number}} value
                     * @param {Boolean} [needSign]
                     */
                    _lifetime(value, needSign = false) {
                        let unitConvertData = { second: "", frame: "" };
                        if (typeof value === "number") {
                            if (needSign) {
                                unitConvertData.second = `${aps(fts(value))}s`;
                                unitConvertData.frame = `${aps(value)}f`;
                            } else {
                                unitConvertData.second = `${fts(value)}s`;
                                unitConvertData.frame = `${value}f`;
                            }
                        } else if (value.fluctuation === 0) {
                            if (needSign) {
                                unitConvertData.second = `${aps(fts(value.base))}s`;
                                unitConvertData.frame = `${aps(value.base)}f`;
                            } else {
                                unitConvertData.second = `${fts(value.base)}s`;
                                unitConvertData.frame = `${value.base}f`;
                            }
                            if (value.base === -1) {
                                unitConvertData.second = `永久`;
                                unitConvertData.frame = `-1`;
                            }
                        } else {
                            const min = value.base - value.fluctuation;
                            const max = value.base + value.fluctuation;
                            if (needSign) {
                                unitConvertData.second = `${aps(fts(min))}s ~ ${aps(fts(max))}s`;
                                unitConvertData.frame = `${aps(min)}f ~ ${aps(max)}f`;
                            } else {
                                unitConvertData.second = `${fts(min)}s ~ ${fts(max)}s`;
                                unitConvertData.frame = `${min}f ~ ${max}f`;
                            }
                        }
                        this.#loadTr("lifetime", unitConvertData);
                    }
                    /**
                     * 加载`法力恢复速度`面板属性
                     * @param {Number|{min:Number,max:Number}} value
                     */
                    _manaChargeSpeed(value) {
                        let unitConvertData = { second: "", frame: "" };
                        if (typeof value === "number") {
                            unitConvertData.second = `${value}/s`;
                            unitConvertData.frame = `${fts(value)}/f`;
                        } else {
                            if (value.min === -Infinity) {
                                unitConvertData.second = `≤ ${fts(value.max)}/s`;
                                unitConvertData.frame = `≤ ${value.max}/f`;
                            } else if (value.max === Infinity) {
                                unitConvertData.second = `≥ ${fts(value.min)}/s`;
                                unitConvertData.frame = `≥ ${value.min}/f`;
                            } else {
                                unitConvertData.second = `${fts(value.min)}/s ~ ${fts(value.max)}/s`;
                                unitConvertData.frame = `${value.min}/f ~ ${value.max}/f`;
                            }
                        }
                        this.#loadTr("manaChargeSpeed", unitConvertData);
                    }
                    /**
                     * 加载`散射角度`面板属性
                     * @param {Number|{min:Number,max:Number}} value
                     * @param {Boolean} [needSign]
                     */
                    _spreadDegrees(value, needSign = false) {
                        let content;
                        if (typeof value === "number") {
                            content = ged(value, needSign);
                        } else if (typeof value === "object") {
                            if (value.min === -Infinity) {
                                content = `≤ ${ged(value.max, needSign)}`;
                            } else if (value.max === Infinity) {
                                content = `≥ ${ged(value.min, needSign)}`;
                            } else {
                                content = `${ged(value.min, needSign)} ~ ${ged(value.max, needSign)}`;
                            }
                        }
                        this.#loadTr("spreadDegrees", content);
                    }
                    /**
                     * 加载`投射物速度`|`投射物速度倍数`面板属性
                     * @param {"speed"|"speedMultiplier"} type
                     * @param {Number|{min:Number,max:Number}} value
                     * @param {Boolean} [needSign]
                     */
                    _speed(type, value, needSign = false) {
                        let content;
                        if (typeof value === "object") {
                            if (value.min === -Infinity) content = `≤ ${value.max}`;
                            else if (value.max === Infinity) content = `≥ ${value.min}`;
                            else if (value.min !== value.max) content = `${value.min} ~ ${value.max}`;
                            else content = `${value.min}`;
                        } else content = `${value}`;

                        if (needSign) content = `× ${content}`;
                        this.#loadTr(type, content);
                    }
                    /**
                     * 加载`暴击率`面板属性
                     * @param {Number} value
                     */
                    _damageCriticalChance(value) {
                        this.#loadTr("damageCriticalChance", `${aps(value)}%`);
                    }
                    /**
                     * 加载`最大使用次数`|`剩余使用次数`面板属性
                     * @param {"maxUse"|"remainingUse"} type
                     * @param {{max:Number,remaining:Number?,neverUnlimited:Boolean}} value
                     */
                    _timesUsed(type, value) {
                        const content = document.createElement("data");
                        if (value.neverUnlimited) {
                            content.classList.add("never-unlimited");
                            content.title = "不可无限化";
                        } else {
                            content.classList.add("unlimited");
                            content.title = "可无限化";
                        }
                        if (type === "remainingUse") {
                            content.append(`${value.remaining}/`);
                        }
                        content.append(`${value.max}`);
                        this.#loadTr(type, content);
                    }
                    /**
                     * 加载`抽取数`面板属性
                     * @param {Number|{min:Number?,max:Number?,common:Number?,hit:Number?,timer:{count:Number,delay:Number}?,death:Number?}} [value]
                     */
                    async _draw(value = 1) {
                        /** @type {DocumentFragment|String} */
                        let content;
                        if (typeof value === "number") {
                            content = `${value}`; //法杖固定抽取数
                        } else if (typeof value === "object") {
                            if (value.min !== undefined) {
                                //法杖不定数量抽取
                                content = `${value.min} ~ ${value.max}`;
                            } else {
                                //法术多类型抽取
                                const ul = document.createElement("ul");
                                if (value.common) {
                                    // 普通抽取
                                    const li = document.createElement("li");
                                    li.append(await panelAttrInfo.datas.get("draw_common").getIcon(), value.common);
                                    ul.append(li);
                                }
                                if (value.hit) {
                                    // 碰撞抽取
                                    const li = document.createElement("li");
                                    li.append(await panelAttrInfo.datas.get("draw_hit").getIcon(), value.hit);
                                    li.title = "碰撞触发抽取";
                                    ul.append(li);
                                }
                                if (value.timer.count) {
                                    // 定时抽取
                                    const li = document.createElement("li");
                                    li.append(await panelAttrInfo.datas.get("draw_timer").getIcon(), `${value.timer.count} (${value.timer.delay}f)`);
                                    li.title = `定时触发抽取\n延迟:${value.timer.delay}f`;
                                    ul.append(li);
                                }
                                if (value.death) {
                                    const li = document.createElement("li");
                                    li.append(await panelAttrInfo.datas.get("draw_death").getIcon(), value.death);
                                    li.title = "失效触发抽取";
                                    ul.append(li);
                                }
                                content = ul;
                            }
                        }
                        this.#loadTr("draw", content);
                    }
                    /**
                     * 加载`最大法力值`|`容量`面板属性
                     * @param {"manaMax"|"capacity"} type
                     * @param {Number|{min:Number,max:Number}} value
                     */
                    _manaMaxOrCapacity(type, value) {
                        let content;
                        if (typeof value === "object") {
                            if (value.min === -Infinity) content = `≤ ${value.max}`;
                            else if (value.max === Infinity) content = `≥ ${value.min}`;
                            else content = `${value.min} ~ ${value.max}`;
                        } else {
                            content = `${value}`;
                        }
                        this.#loadTr(type, content);
                    }
                    /**
                     * 加载`伤害`|`承伤`面板属性
                     * @param {"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"} type
                     * @param {Number|Array<Node>} value
                     * @param {Boolean} [needSign]
                     */
                    _damage(type, value, needSign = false) {
                        let content;
                        if (needSign) content = `${aps(value)}`; // 伤害修正
                        else content = `${value}`; //投射物本体伤害/承伤系数
                        this.#loadTr(type, content);
                    }
                    /**
                     * 加载`提供投射物`|`使用投射物`属性
                     * @param {"projectilesProvided"|"projectilesUsed"} type
                     * @param {Array<Node>} value
                     */
                    _offerEntity(type, value) {
                        const ul = document.createElement("ul");
                        for (let i = 0; i < value.length; i++) {
                            const li = value[i];
                            li.setAttribute("tabindex", "0"); // 无障碍 允许tab聚焦
                            li.setAttribute("roles", "tab");
                            li.addEventListener("click", panelInfoSwitchFn.byMouse);
                            li.addEventListener("keydown", panelInfoSwitchFn.byKeyboard);
                            ul.append(li);
                        }
                        value[0].click(); //提供的数据会全部展示 此处点击以实现仅显示首个投射物信息
                        ul.className = "entities-tabpanel";
                        ul.setAttribute("roles", "tablist"); // 无障碍标注
                        this.#loadTr(type, ul);
                    }
                    /**
                     *
                     * @param {String} value_hurt
                     * @param {String} value_die
                     */
                    _bloodMaterial(value_hurt, value_die) {
                        let content = value_hurt;
                        if (value_die !== value_hurt && value_die !== "") {
                            content += ` ${value_die}`;
                        }
                        this.#loadTr("bloodMaterial", content);
                    }
                    /**
                     * 加载自定义面板属性 内容自定义
                     * @param {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"maxHp"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"} type
                     * @param {Array<Node>} value
                     */
                    _custom(type, value) {
                        const content = document.createDocumentFragment();
                        content.append(...value);
                        this.#loadTr(type, content);
                    }
                    /**
                     * 加载无需特殊处理的面板属性
                     * @param {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"maxHp"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"} type
                     * @param {Number} value
                     * @param {Boolean} needSign
                     */
                    _default(type, value, needSign = false) {
                        let content;
                        if (needSign) content = `${aps(value)}`;
                        else content = `${value}`;
                        this.#loadTr(type, content);
                    }
                };

                return target => new attrLoader(target);
            })();

            /** @type {DisplayMode} */ #displayMode = undefined;
            constructor(display) {
                super();
                if (display) this.#displayMode = display;
            }

            toString() {
                return "[Obejct HTMLNoitaElement]";
            }
        }
    );
})();
