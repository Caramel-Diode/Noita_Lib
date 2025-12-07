class Icon extends $icon(15, "魔杖") {
    /** @typedef {{index:Number,name:String,url:String,length:Number,frame:Number}} IconInfo */
    /** @type {Map<String,IconInfo>}  */
    static #dataMap = new Map();
    /** @type {Number} 辅助变量 用于记录法杖图标索引 */
    static #currentIndex = 1;
    #data;

    /** @type {Promise} */
    static urls;

    constructor(name) {
        super(); //后续需要改高度 魔杖高度不固定
        this.#data = Icon.#dataMap.get(name);
        if (this.#data) this.height = this.#data.length / this.#data.frame;
    }

    get name() {
        return this.#data?.name;
    }

    /** @type {Promise<String>} */
    get asyncUrl() {
        const { promise, resolve } = Promise.withResolvers();
        Icon.urls.then(urls => resolve(urls[this.#data?.index - 1]));
        return promise;
    }

    get index() {
        return this.#data?.index;
    }

    get length() {
        return this.#data?.length;
    }

    get frame() {
        return this.#data?.frame;
    }

    connectedCallback() {
        if (!this.#data) {
            this.#data = Icon.#dataMap.get(this.dataset.id);
            this.height = this.#data.length / this.#data.frame;
        }
        if (this.#data.frame > 1) {
            this.style.setProperty("--f", this.#data.frame - 1); // 这里应该减1
            this.style.objectPosition = "center calc(var(--p,0)/var(--f,1)*100%)";
            this.style.objectFit = "cover";
            this.style.transition = "unset";
            this.#play();
        }
        this.alt = this.name;
        this.src = this.asyncUrl;
    }

    #play() {
        const { frame } = this.#data;
        let interval = 0;
        const fn = () => {
            if (this.isConnected) {
                interval++;
                if (interval % 2 === 0) {
                    const p = Number(this.style.getPropertyValue("--p"));
                    if (p < frame - 1) /*  这里也应该减一 */ this.style.setProperty("--p", p + 1);
                    else this.style.setProperty("--p", 0);
                }
                requestAnimationFrame(fn);
            }
        };
        fn();
    }

    /**
     * 创建图标数据缓存
     * @param {Number} length 长度
     * @param {String} [name] 名称  自动生成`#index`格式名称
     * @param {Number} [frame] 动画帧数 默认1
     */
    static cache(name = "#" + this.#currentIndex, length, frame = 1) {
        this.#dataMap.set(name, { index: this.#currentIndex, name, length, frame });
        this.#currentIndex++;
        return name;
    }

    static async init() {
        const { promise, resolve } = Promise.withResolvers();
        this.urls = promise;
        if (await SpriteSpliter.hasCache) return resolve((await SpriteSpliter.get("Noita:WandIcons")).map(URL.createObjectURL));

        const values = [...this.#dataMap.values()];
        const workerFn = async () => {
            addEventListener("message", async ({ data: buffer }) => {
                const lengths = new Uint8Array(buffer);
                const amount = lengths.length;
                /** @type {Array<Promise<Blob>>} */
                const blobs = new Array(amount);
                const bitmap = await createImageBitmap(await (await fetch(embed(`#icon.png`))).blob());
                const deg = -Math.PI / 2;
                /** @type {ImageEncodeOptions} */
                const imageEncodeOptions = { type: "image/webp", quality: 1 };
                for (let i = 0, origin = 0; i < amount; i++) {
                    const length = lengths[i];
                    const canvas = new OffscreenCanvas(15, length);
                    const ctx = canvas.getContext("2d");
                    ctx.rotate(-Math.PI / 2);
                    ctx.drawImage(bitmap, origin, 0, length, 15, -length, 0, length, 15);
                    blobs[i] = canvas.convertToBlob(imageEncodeOptions);
                    origin += length;
                }
                const reader = new FileReaderSync();
                postMessage((await Promise.all(blobs)).map(blob => reader.readAsDataURL(blob)));
                bitmap.close();
                close();
            });
        };
        const lengths = Uint8Array.from([...this.#dataMap.values()].map(e => e.length));
        const { buffer } = lengths;

        resolve(await new SpriteSpliter("WandIcons", workerFn, [buffer, [buffer]]).results);
    }
}

Icon.define("-wand");

/** @typedef {import("TYPE").WandData} WandData */
/** @typedef {import("TYPE").WandData.IconInfo} WandData.IconInfo */
/** @typedef {import("TYPE").WandData.MatchData} WandData.MatchData */

/** 法杖数据 */
class WandData {
    static errorSymbol = Symbol("error");
    //prettier-ignore
    static { delete this.prototype.constructor; } // 禁止从实例访问构造器
    /** 法杖匹配数据 */
    static MatchData = class MatchData {
        //prettier-ignore
        static { delete this.prototype.constructor; } // 禁止从实例访问构造器
        /** @type {Array<WandData.MatchData>} */ static #dataList = [];

        /** 查找图标要使用的名称 */
        #name;
        constructor(data) {
            this.#name = Icon.cache(void 0, data[0]);
            [
                ,
                //=====================[0] 宽度
                this.capacity, //======[1] 容量
                this.draw, //==========[2] 抽取数
                this.fireRateWait, //==[3] 施放延迟
                this.reloadTime, //====[4] 充能时间
                ,
                //=====================[5] 乱序
                this.spreadDegrees //==[6] 散射
            ] = data;

            /** @type {Boolean} 乱序 */
            this.shuffle = data[5] === 1;
        }

        get icon() {
            return new Icon(this.#name);
        }

        get name() {
            return this.#name;
        }

        static init() {
            this.#dataList = [...embed(`#template.match.data.js`).values().chunks(7)].map(e => freeze(new this(e)));
        }
        /** 通过属性获取部分属性 */
        static getInfo = (() => {
            /**
             * 范围值取中位数
             * @param {RangeValue|Number} value
             * @returns {Number}
             */
            const median = value => (typeof value === "number" ? value : value.median);
            const { clamp, random } = _Math;

            /**
             * @param {import("TYPE").WandData} data
             * @returns {import("TYPE").WandData.MatchData}
             */
            return data => {
                /* prettier-ignore */
                let /** @type {WandData.MatchData} */ result, bestScore = 1000;
                /**
                 * ### 参考实现: [gun_procedural.lua](data/scripts/gun/procedural/gun_procedural.lua)`:L584-L589`
                 * ```lua
                 * gun_in_wand_space.fire_rate_wait = clamp(((gun["fire_rate_wait"] + 5) / 7)-1, 0, 4)
                 * gun_in_wand_space.actions_per_round = clamp(gun["actions_per_round"]-1,0,2)
                 * gun_in_wand_space.shuffle_deck_when_empty = clamp(gun["shuffle_deck_when_empty"], 0, 1)
                 * gun_in_wand_space.deck_capacity = clamp( (gun["deck_capacity"]-3)/3, 0, 7 ) -- TODO
                 * gun_in_wand_space.spread_degrees = clamp( ((gun["spread_degrees"] + 5 ) / 5 ) - 1, 0, 2 )
                 * gun_in_wand_space.reload_time = clamp( ((gun["reload_time"]+5)/25)-1, 0, 2 )
                 * ```
                 */
                const space = {
                    fireRateWait: clamp((data.fireRateWait + 5) / 7 - 1, 0, 4),
                    draw: clamp(data.draw - 1, 0, 2),
                    shuffle: data.shuffle,
                    capacity: clamp(data.capacity / 3 - 1, 0, 7),
                    spreadDegrees: clamp(data.spreadDegrees / 5, 0, 2),
                    reloadTime: clamp(data.reloadTime / 25 + 0.8, 0, 2)
                };

                const macthDatas = this.#dataList;
                for (let i = 0; i < macthDatas.length; i++) {
                    const data = macthDatas[i];
                    /* prettier-ignore */
                    /**
                     * ### 参考实现: [gun_procedural.lua](data/scripts/gun/procedural/gun_procedural.lua)`:L561-L568`
                     * ```lua
                     * score = score + ( math.abs( gun.fire_rate_wait - wand.fire_rate_wait ) * 2 )
                     * score = score + ( math.abs( gun.actions_per_round - wand.actions_per_round ) * 20 )
                     * score = score + ( math.abs( gun.shuffle_deck_when_empty - wand.shuffle_deck_when_empty ) * 30 )
                     * score = score + ( math.abs( gun.deck_capacity - wand.deck_capacity ) * 5 )
                     * score = score + math.abs( gun.spread_degrees - wand.spread_degrees )
                     * score = score + math.abs( gun.reload_time - wand.reload_time )
                     * ```
                     */
                    const score = 
                        Math.abs(space.fireRateWait - data.fireRateWait) * 2 +
                        Math.abs(space.draw - data.draw) * 20 +
                        Math.abs(space.shuffle - data.shuffle) * 30 +
                        Math.abs(space.capacity - data.capacity) * 5 +
                        Math.abs(space.spreadDegrees - data.spreadDegrees) +
                        Math.abs(space.reloadTime - data.reloadTime);
                    if (score > bestScore) continue;
                    bestScore = score;
                    result = data;
                    if (score === 0 && random(100) < 33) break;
                }
                return result;
            };
        })();
    };

    /** 法杖预设模板 */
    static PresetTemplate = class PresetTemplate {
        //prettier-ignore
        static { delete this.prototype.constructor; } // 禁止从实例访问构造器
        static generateDataByLevel = (() => {
            const { random, clamp, floor, round } = _Math;
            /** @param {number} level */
            const defaultCost = level => {
                if (level > 10) level = 10;
                let cost = level * 20;
                cost += random(-3, 3);
                if (level === 1 && random(0, 100) < 50) cost += 5;
                return cost;
            };

            /** @param {Array} list  */
            const shuffleList = list => {
                let j;
                for (let i = list.length - 1; i >= 2; i--) {
                    j = random(1, i);
                    [list[i], list[j]] = [list[j], list[i]];
                }
                return list;
            };

            /** @extends {Array<typeof ProbList.Item.prototype>} */
            class ProbList extends Array {
                constructor() {
                    super();
                    this.prob = 0;
                }
                static Item = class Item {
                    constructor([prob, min, max, mean, sharpness]) {
                        this.prob = prob;
                        this.min = min;
                        this.max = max;
                        this.mean = mean;
                        this.sharpness = sharpness;
                    }

                    /** @returns {number} */
                    randomDistribution() {
                        const { min, max, mean, sharpness } = this;
                        return CPP.RandomDistribution(min, max, mean, sharpness);
                    }
                };
                /**
                 * @param  {...[number,number,number,number,number]} items
                 * @returns
                 */
                static create(...items) {
                    const o = new this();
                    for (const data of items) {
                        const item = new this.Item(data);
                        o.push(item);
                        o.prob += item.prob;
                    }
                    return o;
                }
                select() {
                    let r = random() * this.prob;
                    for (const p of this) {
                        if (r <= p.prob) return p;
                        r -= p.prob;
                    }
                    // 有必要重试吗?
                    // Nolla做了非常逆天的处理 将测试代码留到了正式版 我不能确定它是否真的起作用了
                    // return this.select();
                }
            }
            /* prettier-ignore */
            const probs = {
                capacity: ProbList.create(
                    [1, 3, 10, 6, 2],
                    [0.1, 2, 7, 4, 4],
                    [.05, 1, 5, 3, 4],
                    [.15, 5, 11, 8, 2],
                    [.12, 2, 10, 8, 4],
                    [.15, 3, 12, 6, 6],
                    [1, 1, 20, 20, 0]
                ),
                reloadTime: ProbList.create(
                    [1, 5, 60, 30, 2],
                    [.5, 1, 100, 40, 2],
                    [.02, 1, 100, 40, 0],
                    [.35, 1, 240, 40, 0]
                ),
                fireRateWait: ProbList.create(
                    [1, 1, 30, 5, 2],
                    [.1, 1, 50, 15, 3],
                    [.1, -15, 15, 0, 3],
                    [.45, 0, 35, 12, 0]
                ),
                spreadDegrees: ProbList.create(
                    [1, -5, 10, 0, 3],
                    [.1, -35, 35, 0, 0]
                ),
                speedMultiplier: ProbList.create(
                    [1, 0.8, 1.2, 1, 0],
                    [.05, -1, 2, 1.1, 3],
                    [.05, 0.5, 1, 0.9, 3],
                    [1, 0.8, 1.2, 1, 0],
                    [.001, 1, 10, 5, 2]
                ),
                draw: ProbList.create(
                    [1, 1, 3, 1, 3],
                    [.2, 2, 4, 2, 8],
                    [.05, 1, 5, 2, 2],
                    [1, 1, 5, 2, 0]
                )
            };
            /* prettier-ignore */
            const probsBetter = {
                capacity: ProbList.create([1, 5, 13, 8, 2]),
                reloadTime: ProbList.create([1, 5, 40, 20, 2]),
                fireRateWait: ProbList.create([1, 1, 35, 5, 2]),
                spreadDegrees: ProbList.create([1, -1, 2, 0, 3]),
                speedMultiplier: ProbList.create([1, 0.8, 1.2, 1, 6]),
                draw: ProbList.create([1, 1, 3, 1, 3])
            };

            const applyAttr = {
                reloadTime({ cost }) {
                    /* prettier-ignore */
                    const r = clamp(
                        probs.reloadTime.select().randomDistribution(),
                        clamp(60 - 5 * cost, 1, 240),
                        1024
                    );
                    return [floor(r), (60 - r) / 5];
                },
                fireRateWait({ cost }) {
                    /* prettier-ignore */
                    const r = clamp(
                        probs.fireRateWait.select().randomDistribution(),
                        clamp(16 - cost, -50, 50),
                        50
                    );
                    return [floor(r), 16 - r];
                },
                spreadDegrees({ cost }) {
                    /* prettier-ignore */
                    const r = clamp(
                        probs.spreadDegrees.select().randomDistribution(),
                        clamp( cost / -1.5, -35, 35),
                        35
                    );
                    return [floor(r), 16 - r];
                },
                speedMultiplier({ cost }) {
                    const r = probs.speedMultiplier.select().randomDistribution();
                    return [floor(r), 0];
                },
                capacity({ cost, unshuffle }) {
                    let min = 1;
                    let max = clamp(cost / 5 + 6, 1, 20);
                    if (unshuffle) {
                        max = cost / 5 - 3;
                        if (max > 6) max = cost / 10 - 39; // max = 6 + ((cost-(15+6*5))/10)
                        max = clamp(max, 1, 20);
                    }
                    const r = clamp(probs.capacity.select().randomDistribution(), 1, max);
                    return [floor(r), 5 * r - 30];
                },
                shuffle({ cost, capacity, unshuffle }) {
                    const rand = unshuffle || random() > 0.5;
                    if (rand && cost >= 15 + 5 * capacity && capacity <= 9) return [false, 15 + 5 * capacity];
                    return [true, 0];
                },
                draw({ cost, capacity }) {
                    let max = 1;
                    /* prettier-ignore */
                    const costList = [
                        5 + capacity * 2,
                        15 + capacity * 3.5,
                        35 + capacity * 5,
                        45 + capacity ** 2
                    ];
                    for (const value of costList) max += value <= cost;
                    max = clamp(max, 1, capacity);
                    const r = Math.floor(clamp(probs.draw.select().randomDistribution(), 1, max));
                    return [floor(r), costList[clamp(r, 0, 4)]];
                }
            };

            const randomSpellID = (type, lv) => {
                if (lv > 6 && lv < 10) lv = 6;
                else if (lv > 10) lv = 10;
                /** @type {import("@spell").SpellData} */
                const { id, maxUse } = Spell.getRandomSpellData(lv, `#type_${type}`);
                if (isFinite(maxUse)) return `${id}^${maxUse}`;
                return id;
            };

            /**
             * @param {import("@wand").WandData} wandData
             * @param {number} level
             */
            const generateSpellExp = (wandData, level, isRare) => {
                const dynamicSpells = [];
                const staticSpells = [];

                let spellCount = random(1, 3);
                let projectileSpell = randomSpellID("projectile", level - 1);
                let goodSpellsCount = 0;
                if (random(100) < 50 && spellCount < 3) spellCount++;
                if (isRare || random(100) < 10) spellCount += random(1, 2);

                spellCount = random(Math.floor(0.51 * wandData.capacity), wandData.capacity - 1);
                if (spellCount < 1) spellCount = 1;

                if (isRare || random(100) < 4) {
                    const p = random(100);
                    if (p < 77) staticSpells.push(randomSpellID("modifier", level));
                    else if (p < 85) {
                        staticSpells.push(randomSpellID("modifier", level));
                        goodSpellsCount++;
                    } else if (p < 93) staticSpells.push(randomSpellID("staticProjectile", level));
                    else staticSpells.push(randomSpellID("projectile", level));
                }
                if (/* plan A */ random(100) < 50) {
                    let extralevel = level - 1;
                    while (random(1, 10) === 10) {
                        extralevel++;
                        projectileSpell = randomSpellID("projectile", extralevel);
                    }
                    if (spellCount < 3) {
                        if (spellCount > 1 && random(100) < 20) {
                            dynamicSpells.push(randomSpellID("modifier", level - 1));
                            spellCount--;
                        }
                    } else {
                        if (random(100) < 40) {
                            dynamicSpells.push(randomSpellID("drawMany", level - 1));
                            spellCount--;
                        }
                        if (spellCount > 3 && random(100) < 40) {
                            dynamicSpells.push(randomSpellID("drawMany", level - 1));
                            spellCount--;
                        }
                        if (random(100) < 80) {
                            dynamicSpells.push(randomSpellID("modifier", level - 1));
                            spellCount--;
                        }
                    }
                    dynamicSpells.push(`${projectileSpell}:${spellCount}`);
                } /* plan B */ else {
                    const randomProjectile = random(100) < 10 * level - 5;
                    const goodSpells = random(5, 45);
                    for (let i = 0; i < spellCount; i++) {
                        if (random(100) < goodSpells && spellCount > 2) {
                            if (goodSpellsCount === 0 && wandData.draw === 1) {
                                dynamicSpells.push(randomSpellID("drawMany", level - 1));
                                goodSpellsCount++;
                            } else dynamicSpells.push(randomSpellID(random(100) < 83 ? "modifier" : "drawMany", level - 1));
                            continue;
                        }
                        dynamicSpells.push(projectileSpell);
                        if (randomProjectile) projectileSpell = randomSpellID("projectile", level - 1);
                    }
                }

                return { dynamicSpells: dynamicSpells.join(" "), staticSpells: staticSpells.join(" ") };
            };

            /**
             * 生成法杖数据
             * @param {Object} option 配置
             * @param {1|2|3|4|5|6|10|11} option.level 法杖等级
             * @param {boolean} [option.unshuffle] 必定否杖 默认随机
             * @param {number} [option.cost] 属性点数 默认从等级生成
             * @param {"random"|"common"|"slow"|"fast"} [option.variation="common"] 变种 默认常规杖
             * @param {boolean} [option.isRare] 默认随机
             */
            return ({ level, unshuffle = random(0, 100) < 15 + level * 6, cost = defaultCost(level), variation = "common", isRare = random(100) < 5, custom = {} }) => {
                const params = {
                    name: "魔杖",
                    icon: "AUTO",
                    capacity: 0,
                    draw: 0,
                    reloadTime: 0,
                    fireRateWait: 0,
                    spreadDegrees: 0,
                    speedMultiplier: 0,
                    manaChargeSpeed: 50 * level + random(-5, 5 * level),
                    manaMax: 150 * level + random(10) * 10,
                    shuffle: true
                };

                if (variation === "random") {
                    if (random(100) < 20) variation = "slow";
                    if (random(100) < 15) variation = "fast";
                }
                if (variation === "slow") (params.manaChargeSpeed /= 5), (params.manaMax *= 3);
                else if (variation === "fast") (params.manaChargeSpeed *= 5), (params.manaMax /= 3);

                if (params.manaMax < 50) params.manaMax = 50;
                if (params.manaChargeSpeed < 10) params.manaChargeSpeed = 10;
                if (isRare) cost += 65;

                params.manaChargeSpeed = round(params.manaChargeSpeed);
                params.manaMax = round(params.manaMax);

                // 消耗点数获取属性: 充能时间, 施放延迟, 散射, 投射物速度倍数, 容量 ,乱序, 抽取数
                const attrLists = [["reloadTime", "fireRateWait", "spreadDegrees", "speedMultiplier"], ["capacity"], ["shuffle", "draw"]];
                if (!unshuffle) shuffleList(attrLists[2]);
                for (const attr of attrLists.flat()) {
                    const [value, consume] = applyAttr[attr]({ cost, unshuffle, capacity: params.capacity });
                    cost -= consume;
                    params[attr] = value;
                }

                if (cost > 5 && random(0, 1000) < 955) {
                    params.capacity += floor(cost / (params.shuffle ? 5 : 10));
                    cost = 0;
                }
                // HAX HAX HAX HAX HAX
                if (random(0, 1000) <= 999) params.capacity = clamp(params.capacity, 2, 26);
                if (params.capacity <= 1) params.capacity = 2;
                if (params.reloadTime >= 60) {
                    do {
                        params.draw++;
                    } while (random(0, 100) < 70);
                    if (random(0, 100) < 50) {
                        let { capacity } = params;
                        for (let i = 0; i < 6; i++) {
                            const temp = random(params.draw, params.capacity);
                            if (temp < capacity) capacity = temp;
                        }
                        params.capacity = capacity;
                    }
                }
                params.draw = clamp(params.draw, 1, params.capacity);
                Object.assign(params, generateSpellExp(params, level));
                Object.assign(params, custom);

                /* prettier-ignore */
                return new WandData([
                    params.name, //            0
                    params.icon,  //           1
                    params.capacity, //        2
                    params.draw, //            3
                    params.fireRateWait, //    4
                    params.reloadTime,  //     5
                    params.shuffle,  //        6
                    params.spreadDegrees, //   7
                    params.speedMultiplier, // 8
                    params.manaChargeSpeed, // 9
                    params.manaMax, //        10
                    params.staticSpells, //   11
                    params.dynamicSpells //   12
                ]);
            };
        })();

        /** @type {Map<String,WandData.presetTemplate>} */
        static dataMap = new Map();

        #length;
        constructor(datas) {
            /** @type {String} 名称 */ this.name = datas[0];
            //图标长度为0代表法杖图标自动生成
            if (!datas[1]) this.icon = null;
            else {
                this.#length = datas[1];
                Icon.cache(datas[0], datas[1], datas[2] ?? 1);
            }
        }

        get icon() {
            if (this.#length) return new Icon(this.name);
        }

        static init() {
            embed(`#template.preset.data.js`).forEach(e => {
                const data = freeze(new this(e));
                this.dataMap.set(data.name, data);
            });
        }
    };

    /** 解析法术配方  */
    static parseRecipe = (() => {
        //prettier-ignore
        embed(`#expParser.js`)
        return parse;
    })();

    /**
     * 通过模板获取法杖数据
     * @todo 暂时未实现
     * @param {string} name
     * @param {*} custom
     */
    static getDataByTemplate(name, useRangeValue = false, custom) {
        if (name.startsWith("lv")) {
            const [wandLevel, variation] = name.split(".");
            let level = +wandLevel.slice(2);
            if (level > 6 && level < 10) level = 6;
            if (level > 10) level = 10;
            // 10级杖属性点数需要手动指定
            if (level === 10) return this.PresetTemplate.generateDataByLevel({ level: 11, cost: 200, custom, variation });
            return this.PresetTemplate.generateDataByLevel({ level, custom, variation });
        }
        // const templateData = this.PresetTemplate.dataMap.get(name);
        // if (templateData) {
        //     return {
        //         icon: templateData.icon,
        //         name: templateData.name,
        //         capacity: 0,
        //         draw: 0,
        //         fireRateWait: 0,
        //         reloadTime: 0,
        //         manaChargeSpeed: 0,
        //         shuffle: false,
        //         spreadDegrees: 0,
        //         speedMultiplier: 0,
        //         manaMax: 0,
        //         staticSpells: "",
        //         dynamicSpells: ""
        //     };
        // } else return null;
    }

    /** @param {Array} data */
    constructor(data) {
        [
            /** @type {String} 名称 */
            this.name,
            ,
            /** @type {RangeValue} 容量 */
            this.capacity,
            /** @type {RangeValue} 抽取数 */
            this.draw,
            /** @type {RangeValue} 施放延迟 */
            this.fireRateWait,
            /** @type {RangeValue} 充能时间 */
            this.reloadTime,
            /** @type {Boolean} 乱序 */
            this.shuffle,
            /** @type {RangeValue} 散射角度 */
            this.spreadDegrees,
            /** @type {RangeValue} 投射物速度 */
            this.speedMultiplier,
            /** @type {RangeValue} 法力恢复速度 */
            this.manaChargeSpeed,
            /** @type {RangeValue} 法力上限 */
            this.manaMax
        ] = data;
        try {
            /** @type {Array<SpellRecipeItem> & {includedSpells: Set<string>}} 始终施放 `法术配方表达式` */
            this.staticSpells = WandData.parseRecipe(data[11]);
        } catch (e) {
            this.staticSpells = [e];
            this.staticSpells[WandData.errorSymbol] = e;
        }
        try {
            /** @type {Array<SpellRecipeItem> & {includedSpells: Set<string>}} 活动法术 `法术配方表达式` */
            this.dynamicSpells = WandData.parseRecipe(data[12]);
        } catch (e) {
            this.dynamicSpells = [e];
            this.dynamicSpells[WandData.errorSymbol] = e;
        }
        // 决定法杖图标
        const iconName = data[1];
        if (iconName === "AUTO") {
            this.#iconName = WandData.MatchData.getInfo(this).name;
            if (this.name === "AUTO") /** @type {String} 名称 */ this.name = info.name;
        } else this.#iconName = iconName;
    }
    /**
     * 是否包含某个法术
     * @param {string} id
     * @returns {"static"|"dynamic"|false}
     */
    includes(id) {
        if (this.staticSpells.includedSpells.has(id)) return "static";
        if (this.dynamicSpells.includedSpells.has(id)) return "dynamic";
        return false;
    }

    #iconName;
    get icon() {
        return new Icon(this.#iconName);
    }

    static init() {
        this.MatchData.init();
        this.PresetTemplate.init();
        Icon.init();
    }
}
