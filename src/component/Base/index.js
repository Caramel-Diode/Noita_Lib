const Base = (() => {
    embed(`#db.js`);
    const styleSheet_base = gss(embed(`#base.css`));

    /** @type {Listeners} */ const panelTitleSwitch = (() => {
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
            click: event => main(event),
            /**
             * 用于键盘触发 `Enter`
             * @param {KeyboardEvent} event
             */
            keydown: event => {
                if (event.key === "Enter") main(event);
                else if (event.key === "Escape") event.target.blur();
            }
        };
    })();

    /**
     * @param {DisplayMode} display 展示模式
     */
    const HTMLNoitaElement = class extends HTMLElement {
        static observedAttributes = Object.freeze(["display"]);

        static {
            //初始化原型上的属性 但是这样似乎无法让vscode进行智能补全
            /** @type {PublicStyleSheets} */
            this.prototype.publicStyleSheets = Object.freeze({
                base: [styleSheet_base],
                icon: [styleSheet_base, gss(embed(`#icon.css`))],
                panel: [styleSheet_base, gss(embed(`#panel.css`))]
            });
        }

        /**
         * 创建面板 **`<h1>`** 标题
         * @param {String} id
         * @param {String} name
         * @returns {HTMLHeadingElement} `<h1>` 元素
         */
        createPanelH1(id, name) {
            const h1 = document.createElement("h1");
            h1.setAttribute("switch.id", id);
            h1.setAttribute("switch.name", name);
            h1.innerText = name;
            util.addFeatureTo(h1, panelTitleSwitch);
            return h1;
        }

        /** 面板属性加载器 */
        static panelAttrLoader = (() => {
            const fts = util.frameToSecond;
            const aps = util.addPlusSign;
            const ged = util.getExactDegree;
            const addFeatureTo = util.addFeatureTo;
            /** @type {Listeners} */
            const panelInfoSwitch = (() => {
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
                    click: event => main(event),
                    keydown: event => {
                        if (event.key === "Enter") main(event);
                        else if (event.key === "Escape") event.target.blur();
                    }
                };
            })();
            /** @type {Listeners} */
            const unitConvert = (() => {
                /**
                 * 单位转换 `秒 ⇌ 帧`
                 * @param {HTMLElement} element
                 */
                const main = element => {
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
                    click: event => main(event.target),
                    keydown: event => {
                        if (event.key === "Enter") main(event.target);
                        else if (event.key === "Escape") event.target.blur();
                    }
                };
            })();

            const showOrHideunlockFlag = (() => {
                /**
                 * @param {HTMLElement} element
                 */
                const main = element => {
                    if (element instanceof HTMLTableCellElement) element = element.parentElement; //目标元素为<tr> 而不是<th>或<td>
                    if (element.getAttribute("display") === "false") {
                        element.innerHTML = "";
                        element.append(element.th_unlock, element.td_unlock);
                        element.setAttribute("display", "true");
                        element.title = "点击隐藏解锁条件";
                    } else {
                        element.innerHTML = "";
                        element.append(element.th_lock, element.td_lock);
                        element.setAttribute("display", "false");
                        element.title = "点击查看解锁条件";
                    }
                };
                return {
                    click: event => main(event.target),
                    keydown: event => {
                        if (event.key === "Enter") main(event.target);
                        else if (event.key === "Escape") event.target.blur();
                    }
                };
            })();
            return class {
                /** @type {Node} 目标容器 */ #container;
                constructor(target) {
                    this.#container = target;
                }
                /**
                 * 加载属性表行
                 * @param {PanelAttrIDEnum} type
                 * @param {String|Node|{second:Number,frame:Number}} content
                 */
                async #loadTr(type, content) {
                    const tr = document.createElement("tr");
                    const th = document.createElement("th");
                    const td = document.createElement("td");
                    let attrInfo = PanelAttrInfo.query(type);
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
                            td.setAttribute("display", "SECOND");
                            td.setAttribute("value.second", content.second);
                            td.setAttribute("value.frame", content.frame);
                            td.append(content.second);
                            addFeatureTo(td, unitConvert);
                        }
                    }
                    tr.append(th, td);
                    this.#container.append(tr);
                }
                /**
                 * 加载`施放延迟`|`充能时间`面板属性
                 * @param {"fireRateWait"|"lifetime"} type CD类型
                 * @param {NumRangeOrConstant} value
                 * @param {Boolean} [needSign]
                 */
                castCD(type, value, needSign = false) {
                    let s, f;
                    if (typeof value === "number") {
                        s = fts(value);
                        f = value;
                        if (needSign) {
                            s = aps(s);
                            f = aps(f);
                        }
                        s = `${s}s`;
                        f = `${f}f`;
                    } else if (typeof value === "object") {
                        if (value.min === -Infinity) {
                            if (needSign) {
                                s = `≤ ${aps(fts(value.max))}s`;
                                f = `≤ ${aps(value.max)}f`;
                            } else {
                                s = `≤ ${fts(value.max)}s`;
                                f = `≤ ${value.max}f`;
                            }
                        } else if (value.max === Infinity) {
                            if (needSign) {
                                s = `≥ ${aps(fts(value.min))}s`;
                                f = `≥ ${aps(value.min)}f`;
                            } else {
                                s = `≥ ${fts(value.min)}s`;
                                f = `≥ ${value.min}f`;
                            }
                        } else if (needSign) {
                            s = `${aps(fts(value.min))}s ~ ${aps(fts(value.max))}s`;
                            f = `${aps(value.min)}f ~ ${aps(value.max)}f`;
                        } else {
                            convertData.second = `${fts(value.min)}s ~ ${fts(value.max)}s`;
                            f = `${value.min}f ~ ${value.max}f`;
                        }
                    }
                    this.#loadTr(type, { second: s, frame: f });
                }
                /**
                 * 加载`存在时间`面板属性
                 * @param {Number|{base:Number,fluctuation:Number}} value
                 * @param {Boolean} [needSign]
                 */
                lifetime(value, needSign = false) {
                    let s, f;
                    if (typeof value === "number") {
                        if (needSign) {
                            s = `${aps(fts(value))}s`;
                            f = `${aps(value)}f`;
                        } else {
                            s = `${fts(value)}s`;
                            f = `${value}f`;
                        }
                    } else if (value.fluctuation === 0) {
                        if (needSign) {
                            s = `${aps(fts(value.base))}s`;
                            f = `${aps(value.base)}f`;
                        } else {
                            s = `${fts(value.base)}s`;
                            f = `${value.base}f`;
                        }
                        if (value.base === -1) {
                            s = `永久`;
                            f = `-1`;
                        }
                    } else {
                        const min = value.base - value.fluctuation;
                        const max = value.base + value.fluctuation;
                        if (needSign) {
                            s = `${aps(fts(min))}s ~ ${aps(fts(max))}s`;
                            f = `${aps(min)}f ~ ${aps(max)}f`;
                        } else {
                            s = `${fts(min)}s ~ ${fts(max)}s`;
                            f = `${min}f ~ ${max}f`;
                        }
                    }
                    this.#loadTr("lifetime", { second: s, frame: f });
                }
                /**
                 * 加载`法力恢复速度`面板属性
                 * @param {NumRangeOrConstant} value
                 */
                manaChargeSpeed(value) {
                    let s, f;
                    if (typeof value === "number") {
                        s = `${value}/s`;
                        f = `${fts(value)}/f`;
                    } else {
                        if (value.min === -Infinity) {
                            s = `≤ ${fts(value.max)}/s`;
                            f = `≤ ${value.max}/f`;
                        } else if (value.max === Infinity) {
                            s = `≥ ${fts(value.min)}/s`;
                            f = `≥ ${value.min}/f`;
                        } else {
                            s = `${fts(value.min)}/s ~ ${fts(value.max)}/s`;
                            f = `${value.min}/f ~ ${value.max}/f`;
                        }
                    }
                    this.#loadTr("manaChargeSpeed", { second: s, frame: f });
                }
                /**
                 * 加载`散射角度`面板属性
                 * @param {NumRangeOrConstant} value
                 * @param {Boolean} [needSign]
                 */
                spreadDegrees(value, needSign = false) {
                    let content;
                    if (typeof value === "number") content = ged(value, needSign);
                    else if (typeof value === "object") {
                        if (value.min === -Infinity) content = `≤ ${ged(value.max, needSign)}`;
                        else if (value.max === Infinity) content = `≥ ${ged(value.min, needSign)}`;
                        else content = `${ged(value.min, needSign)} ~ ${ged(value.max, needSign)}`;
                    }
                    this.#loadTr("spreadDegrees", content);
                }
                /**
                 * 加载`投射物速度`|`投射物速度倍数`面板属性
                 * @param {"speed"|"speedMultiplier"} type
                 * @param {NumRangeOrConstant} value
                 * @param {Boolean} [needSign]
                 */
                speed(type, value, needSign = false) {
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
                damageCriticalChance(value) {
                    this.#loadTr("damageCriticalChance", `${aps(value)}%`);
                }
                /**
                 * 加载`最大使用次数`|`剩余使用次数`面板属性
                 * @param {"maxUse"|"remainingUse"} type
                 * @param {{max:Number,remaining:Number?,neverUnlimited:Boolean}} value
                 */
                timesUsed(type, value) {
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
                async draw(value = 1) {
                    /** @type {DocumentFragment|String} */
                    let content;
                    if (typeof value === "number") content = `${value}`; //法杖固定抽取数
                    else if (typeof value === "object") {
                        if (value.min !== undefined) content = `${value.min} ~ ${value.max}`; //法杖不定数量抽取
                        else {
                            //法术多类型抽取
                            const ul = document.createElement("ul");
                            // 普通抽取
                            if (value.common) {
                                const li = document.createElement("li");
                                li.append(await PanelAttrInfo.query("draw_common").getIcon(), value.common);
                                ul.append(li);
                            }
                            // 碰撞抽取
                            if (value.hit) {
                                const li = document.createElement("li");
                                li.append(await PanelAttrInfo.query("draw_hit").getIcon(), value.hit);
                                li.title = "碰撞触发抽取";
                                ul.append(li);
                            }
                            // 定时抽取
                            if (value.timer.count) {
                                const li = document.createElement("li");
                                li.append(await PanelAttrInfo.query("draw_timer").getIcon(), `${value.timer.count} (${value.timer.delay}f)`);
                                li.title = `定时触发抽取\n延迟:${value.timer.delay}f`;
                                ul.append(li);
                            }
                            // 失效触发
                            if (value.death) {
                                const li = document.createElement("li");
                                li.append(await PanelAttrInfo.query("draw_death").getIcon(), value.death);
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
                 * @param {NumRangeOrConstant} value
                 */
                manaMaxOrCapacity(type, value) {
                    let content;
                    if (typeof value === "object") {
                        if (value.min === -Infinity) content = `≤ ${value.max}`;
                        else if (value.max === Infinity) content = `≥ ${value.min}`;
                        else content = `${value.min} ~ ${value.max}`;
                    } else content = `${value}`;
                    this.#loadTr(type, content);
                }
                /**
                 * 加载`伤害`|`承伤`面板属性
                 * @param {PanelAttrID_damageEnum} type
                 * @param {Number} value
                 * @param {Boolean} [needSign]
                 */
                damage(type, value, needSign = false) {
                    let content;
                    if (needSign) content = `${aps(value)}`; // 伤害修正
                    else content = `${value}`; //投射物本体伤害/承伤系数
                    this.#loadTr(type, content);
                }
                /**
                 * 加载`生成锁 ⇌ 解锁条件`
                 * @param {String} flag 解锁条件
                 */
                async unlock(flag) {
                    const tr = document.createElement("tr");
                    const attrInfo_lock = PanelAttrInfo.query("lock");
                    const attrInfo_unlock = PanelAttrInfo.query("unlock");

                    tr.th_lock = document.createElement("th");
                    tr.th_lock.append(await attrInfo_lock.getIcon(), attrInfo_lock.name);
                    tr.td_lock = document.createElement("td");
                    tr.td_lock.innerText = " * ".repeat(flag.length);

                    tr.th_unlock = document.createElement("th");
                    tr.th_unlock.append(await attrInfo_unlock.getIcon(), attrInfo_unlock.name);
                    tr.td_unlock = document.createElement("td");
                    tr.td_unlock.innerText = flag;

                    tr.setAttribute("display", "false");
                    addFeatureTo(tr, showOrHideunlockFlag);
                    tr.append(tr.th_lock, tr.td_lock);
                    tr.title = "点击查看解锁条件";
                    this.#container.append(tr);
                }
                /**
                 * 加载`提供投射物`|`使用投射物`属性
                 * @param {"projectilesProvided"|"projectilesUsed"} type
                 * @param {Array<Node>} value
                 */
                offerEntity(type, value) {
                    const ul = document.createElement("ul");
                    for (let i = 0; i < value.length; i++) {
                        const li = value[i];
                        addFeatureTo(li, panelInfoSwitch);
                        li.setAttribute("roles", "tab");
                        ul.append(li);
                    }
                    value[0].click(); //提供的数据会全部展示 此处点击以实现仅显示首个投射物信息
                    ul.className = "entities-tabpanel";
                    ul.setAttribute("roles", "tablist"); // 无障碍标注
                    this.#loadTr(type, ul);
                }
                /**
                 * 加载`血液材料(尸体材料)`属性
                 * @param {String} value_hurt
                 * @param {String} value_die
                 */
                bloodMaterial(value_hurt, value_die) {
                    let content = value_hurt;
                    if (value_die !== value_hurt && value_die !== "") content += ` ${value_die}`;
                    this.#loadTr("bloodMaterial", content);
                }
                /**
                 * 加载自定义面板属性 内容自定义
                 * @param {PanelAttrIDEnum} type
                 * @param {Array<Node>} value
                 */
                custom(type, value) {
                    const content = document.createDocumentFragment();
                    content.append(...value);
                    this.#loadTr(type, content);
                }
                /**
                 * 加载面板属性(无特殊处理)
                 * @param {PanelAttrIDEnum} type
                 * @param {Number|String} value
                 * @param {Boolean} needSign
                 */
                default(type, value, needSign = false) {
                    let content;
                    if (needSign) content = `${aps(value)}`;
                    else content = `${value}`;
                    this.#loadTr(type, content);
                }
            };
        })();

        /** @type {DisplayMode} */ #displayMode = undefined;
        constructor(display) {
            super();
            if (display) this.#displayMode = display;
        }

        toString() {
            return "[Obejct HTMLNoitaElement]";
        }
    };
    return Object.freeze(HTMLNoitaElement);
})();
