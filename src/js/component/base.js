component.base = class extends HTMLElement {
    static observedAttributes = ["display"];

    static {
        /** @type {CSSStyleSheet} */
        const styleSheet_base = gss(`"BaseElement_base.css"`);
        this.prototype.publicStyleSheets = {
            icon: [styleSheet_base, gss(`"BaseElement_icon.css"`)],
            panel: [styleSheet_base, gss(`"BaseElement_panel.css"`)]
        };
    };

    static panelInfoSwitchFn = (() => {
        const main = event => {
            const forceToHidden = event.target.classList.contains("selected");// 再次点击已选中的target时强制隐藏
            const relatedSectionElements = event.target.relatedSectionElements;
            const relatedDataElements = event.target.relatedDataElements;
            for (let element of relatedSectionElements) {
                element.hidden = element.getAttribute("related-id") !== event.target.value || forceToHidden;
            }
            for (let element of relatedDataElements) {
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
     * 加载面板属性
     * @param {String} type 属性类型
     * @param {any} value 属性值
     * @param {HTMLTableSectionElement} container 载入容器
     * @param {Boolean} [needSign=false] 需要符号
     */
    static loadPanelAttr = (() => {
        /** @borrows utilities.frameToSecond as fts */
        const fts = utilities.frameToSecond;
        /** @borrows utilities.addPlusSign as aps */
        const aps = utilities.addPlusSign;
        /** @borrows utilities.getExactDegree as ged */
        const ged = utilities.getExactDegree;
        class panelAttrInfo {
            /** @type {Number} */
            iconIndex;
            /** @type {String} */
            name;
            /**
             * 属性信息构造器
             * @param {Number} iconIndex 图标索引
             * @param {String} name 属性名称
             */
            constructor(iconIndex, name) {
                this.iconIndex = iconIndex;
                this.name = name;
            };
            static datas = {
                type: new this(1, "法术类型"),
                shuffle: new this(2, "乱序"),
                draw: new this(3, "抽取数"),
                capacity: new this(4, "容量"),
                staticSpells: new this(5, "始终施放"),
                manaMax: new this(6, "法力上限"),
                manaChargeSpeed: new this(7, "法力恢复速度"),
                manaDrain: new this(8, "法力消耗"),
                maxUse: new this(9, "最大使用次数"),
                fireRateWait: new this(10, "施放延迟"),
                reloadTime: new this(11, "充能时间"),
                spreadDegrees: new this(12, "散射"),
                projectileDamage: new this(13, "投射物伤害"),
                fireDamage: new this(14, "火焰伤害"),
                iceDamage: new this(15, "冰冻伤害"),
                explosionDamage: new this(16, "爆炸伤害"),
                sliceDamage: new this(17, "切割伤害"),
                drillDamage: new this(18, "穿凿伤害"),
                electricityDamage: new this(19, "雷电伤害"),
                healingDamage: new this(20, "治疗伤害"),
                meleeDamage: new this(21, "近战伤害"),
                curseDamage: new this(22, "诅咒伤害"),
                holyDamage: new this(23, "神圣伤害"),
                overeatingDamage: new this(24, "吃撑伤害"),
                physicsHitDamage: new this(25, "物理伤害"),
                poisonDamage: new this(26, "剧毒伤害"),
                radioactiveDamage: new this(27, "辐射伤害"),
                damageCriticalChance: new this(28, "暴击率"),
                speed: new this(29, "投射速度"),
                speedMultiplier: new this(29, "投射速度倍数"),
                explosionRadius: new this(30, "爆炸半径"),
                bounces: new this(31, "弹跳次数"),
                knockbackForce: new this(32, "击退"),
                lifetime: new this(33, "存在时间"),
                projectilesProvided: new this(34, "提供投射物"),
                projectilesUsed: new this(34, "使用投射物"),
                // lifetime:new this( 35, "被动效果"),
                // lifetime:new this( 36, "友军伤害"),
                // lifetime:new this( 37, "生命值"),
                // lifetime:new this( 38, "免疫能力"),
                // lifetime:new this( 39, "承伤系数"),
                recoilKnockback: new this(40, "后座力"),
                draw_common: new this(41, "抽取|普通"),
                draw_hit: new this(42, "抽取|碰撞触发"),
                draw_timer: new this(43, "抽取|定时触发"),
                draw_death: new this(44, "抽取|失效触发"),
                // neverUnlimited: new this(45, "?"),
                infinite: new this(46, "无限"),
            };
        };

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

        const getPanelAttrIcon = async info => {
            const canvas = document.createElement("canvas");
            canvas.setAttribute("aria-label", `面板属性图标:${info.name}`);// 无障碍标注
            canvas.title = info.name;
            canvas.width = 7;
            canvas.height = 7;
            canvas.getContext("2d").drawImage(await DB.base.panelAttrIcons, (info.iconIndex - 1) * 7, 0, 7, 7, 0, 0, 7, 7);
            return canvas;
        };

        /**
        * @param {String} type 属性类型
        * @param {String|Number|{min:Number|undefined,max:Number|undefined,base:Number|undefined,fluctuation:Number|undefined}} value 属性数据
        * @param {Boolean} [needSign=false] 是否需要前缀符号
        */
        const main = async (type, value, container, needSign = false) => {
            const tr = document.createElement("tr");
            //#region <th>生成
            const th = document.createElement("th");
            /** @type {panelAttrInfo} */
            let attrInfo = panelAttrInfo.datas[type];
            th.append(await getPanelAttrIcon(attrInfo), attrInfo.name);
            //#endregion

            //#region <td>生成
            const td = document.createElement("td");
            let displayValue = value;
            // 时间类型判断 需要单位转换功能
            if (type === "fireRateWait" || type === "reloadTime" || type === "lifetime") {
                let valueSecond;
                let valueFrame;
                let permanentFlag = false;
                if (type === "lifetime") {
                    if(typeof value === "number") {
                        if(needSign) {
                            valueSecond = `${aps(fts(value))}s`;
                            valueFrame = `${aps(value)}f`;
                        } else {
                            valueSecond = `${fts(value)}s`;
                            valueFrame = `${value}f`;
                        }
                    } else if (value.fluctuation === 0) {
                        if (needSign) {
                            valueSecond = `${aps(fts(value.base))}s`;
                            valueFrame = `${aps(value.base)}f`;
                        } else {
                            valueSecond = `${fts(value.base)}s`;
                            valueFrame = `${value.base}f`;
                        }
                        if (value.base === -1) {
                            valueSecond = `永久`;
                            valueFrame = `-1`;
                        }
                    } else {
                        const min = value.base - value.fluctuation;
                        const max = value.base + value.fluctuation;
                        if (needSign) {
                            valueSecond = `${aps(fts(min))}s ~ ${aps(fts(max))}s`;
                            valueFrame = `${aps(min)}f ~ ${aps(max)}f`;
                        } else {
                            valueSecond = `${fts(min)}s ~ ${fts(max)}s`;
                            valueFrame = `${min}f ~ ${max}f`;
                        }
                    }
                } else {
                    if (typeof value === "number") {
                        valueSecond = fts(value);
                        valueFrame = value;
                        if (needSign) {
                            valueSecond = aps(valueSecond);
                            valueFrame = aps(valueFrame);
                        }
                        valueSecond = `${valueSecond}s`;
                        valueFrame = `${valueFrame}f`;
                    } else if (typeof value === "object") {
                        if (value.min === -Infinity) {
                            if (needSign) {
                                valueSecond = `≤ ${aps(fts(value.max))}s`;
                                valueFrame = `≤ ${aps(value.max)}f`;
                            } else {
                                valueSecond = `≤ ${fts(value.max)}s`;
                                valueFrame = `≤ ${value.max}f`;
                            }
                        } else if (value.max === Infinity) {
                            if (needSign) {
                                valueSecond = `≥ ${aps(fts(value.min))}s`;
                                valueFrame = `≥ ${aps(value.min)}f`;
                            } else {
                                valueSecond = `≥ ${fts(value.min)}s`;
                                valueFrame = `≥ ${value.min}f`;
                            }
                        } else if (needSign) {
                            valueSecond = `${aps(fts(value.min))}s ~ ${aps(fts(value.max))}s`;
                            valueFrame = `${aps(value.min)}f ~ ${aps(value.max)}f`;
                        } else {
                            valueSecond = `${fts(value.min)}s ~ ${fts(value.max)}s`;
                            valueFrame = `${value.min}f ~ ${value.max}f`;
                        }
                    }
                }

                td.setAttribute("tabindex", "0");// 无障碍 可被键盘聚焦
                td.setAttribute("value.second", valueSecond);
                td.setAttribute("value.frame", valueFrame);
                td.setAttribute("display", "SECOND");
                displayValue = valueSecond;//默认展示以秒作为单位的值
                td.addEventListener("click", unitConvert.byMouse);
                td.addEventListener("keydown", unitConvert.byKeyboard);
            }
            else if (type === "manaChargeSpeed") {
                let valueSecond;
                let valueFrame;
                if (typeof value === "number") {
                    valueSecond = `${value}/s`;
                    valueFrame = `${fts(value)}/f`;
                } else {
                    if (value.min === -Infinity) {
                        valueSecond = `≤ ${fts(value.max)}/s`;
                        valueFrame = `≤ ${value.max}/f`;
                    } else if (value.max === Infinity) {
                        valueSecond = `≥ ${fts(value.min)}/s`;
                        valueFrame = `≥ ${value.min}/f`;
                    } else {
                        valueSecond = `${fts(value.min)}/s ~ ${fts(value.max)}/s`;
                        valueFrame = `${value.min}/f ~ ${value.max}/f`;
                    }
                }
                td.setAttribute("tabindex", "0");// 无障碍 可被键盘聚焦
                td.setAttribute("value.second", valueSecond);
                td.setAttribute("value.frame", valueFrame);
                td.setAttribute("display", "SECOND");
                displayValue = valueSecond;//默认展示以秒作为单位的值
                td.addEventListener("click", unitConvert.byMouse);
                td.addEventListener("keydown", unitConvert.byKeyboard);
            }
            else if (type === "spreadDegrees") {// 角度类型判断
                if (typeof value === "number") {
                    displayValue = ged(value, needSign);
                } else if (typeof value === "object") {
                    if (value.min === -Infinity) {
                        displayValue = `≤ ${ged(value.max, needSign)}`;
                    } else if (value.max === Infinity) {
                        displayValue = `≥ ${ged(value.min, needSign)}`;
                    } else {
                        displayValue = `${ged(value.min, needSign)} ~ ${ged(value.max, needSign)}`;
                    }
                }
            }
            else if (type === "speed" || type === "speedMultiplier") {// 速度类型判断 为修正属性时需要前缀符号× 为投射物属性时可能为范围值
                if (typeof value === "object") {
                    if (value.min === -Infinity) displayValue = `≤ ${value.max}`;
                    else if (value.max === Infinity) displayValue = `≥ ${value.min}`;
                    else if (value.min !== value.max) displayValue = `${value.min} ~ ${value.max}`;
                    else displayValue = value.min;
                }
                if (needSign) displayValue = `\u00d7${displayValue}`;
            }
            else if (type === "damageCriticalChance") {// 暴击率类型判断 需要后置符号% 强制前缀符号
                displayValue = `${aps(value)}%`;
            }
            else if (type === "maxUse") {
                /** @type {DocumentFragment} */
                displayValue = document.createDocumentFragment();
                displayValue.append(value.times);
                if (value.neverUnlimited) {
                    td.classList.add("never-unlimited");
                    td.title = "不可无限化";
                } else {
                    td.classList.add("unlimited");
                    td.title = "可无限化";
                }
            }
            else if (type === "draw") {
                if (typeof value === "number") {
                    displayValue = value;
                } else if (typeof value === "object") {
                    if (value.min !== undefined) {//法杖不定数量抽取
                        displayValue = `${value.min} ~ ${value.max}`;
                    } else { //法术多类型抽取
                        displayValue = document.createDocumentFragment();
                        if (value.common) displayValue.append(await getPanelAttrIcon(panelAttrInfo.datas.draw_common), value.common);
                        if (value.hit) displayValue.append(await getPanelAttrIcon(panelAttrInfo.datas.draw_hit), value.hit);
                        if (value.timer.count) {
                            displayValue.append(await getPanelAttrIcon(panelAttrInfo.datas.draw_timer), value.timer.count);
                            if (value.timer.time) {
                                displayValue.append("(", value.timer.time, "f)");
                                td.title = `定时:${value.timer.time}f`;
                            }
                        }
                        if (value.death) displayValue.append(await getPanelAttrIcon(panelAttrInfo.datas.draw_death), value.death);
                    }

                }
            }
            else if (type === "manaMax" || type === "capacity") {
                if (typeof value === "object") {
                    if (value.min === -Infinity) displayValue = `≤ ${value.max}`;
                    else if (value.max === Infinity) displayValue = `≥ ${value.min}`;
                    else displayValue = `${value.min} ~ ${value.max}`;
                }
            }
            else { //投射物本体伤害/伤害修正 等...
                if (typeof value !== "object") {
                    if (needSign) displayValue = `${aps(value)}`;
                } else {
                    if (needSign) console.warn("意外的数据类型!", value);
                    else if (value instanceof Array) { //传入数组时直接将数组内容添加到td中作为数据(一般情况下数组元素为Element)
                        displayValue = document.createDocumentFragment();
                        displayValue.append(...value);
                        td.setAttribute("roles", "tablist");// 无障碍标注
                    }
                }
            }
            td.append(displayValue);
            //#endregion
            tr.append(th, td);
            container.append(tr);
        };
        return main;
    })();

    /** @type {String} */
    #displayMode = undefined;
    constructor(display) {
        super();
        if (display) this.#displayMode = display;
    };

    toString() {
        return "[Obejct HTMLNoitaElement]";
    }
}