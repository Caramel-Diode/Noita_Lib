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
     */
    static loadPanelAttr = (() => {
        /** @borrows utilities.frameToSecond as fts */
        const fts = utilities.frameToSecond;
        /** @borrows utilities.addPlusSign as aps */
        const aps = utilities.addPlusSign;
        /** @borrows utilities.getExactDegree as ged */
        const ged = utilities.getExactDegree;
        const panelInfoSwitchFn = this.panelInfoSwitchFn;
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
            static datas = new Map([
                ["type", new this(1, "法术类型")],
                ["shuffle", new this(2, "乱序")],
                ["draw", new this(3, "抽取数")],
                ["capacity", new this(4, "容量")],
                ["staticSpells", new this(5, "始终施放")],
                ["manaMax", new this(6, "法力上限")],
                ["manaChargeSpeed", new this(7, "法力恢复速度")],
                ["manaDrain", new this(8, "法力消耗")],
                ["maxUse", new this(9, "最大使用次数")],
                ["remainingUse", new this(9, "剩余使用次数")],
                ["fireRateWait", new this(10, "施放延迟")],
                ["reloadTime", new this(11, "充能时间")],
                ["spreadDegrees", new this(12, "散射")],
                ["projectileDamage", new this(13, "投射物伤害")],
                ["projectileDamageMultiplier", new this(13, "投射物承伤")],
                ["fireDamage", new this(14, "火焰伤害")],
                ["fireDamageMultiplier", new this(14, "火焰承伤")],
                ["iceDamage", new this(15, "冰冻伤害")],
                ["iceDamageMultiplier", new this(15, "冰冻承伤")],
                ["explosionDamage", new this(16, "爆炸伤害")],
                ["explosionDamageMultiplier", new this(16, "爆炸承伤")],
                ["sliceDamage", new this(17, "切割伤害")],
                ["sliceDamageMultiplier", new this(17, "切割承伤")],
                ["drillDamage", new this(18, "穿凿伤害")],
                ["drillDamageMultiplier", new this(18, "穿凿承伤")],
                ["electricityDamage", new this(19, "雷电伤害")],
                ["electricityDamageMultiplier", new this(19, "雷电承伤")],
                ["healingDamage", new this(20, "治疗伤害")],
                ["healingDamageMultiplier", new this(20, "治疗承伤")],
                ["meleeDamage", new this(21, "近战伤害")],
                ["meleeDamageMultiplier", new this(21, "近战承伤")],
                ["curseDamage", new this(22, "诅咒伤害")],
                ["curseDamageMultiplier", new this(22, "诅咒承伤")],
                ["holyDamage", new this(23, "神圣伤害")],
                ["holyDamageMultiplier", new this(23, "神圣承伤")],
                ["overeatingDamage", new this(24, "吃撑伤害")],
                ["overeatingMultiplier", new this(24, "吃撑伤害")],
                ["physicsHitDamage", new this(25, "物理伤害")],
                ["physicsHitDamageMultiplier", new this(25, "物理承伤")],
                ["poisonDamage", new this(26, "剧毒伤害")],
                ["poisonDamageMultiplier", new this(26, "剧毒承伤")],
                ["radioactiveDamage", new this(27, "辐射伤害")],
                ["radioactiveDamageMultiplier", new this(27, "辐射承伤")],
                ["damageCriticalChance", new this(28, "暴击率")],
                ["speed", new this(29, "投射速度")],
                ["speedMultiplier", new this(29, "投射速度倍数")],
                ["explosionRadius", new this(30, "爆炸半径")],
                ["bounces", new this(31, "弹跳次数")],
                ["knockbackForce", new this(32, "击退")],
                ["lifetime", new this(33, "存在时间")],
                ["projectilesProvided", new this(34, "提供投射物")],
                ["projectilesUsed", new this(34, "使用投射物")],
                // ( 35, "被动效果"),
                // ( 36, "友军伤害"),
                ["maxHp", new this(37, "生命值")],
                // ( 38, "免疫能力"),
                // ( 39, "承伤系数"),
                ["recoilKnockback", new this(40, "后座力")],
                ["draw_common", new this(41, "抽取|普通")],
                ["draw_hit", new this(42, "抽取|碰撞触发")],
                ["draw_timer", new this(43, "抽取|定时触发")],
                ["draw_death", new this(44, "抽取|失效触发")],
                // neverUnlimited: new this(45, "?"),
                ["infinite", new this(46, "无限")],
                ["maxStack", new this(47, "堆叠极限")],
                ["maxInPool", new this(48, "池最大含量")],
            ]);
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

        /** @type {HTMLElement} */
        let container = undefined;
        /**
         * 加载面板属性表行
         * @param {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"maxHp"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"} type 面板信息
         * @param {String|Node|{second:String,frame:String}} content 内容值
         */
        const loadTr = async (type, content) => {
            const tr = document.createElement("tr");
            const th = document.createElement("th");
            const td = document.createElement("td");
            /** @type {panelAttrInfo} */
            let attrInfo = panelAttrInfo.datas.get(type);
            th.append(await getPanelAttrIcon(attrInfo), attrInfo.name);
            const contentType = typeof content;
            if (contentType === "string") {
                td.append(content);
            } else if (contentType === "object") {
                if (content instanceof Node) {// html节点 直接插入
                    td.append(content);
                } else {// 单位换算信息 默认显示`秒`
                    td.setAttribute("tabindex", "0");// 无障碍 可被键盘聚焦
                    td.addEventListener("click", unitConvert.byMouse);
                    td.addEventListener("keydown", unitConvert.byKeyboard);
                    td.setAttribute("display", "SECOND");
                    td.setAttribute("value.second", content.second);
                    td.setAttribute("value.frame", content.frame);
                    td.append(content.second);
                }
            }
            tr.append(th, td);
            container.append(tr);
        };

        return {
            /**
             * 设置目标容器
             * @param {HTMLElement} traget 目标容器
             */
            setContainer(traget) {
                container = traget;
            },
            /**
             * 加载`施放延迟`|`充能时间`面板属性
             * @param {"fireRateWait"|"lifetime"} type CD类型
             * @param {Number|{min:Number,max:Number}} value 
             * @param {Boolean} [needSign] 
             */
            async _castCD(type, value, needSign = false) {
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
                await loadTr(type, unitConvertData);
            },
            /**
             * 加载`存在时间`面板属性
             * @param {Number|{base:Number,fluctuation:Number}} value 
             * @param {Boolean} [needSign] 
             */
            async _lifetime(value, needSign = false) {
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
                await loadTr("lifetime", unitConvertData);
            },
            /**
             * 加载`法力恢复速度`面板属性
             * @param {Number|{min:Number,max:Number}} value 
             */
            async _manaChargeSpeed(value) {
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
                await loadTr("manaChargeSpeed", unitConvertData);
            },
            /**
             * 加载`散射角度`面板属性
             * @param {Number|{min:Number,max:Number}} value 
             * @param {Boolean} [needSign] 
             */
            async _spreadDegrees(value, needSign = false) {
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
                await loadTr("spreadDegrees", content);
            },
            /**
             * 加载`投射物速度`|`投射物速度倍数`面板属性
             * @param {"speed"|"speedMultiplier"} type 
             * @param {Number|{min:Number,max:Number}} value 
             * @param {Boolean} [needSign] 
             */
            async _speed(type, value, needSign = false) {
                let content;
                if (typeof value === "object") {
                    if (value.min === -Infinity) content = `≤ ${value.max}`;
                    else if (value.max === Infinity) content = `≥ ${value.min}`;
                    else if (value.min !== value.max) content = `${value.min} ~ ${value.max}`;
                    else content = `${value.min}`;
                }
                if (needSign) content = `× ${content}`;
                await loadTr(type, content);
            },
            /**
             * 加载`暴击率`面板属性
             * @param {Number} value 
             */
            async _damageCriticalChance(value) {
                await loadTr("damageCriticalChance", `${aps(value)}%`);
            },
            /**
             * 加载`最大使用次数`|`剩余使用次数`面板属性
             * @param {"maxUse"|"remainingUse"} type 
             * @param {{max:Number,remaining:Number?,neverUnlimited:Boolean}} value 
             */
            async _timesUsed(type, value) {
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
                await loadTr(type, content);
            },
            /**
             * 加载`抽取数`面板属性
             * @param {Number|{min:Number?,max:Number?,common:Number?,hit:Number?,timer:{count:Number,delay:Number}?,death:Number?}} [value] 
             */
            async _draw(value = 1) {
                /** @type {DocumentFragment|String} */
                let content;
                if (typeof value === "number") {
                    content = value;//法杖固定抽取数
                } else if (typeof value === "object") {
                    if (value.min !== undefined) {//法杖不定数量抽取
                        content = `${value.min} ~ ${value.max}`;
                    } else { //法术多类型抽取
                        const ul = document.createElement("ul");
                        if (value.common) { // 普通抽取
                            const li = document.createElement("li");
                            li.append(await getPanelAttrIcon(panelAttrInfo.datas.get("draw_common")), value.common);
                            ul.append(li);
                        }
                        if (value.hit) { // 碰撞抽取
                            const li = document.createElement("li");
                            li.append(await getPanelAttrIcon(panelAttrInfo.datas.get("draw_hit")), value.hit);
                            li.title = "碰撞触发抽取";
                            ul.append(li);
                        }
                        if (value.timer.count) { // 定时抽取
                            const li = document.createElement("li");
                            li.append(await getPanelAttrIcon(panelAttrInfo.datas.get("draw_timer")), `${value.timer.count} (${value.timer.delay}f)`);
                            li.title = `定时触发抽取\n延迟:${value.timer.delay}f`;
                            ul.append(li);
                        }
                        if (value.death) {
                            const li = document.createElement("li");
                            li.append(await getPanelAttrIcon(panelAttrInfo.datas.get("draw_death")), value.death);
                            li.title = "失效触发抽取";
                            ul.append(li);
                        }
                        content = ul;
                    }

                }
                await loadTr("draw", content);
            },
            /**
             * 加载`最大法力值`|`容量`面板属性
             * @param {"manaMax"|"capacity"} type 
             * @param {Number|{min:Number,max:Number}} value 
             */
            async _manaMaxOrCapacity(type, value) {
                let content;
                if (typeof value === "object") {
                    if (value.min === -Infinity) content = `≤ ${value.max}`;
                    else if (value.max === Infinity) content = `≥ ${value.min}`;
                    else content = `${value.min} ~ ${value.max}`;
                } else {
                    content = `${value}`;
                }
                await loadTr(type, content);
            },
            /**
             * 加载`伤害`|`承伤`面板属性
             * @param {"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"} type 
             * @param {Number|Array<Node>} value 
             * @param {Boolean} [needSign] 
             */
            async _damage(type, value, needSign = false) {
                let content;
                if (needSign) content = `${aps(value)}`;  // 伤害修正
                else content = `${value}`;//投射物本体伤害/承伤系数
                await loadTr(type, content);
            },
            /**
             * 加载`提供投射物`|`使用投射物`属性
             * @param {"projectilesProvided"|"projectilesUsed"} type 
             * @param {Array<Node>} value 
             */
            async _offerEntity(type, value) {
                const ul = document.createElement("ul");
                for (let i = 0; i < value.length; i++) {
                    const li = value[i];
                    li.setAttribute("tabindex", "0");// 无障碍 允许tab聚焦
                    li.setAttribute("roles", "tab");
                    li.addEventListener("click", panelInfoSwitchFn.byMouse);
                    li.addEventListener("keydown", panelInfoSwitchFn.byKeyboard);
                    ul.append(li);
                }
                value[0].click();//提供的数据会全部展示 此处点击以实现仅显示首个投射物信息
                ul.className = "entities-tabpanel";
                ul.setAttribute("roles", "tablist");// 无障碍标注
                await loadTr(type, ul);
            },
            /**
             * 加载自定义面板属性 内容自定义
             * @param {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"maxHp"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"} type 
             * @param {Array<Node>} value 
             */
            async _custom(type, value) {
                const content = document.createDocumentFragment();
                content.append(...value);
                await loadTr(type, content);
            },
            /**
             * 加载无需特殊处理的面板属性
             * @param {"type"|"shuffle"|"draw"|"capacity"|"staticSpells"|"manaMax"|"manaChargeSpeed"|"manaDrain"|"maxUse"|"remainingUse"|"fireRateWait"|"reloadTime"|"spreadDegrees"|"projectileDamage"|"projectileDamageMultiplier"|"fireDamage"|"fireDamageMultiplier"|"iceDamage"|"iceDamageMultiplier"|"explosionDamage"|"explosionDamageMultiplier"|"sliceDamage"|"sliceDamageMultiplier"|"drillDamage"|"drillDamageMultiplier"|"electricityDamage"|"electricityDamageMultiplier"|"healingDamage"|"healingDamageMultiplier"|"meleeDamage"|"meleeDamageMultiplier"|"curseDamage"|"curseDamageMultiplier"|"holyDamage"|"holyDamageMultiplier"|"overeatingDamage"|"overeatingMultiplier"|"physicsHitDamage"|"physicsHitDamageMultiplier"|"poisonDamage"|"poisonDamageMultiplier"|"radioactiveDamage"|"radioactiveDamageMultiplier"|"damageCriticalChance"|"speed"|"speedMultiplier"|"explosionRadius"|"bounces"|"knockbackForce"|"lifetime"|"projectilesProvided"|"projectilesUsed"|"maxHp"|"recoilKnockback"|"draw_common"|"draw_hit"|"draw_timer"|"draw_death"|"infinite"|"maxStack"|"maxInPool"} type 
             * @param {Number} value 
             * @param {Boolean} needSign 
             */
            async _default(type, value, needSign = false) {
                let content;
                if (needSign) content = `${aps(value)}`;
                else content = `${value}`;
                await loadTr(type, content);
            }
        };
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
};