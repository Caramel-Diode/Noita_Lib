class Icon extends $icon(16, "材料") {
    static urls = asyncSpriteUrls(embed(`#icon.png`));
    /** @type {MaterialData?} */ #data;

    /** @param {MaterialData} data  */
    constructor(data) {
        super();
        this.#data = data;
    }

    connectedCallback() {
        const data = this.#data ?? MaterialData.queryById(this.getAttribute("material.id"));
        this.alt = data.name;
        this.src = data.asyncIconUrl;
    }
}

Icon.$defineElement("-material");

/** @typedef {import("TYPE").MaterialData} MaterialData */
/** @typedef {import("TYPE").MaterialId} MaterialId */
/** @typedef {import("TYPE").MaterialTag} MaterialTag */
/** @typedef {import("TYPE").MaterialData.ReactionData} MaterialData.ReactionData */
/** @typedef {import("TYPE").MaterialData.DataGroup} MaterialData.DataGroup */
class MaterialData {
    static iconUrls = asyncSpriteUrls(embed(`#icon.png`));

    static ReactionData = class {
        /** @type {Array<MaterialData.ReactionData>} */ static data = [];

        /** @param {String} data */
        #getMaterialDatas(data) {
            const items = data.split(" ");
            /**  @type {Array<MaterialDataGroup>} */ const result = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                // 判断是否含有标签
                if (item.startsWith("[")) {
                    if (item.endsWith("]")) result.push(MaterialData.queryByTag(item));
                    // 针对形如`[标签]_abc`组合表示格式做特殊处理
                    else {
                        const splitData = item.split("]");
                        const item_ = { tag: splitData[0] + "]", idPart: splitData[1], list: [] };
                        const baseMaterialDatas = MaterialData.queryByTag(item_.tag).list;
                        for (let j = 0; j < baseMaterialDatas.length; j++) item_.list.push(MaterialData.queryById(baseMaterialDatas[j].id + item_.idPart));
                        result.push(item_);
                    }
                } else result.push(MaterialData.queryByInherit(item));
            }
            return result;
        }

        /** @param {Array} datas */
        constructor(datas) {
            /** @type {Number} 反应速度 */ this.speed = datas[0];
            /** @type {Boolean} 快速反应 */ this.rapidly = datas[1] === 1;
            /** @type {Array<MaterialDataGroup>} 原料 */ this.inputs = this.#getMaterialDatas(datas[2]);
            /** @type {Array<MaterialDataGroup>} 产物 */ this.outputs = this.#getMaterialDatas(datas[3]);
        }

        /**
         * 某种/类材料与该反应之间的联系
         * @param {MaterialId|MaterialTag} keyword
         * @returns {"asInput"|"asOutput"|"asCatalyzer"|"none"} `作为原料` | `作为产物` | `作为催化剂` | `不参与反应`
         */
        getRelationship(keyword) {
            let asInput = false;
            let asOutput = false;
            $inputs: for (let i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i].tag === keyword) {
                    asInput = true;
                    break;
                } else {
                    const list = this.inputs[i].list;
                    for (let j = 0; j < list.length; j++) {
                        if (list[j].id === keyword) {
                            asInput = true;
                            break $inputs;
                        }
                    }
                }
            }
            $outputs: for (let i = 0; i < this.outputs.length; i++) {
                if (this.outputs[i].tag === keyword) {
                    asOutput = true;
                    break;
                } else {
                    const list = this.outputs[i].list;
                    for (let j = 0; j < list.length; j++) {
                        if (list[j].id === keyword) {
                            asOutput = true;
                            break $outputs;
                        }
                    }
                }
            }

            if (asInput && asOutput) return "asCatalyzer";
            else if (asInput) return "asInput";
            else if (asOutput) return "asOutput";
            else return "none";
        }

        /**
         *
         * @param {MaterialId} [agent] 代理材料 MaterialDataGroup 中的标签将替换为材料名; list中将单独选中代理材料
         * @param {"PlainText"|"MathML"} [format] 输出格式
         * @returns {String}
         */
        toString(agent, format = "PlainText") {
            /** @type {MaterialData|null} */ let agentMaterial = null;
            if (agent) agentMaterial = MaterialData.queryById(agent);
            /**
             * @typedef {Object} MaterialDataItem
             * @prop {Number} amount 数量
             * @prop {String} plainText
             * @prop {String} mathML
             */
            /** @type {Map<String, MaterialDataItem>} */ const map_input = new Map();
            /** @type {Map<String, MaterialDataItem>} */ const map_output = new Map();
            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.inputs[i];
                let key = "";
                if (input.tag) {
                    if (input.idPart) key = `${input.tag}${input.idPart}`;
                    else key = input.tag;
                } else key = input.parent;
                const r = map_input.get(key);
                if (r) r.amount++;
                else {
                    /** @type {MaterialDataItem} */ const mItem = { amount: 1, mathML: "", plainText: "" };
                    if (agentMaterial) {
                        if (input.tag) {
                            const tag = input.tag;
                            if (agentMaterial.tags.includes(tag)) {
                                if (input.idPart) {
                                    //存在idPart的情况下需要结合idPart寻找映射的材料作为代理
                                    const correspondingId = agentMaterial.id + input.idPart;
                                    for (let j = 0; j < input.list.length; j++) {
                                        if (input.list[j].id === correspondingId) {
                                            const r = input.list[j];
                                            mItem.plainText = `${r.name}:${r.id}`;
                                            mItem.mathML = `<munderover title="${key}"><ms>${r.name}</ms><mi>${r.id}</mi><mspace/></munderover>`;
                                            break;
                                        }
                                    }
                                } else {
                                    mItem.plainText = `${agentMaterial.name}:${agentMaterial.id}`; //代理标签材料组
                                    mItem.mathML = `<munderover title="${key}"><ms>${agentMaterial.name}</ms><mi>${agentMaterial.id}</mi><mspace/></munderover>`;
                                }
                            } else {
                                mItem.plainText = key;
                                mItem.mathML = `<mi>${key}</mi>`;
                            }
                        } //代理继承材料组
                        else if (input.list.includes(agentMaterial)) {
                            mItem.plainText = `${agentMaterial.name}:${agentMaterial.id}`;
                            mItem.mathML = `<munderover title="${key}"><ms>${agentMaterial.name}</ms><mi>${agentMaterial.id}</mi><mspace/></munderover>`;
                        } else {
                            // 使用parent作为默认代理
                            if (input.list.length > 1) {
                                mItem.plainText = `@${input.list[0].name}:${input.list[0].id}`;
                                mItem.mathML = `<munderover title="${key}"><msup><ms>${input.list[0].name}</ms><mo>*</mo></msup><mi>${input.list[0].id}</mi><mspace/></munderover>`;
                            } else {
                                mItem.plainText = `${input.list[0].name}:${input.list[0].id}`;
                                mItem.mathML = `<munderover title="${key}"><ms>${input.list[0].name}</ms><mi>${input.list[0].id}</mi><mspace/></munderover>`;
                            }
                        }
                    } else {
                        if (input.tag) {
                            if (input.idPart) {
                                mItem.plainText = `${input.tag}${input.idPart}`;
                                mItem.mathML = `<mi>${input.tag}${input.idPart}</mi>`;
                            } else {
                                mItem.plainText = `${input.tag}`;
                                mItem.mathML = `<mi>${input.tag}</mi>`;
                            }
                        } else {
                            // 使用parent作为默认代理
                            if (input.list.length > 1) {
                                mItem.plainText = `@${input.list[0].name}:${input.list[0].id}`;
                                mItem.mathML = `<munderover title="${key}"><msup><ms>${input.list[0].name}</ms><mo>*<mo></msup><mi>${input.list[0].id}</mi><mspace/></munderover>`;
                            } else {
                                mItem.plainText = `${input.list[0].name}:${input.list[0].id}`;
                                mItem.mathML = `<munderover title="${key}"><ms>${input.list[0].name}</ms><mi>${input.list[0].id}</mi><mspace/></munderover>`;
                            }
                        }
                    }
                    map_input.set(key, mItem);
                }
            }
            for (let i = 0; i < this.outputs.length; i++) {
                const output = this.outputs[i];
                let key = "";
                if (output.tag) {
                    if (output.idPart) key = `${output.tag}${output.idPart}`;
                    else key = output.tag;
                } else key = output.parent;
                const r = map_output.get(key);
                if (r) r.amount++;
                else {
                    /** @type {MaterialDataItem} */ const mItem = { amount: 1, mathML: "", plainText: "" };
                    if (agentMaterial) {
                        if (output.tag) {
                            const tag = output.tag;
                            if (agentMaterial.tags.includes(tag)) {
                                if (output.idPart) {
                                    //存在idPart的情况下需要结合idPart寻找映射的材料作为代理
                                    const correspondingId = agentMaterial.id + output.idPart;
                                    for (let j = 0; j < output.list.length; j++) {
                                        if (output.list[j].id === correspondingId) {
                                            const r = output.list[j];
                                            mItem.plainText = `${r.name}:${r.id}`;
                                            mItem.mathML = `<munderover title="${key}"><ms>${r.name}</ms><mi>${r.id}</mi><mspace/></munderover>`;
                                            break;
                                        }
                                    }
                                } else {
                                    mItem.plainText = `${agentMaterial.name}:${agentMaterial.id}`; //代理标签材料组
                                    mItem.mathML = `<munderover title="${key}"><ms>${agentMaterial.name}</ms><mi>${agentMaterial.id}</mi><mspace/></munderover>`;
                                }
                            } else {
                                mItem.plainText = key;
                                mItem.mathML = `<mi>${key}</mi>`;
                            }
                        } else {
                            //代理继承材料组 产物继承材料组不使用代理材料 仅使用 parent材料作为唯一项
                            mItem.plainText = `${output.list[0].name}:${output.list[0].id}`;
                            mItem.mathML = `<munderover title="${key}"><ms>${output.list[0].name}</ms><mi>${output.list[0].id}</mi><mspace/></munderover>`;
                        }
                    } else {
                        mItem.plainText = `${output.list[0].name}:${output.list[0].id}`;
                        mItem.mathML = `<munderover title="${key}"><ms>${output.list[0].name}</ms><mi>${output.list[0].id}</mi><mspace/></munderover>`;
                    }
                    map_output.set(key, mItem);
                }
            }

            const inputStrCache = [];
            const outputStrCache = [];
            if (format === "MathML") {
                for (const [key, value] of map_input)
                    if (value.amount > 1) inputStrCache.push(`<mn>${value.amount}</mn><mo>×</mo>${value.mathML}`);
                    else inputStrCache.push(value.mathML);
                for (const [key, value] of map_output)
                    if (value.amount > 1) outputStrCache.push(`<mn>${value.amount}</mn><mo>×</mo>${value.mathML}`);
                    else outputStrCache.push(value.mathML);
                const equalSign = `<mspace width="10px"/><munderover><mo stretchy="true">=</mo><ms>${this.rapidly ? "快速" : ""}</ms><mrow><mspace width="15px"/><mn>${this.speed}</mn><mo>%/f</mo><mspace width="15px"/></mrow></munderover><mspace width="10px"/>`;
                const addSign = `<mspace width="10px"/><mo>+</mo><mspace width="10px"/>`;
                return `<math>${inputStrCache.join(addSign)}${equalSign}${outputStrCache.join(addSign)}</math>`;
            } else {
                for (const [key, value] of map_input)
                    if (value.amount > 1) inputStrCache.push(`${value.amount}×${value.plainText}`);
                    else inputStrCache.push(value.plainText);
                for (const [key, value] of map_output)
                    if (value.amount > 1) outputStrCache.push(`${value.amount}×${value.plainText}`);
                    else outputStrCache.push(value.plainText);
                return `${inputStrCache.join(" + ")} ${this.rapidly ? "==" : "="} ${outputStrCache.join(" + ")}`;
            }
        }

        /**
         * @param {String} data
         */
        static query(data) {
            const result = {
                /** @type {Array<MaterialData.ReactionData>} */ asInput: [],
                /** @type {Array<MaterialData.ReactionData>} */ asOutput: [],
                /** @type {Array<MaterialData.ReactionData>} */ asCatalyzer: []
            };
            /** @type {Array<String>} */ const keywords = [];
            if (data.startsWith("[")) keywords.push(data);
            else keywords.push(data, ...MaterialData.queryById(data).tags);
            for (let i = 0; i < this.data.length; i++) {
                const reactionData = this.data[i];
                $keywords: for (let j = 0; j < keywords.length; j++) {
                    switch (reactionData.getRelationship(keywords[j])) {
                        case "asInput":
                            result.asInput.push(reactionData);
                            break $keywords;
                        case "asOutput":
                            result.asOutput.push(reactionData);
                            break $keywords;
                        case "asCatalyzer":
                            result.asCatalyzer.push(reactionData);
                            break $keywords;
                    }
                }
            }
            return result;
        }

        /** 初始化数据库 */
        static init() {
            const storage = MaterialData.ReactionData.data;
            embed(`#reaction.data.js`).forEach(v => storage.push(Object.freeze(new this(v))));
        }
    };

    static data = {
        /** @type {Array<MaterialData>} */ all: [],
        /** @type {Array<MaterialData>} */ InheritReactions: [],
        /** @type {Map<MaterialId,MaterialData>} */ id_map: new Map(),
        /** @type {Map<MaterialTag,MaterialData.DataGroup>} */ tag_map: new Map(),
        /** @type {Map<MaterialId,MaterialData.DataGroup>} */ inherit_map: new Map()
    };
    /** ⚪️ 空材料 @type {MaterialData} */ static $NULL;

    static #typeList = ["null", "fire", "liquid", "solid", "gas"];
    /** @type {Number} 图标索引 */ #iconIndex;

    /** @param {Array} datas @param {Number} index */
    constructor(datas, index) {
        this.#iconIndex = index;
        /** @type {String} `★主键` 实体标识符 */ this.id = datas[0];
        /** @type {String} 名称 */ this.name = datas[1];
        if (datas[2]) /** @type {Array<MaterialTag_Enum>} 标签 */ this.tags = datas[2].split(",");
        else this.tags = [];
        if (datas[3]) /** @type {String|null} 父类 */ this.parent = datas[3];
        else this.parent = null;
        /** @type {Boolean} 反应继承 */ this.inheritReactions = datas[4] === 1;
        /** @type {Boolean} 可燃性 */ this.burnable = datas[5];
        /** @type {Number} 密度 */ this.density = datas[6];
        /** @type {MaterialType_Enum} 类型 */ this.type = MaterialData.#typeList[datas[7]];
        /** @type {Number} 硬度 */ this.durability = datas[8];
        /** @type {Number} 血量 */ this.hp = datas[9];
        /** @type {Number} 燃烧血量 */ this.fireHp = datas[10];
        /** @type {Boolean} 导电性 */ this.electricalConductivity = datas[11] === 1;
        /** @type {Boolean} 生成烟雾 */ this.generatesSmoke = datas[12] === 1;
        /** @type {Number} 液体重力 */ this.liquidGravity = datas[13];
        /** @type {Boolean} 流沙类型 */ this.liquidSand = datas[14] === 1;
        /** @type {Number} 摩擦力 */ this.solidFriction = datas[15];
        /** @type {Number} 火焰温度 */ this.temperatureOfFire = datas[16];
        /** @type {Number} 自燃温度 */ this.autoignitionTemperature = datas[17];
        /** @type {Boolean} 始终燃烧 */ this.onFire = datas[18] === 1;
        /** @type {Boolean} 需要氧气 */ this.requiresOxygen = datas[19] === 1;
        /** @type {String} 颜色 */ this.color = datas[20];
        /** @type {String} 摄入效果 */ this.statusEffects_ingestion = datas[21];
        /** @type {String} 沾染效果 */ this.statusEffects_stains = datas[22];
        ///== 等待后续创建引用 ==///
        /** @type {MaterialData} 冻结转化 */ this.coldFreezesToMaterial = null; // datas[23]
        /** @type {MaterialData} 加热转化 */ this.warmthMeltsToMaterial = null; // datas[24]
        /** @type {MaterialData} 碎裂转化 */ this.solidBreakToType = null; // datas[25]

        /** @type {Number} 存在时间 */ this.lifetime = datas[26];
        /** @type {Boolean} 平台类型 */ this.platformType = datas[27] === 1;
        /** @type {String} 名称翻译键 */ this.nameKey = datas[28];
    }

    get asyncIconUrl() {
        return new Promise(resolve => Icon.urls.then(value => resolve(value[this.#iconIndex])));
    }

    get icon() {
        return new Icon(this);
    }

    /**
     * 通过ID获取材料数据
     * @param {String} id
     * @return {MaterialData}
     */
    static queryById = id => this.data.id_map.get(id) ?? this.$NULL;

    /**
     * 通过标签获取材料数据
     * @param {MaterialTag_Enum} tag
     * @returns {MaterialData.DataGroup}
     */
    static queryByTag = tag => this.data.tag_map.get(tag) ?? { tag: tag, list: [] };

    /**
     * 通继承获取材料数据
     * @param {MaterialId} parentMaterialId
     * @returns {MaterialData.DataGroup}
     */
    static queryByInherit = parentMaterialId => this.data.inherit_map.get(parentMaterialId) ?? { parent: parentMaterialId, list: [this.queryById(parentMaterialId)] };

    /** 初始化数据库 */
    static init() {
        const datas = embed(`#material.data.js`);
        this.$NULL = Object.freeze(new this(["NULL", "空", "", "", 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, "", "", "", "", "", "", -1, 0], 0));
        const all = this.data.all;
        datas.forEach((v, i) => {
            /** @type {MaterialData} */ const data = new this(v, i);
            all.push(data);
            this.data.id_map.set(data.id, data);
            for (let j = 0; j < data.tags.length; j++) {
                const tag = data.tags[j];
                const materialGroup = this.data.tag_map.get(tag);
                if (materialGroup) materialGroup.list.push(data);
                else this.data.tag_map.set(tag, { tag: tag, list: [data] });
            }
            if (data.inheritReactions) this.data.InheritReactions.push(data);
        });

        datas.forEach((v, i) => {
            if (v[23]) all[i].coldFreezesToMaterial = this.queryById(v[23]); //冻结转化
            if (v[24]) all[i].warmthMeltsToMaterial = this.queryById(v[24]); //加热转化
            if (v[25]) all[i].solidBreakToType = this.queryById(v[25]); //碎裂转化
            if (all[i].parent) {
                const data = all[i];
                const materialGroup = this.data.inherit_map.get(data.parent);
                if (materialGroup) materialGroup.list.push(data);
                else this.data.inherit_map.set(data.parent, { parent: data.parent, list: [this.queryById(data.parent), data] });
            }
            Object.freeze(all[i]);
        });

        this.ReactionData.init();
    }
}
