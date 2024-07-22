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
    //prettier-ignore
    static { delete this.prototype.constructor; } // 禁止从实例访问构造器

    static ReactionData = class {
        //prettier-ignore
        static { delete this.prototype.constructor; } // 禁止从实例访问构造器
        /** @type {Array<MaterialData.ReactionData>} */ static data = [];

        /**
         * @param {String} data
         * @returns {Array<MaterialDataGroup>}
         */
        #getMaterialDatas(data) {
            const items = data.split(" ");
            for (let i = 0; i < items.length; i++) {
                const keyword = items[i];
                if (keyword.startsWith("[")) {
                    if (keyword.endsWith("]")) items[i] = MaterialData.queryByTag(keyword);
                    // 针对形如`[标签]_abc`组合表示格式做特殊处理
                    else {
                        const p = keyword.lastIndexOf("]") + 1;
                        //prettier-ignore
                        const data = items[i] = freeze({
                            tag: keyword.slice(0, p),
                            idPart: keyword.slice(p),
                            list: []
                        });
                        const raw = MaterialData.queryByTag(data.tag).list;
                        for (let j = 0; j < raw.length; j++) data.list.push(MaterialData.queryById(raw[j].id + data.idPart));
                        freeze(data.list);
                    }
                } else {
                    //prettier-ignore
                    const { parent, list: [self, ...children] } = MaterialData.queryByInherit(MaterialData.data.all[keyword].id);
                    //prettier-ignore
                    const valid = items[i] = freeze({ parent, list: [self] });
                    // 仅使用继承反应的子材料
                    for (let j = i; j < children.length; j++) {
                        const e = children[j];
                        if (e.inheritReactions) valid.list.push(e);
                    }
                    freeze(valid.list);
                }
                // // 判断是否含有标签
                // if (keyword.startsWith("[")) {
                //     if (keyword.endsWith("]")) items[i] = MaterialData.queryByTag(keyword);
                //     // 针对形如`[标签]_abc`组合表示格式做特殊处理
                //     else {
                //         const p = keyword.lastIndexOf("]") + 1;
                //         //prettier-ignore
                //         const data = items[i] = freeze({
                //             tag: keyword.slice(0, p),
                //             idPart: keyword.slice(p),
                //             list: []
                //         });
                //         const raw = MaterialData.queryByTag(data.tag).list;
                //         for (let j = 0; j < raw.length; j++) data.list.push(MaterialData.queryById(raw[j].id + data.idPart));
                //         freeze(data.list);
                //     }
                // } else {
                //     const raw = MaterialData.queryByInherit(keyword);
                //     //prettier-ignore
                //     const { parent, list: [self, ...children] } = MaterialData.queryByInherit(keyword);
                //     //prettier-ignore
                //     const valid = items[i] = freeze({ parent, list: [self] });
                //     // 仅使用继承反应的子材料
                //     for (let j = i; j < children.length; j++) {
                //         const e = children[j];
                //         if (e.inheritReactions) valid.list.push(e);
                //     }
                //     freeze(valid.list);
                // }
            }
            // console.warn(items);
            return items;
        }

        /** @param {[number,string]} data */
        constructor(data) {
            if (data[0] < 0) {
                this.rapidly = true;
                this.speed = -data[0];
            } else {
                this.rapidly = false;
                this.speed = data[0];
            }
            const [inputs, part] = data[1].split("=");
            const [outputs, entity] = part.split("$");
            this.inputs = this.#getMaterialDatas(inputs);
            this.outputs = this.#getMaterialDatas(outputs);
        }

        /**
         * 某种/类材料与该反应之间的联系
         * @param {MaterialId|MaterialTag} keyword
         * @returns {"asInput"|"asOutput"|"asCatalyzer"|undefined} `作为原料` | `作为产物` | `作为催化剂` | `不参与反应`
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
                const list = this.outputs[i].list;
                for (let j = 0; j < list.length; j++) {
                    if (list[j].id === keyword) {
                        asOutput = true;
                        break $outputs;
                    }
                }
            }

            if (asInput && asOutput) return "asCatalyzer";
            else if (asInput) return "asInput";
            else if (asOutput) return "asOutput";
            return;
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
                                mItem.mathML = `<munderover title="${key}"><msup><ms>${input.list[0].name}</ms><mo>*</mo></msup><mi>${input.list[0].id}</mi><mspace/></munderover>`;
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
         * @param {String} keyword
         */
        static query(keyword) {
            const result = {
                /** @type {Array<MaterialData.ReactionData>} */ asInput: [],
                /** @type {Array<MaterialData.ReactionData>} */ asOutput: [],
                /** @type {Array<MaterialData.ReactionData>} */ asCatalyzer: []
            };
            if (keyword.startsWith("[")) {
                // 查询标签相关反应
                for (let i = 0; i < this.data.length; i++) {
                    const reactionData = this.data[i];
                    console.log("# # #", keyword);
                    console.log(reactionData.inputs);
                    console.log(reactionData.outputs);
                    console.log("# # #");
                    switch (reactionData.getRelationship(keyword)) {
                        case "asInput":
                            result.asInput.push(reactionData);
                            break;
                        case "asOutput":
                            result.asOutput.push(reactionData);
                            break;
                        case "asCatalyzer":
                            result.asCatalyzer.push(reactionData);
                            break;
                    }
                }
            } else {
                const { id, tags } = MaterialData.queryById(keyword);
                //查询具体材料相关反应
                for (let i = 0; i < this.data.length; i++) {
                    const reactionData = this.data[i];
                    switch (reactionData.getRelationship(id)) {
                        case "asInput":
                            result.asInput.push(reactionData);
                            break;
                        case "asOutput":
                            result.asOutput.push(reactionData);
                            break;
                        case "asCatalyzer":
                            result.asCatalyzer.push(reactionData);
                            break;
                    }
                    for (let j = 0; j < tags.length; j++) {
                        // 标签仅查询作为原料(/催化剂)的反应
                        if (reactionData.getRelationship(tags[j])) {
                            result.asInput.push(reactionData);
                            break;
                        }
                    }
                }
            }
            return result;
        }

        /** 初始化数据库 */
        static init() {
            this.data = toChunks(embed(`#reaction.data.js`), 2).map(e => freeze(new this(e)));
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

    /** @param {Array} data @param {Number} index */
    constructor(data, index) {
        this.#iconIndex = index;
        [
            this.inheritReactions, //=========[0] 继承反应
            this.burnable, //=================[1] 可燃性
            this.electricalConductivity, //===[2] 导电性
            this.generatesSmoke, //===========[3] 生成烟雾
            this.liquidSand, //===============[4] 流沙
            this.onFire, //===================[5] 始终燃烧
            this.requiresOxygen, //===========[6] 燃烧需氧
            this.platformType //==============[7] 平台类型
        ] = toBits(data[4], true); //解析二进制位为Boolean值
        //prettier-ignore
        [
            this.id, //=======================[0] id
            this.name, //=====================[1] 材料名
            this.tags = [], //================[2] 标签
            , //==============================[3] 父材料 (等待后续创建引用)
            , //==============================[4] BitsNumber
            this.density, //==================[5] 密度
            , //==============================[6] 类型
            this.durability, //===============[7] 耐久?
            this.hp, //=======================[8] 血量
            this.fireHp, //===================[9] 燃烧血量
            this.liquidGravity, //============[10] 液体重力
            this.solidFriction, //============[11] 固体摩擦力
            this.temperatureOfFire, //========[12] 火焰温度
            this.autoignitionTemperature, //==[13] 自燃温度
            this.color, //====================[14] 容器中的颜色
            this.statusEffects_ingestion, //==[15] 摄入效果
            this.statusEffects_stains, //=====[16] 沾染效果
            , //==============================[17] 冻结转化 (等待后续创建引用)
            , //==============================[18] 加热转化 (等待后续创建引用)
            , //==============================[19] 碎裂转化 (等待后续创建引用)
            this.lifetime, //=================[20] 存在时间
            this.nameKey //===================[21] 名称翻译键
        ] = data;
        this.type = MaterialData.#typeList[data[6]];
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
        const datas = toChunks(embed(`#material.data.js`), 22);
        this.$NULL = Object.freeze(new this(["_NULL", "空白", , , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "000000FF", "", "", , , , -1, "mat_air"], 0));

        this.data.all = datas.map((v, i) => {
            /** @type {MaterialData} */
            const data = new this(v, i);
            this.data.id_map.set(data.id, data);
            for (let j = 0; j < data.tags.length; j++) {
                const tag = data.tags[j];
                const materialGroup = this.data.tag_map.get(tag);
                if (materialGroup) materialGroup.list.push(data);
                else this.data.tag_map.set(tag, { tag: tag, list: [data] });
            }
            if (data.inheritReactions) this.data.InheritReactions.push(data);
            return data;
        });

        //创建引用
        datas.forEach((v, i) => {
            const target = this.data.all[i];
            // 父材料 值为索引
            if (v[3] !== void 0) {
                //prettier-ignore
                const { id } = target.parent = this.data.all[v[3]];
                const materialGroup = this.data.inherit_map.get(id);
                if (materialGroup) materialGroup.list.push(target);
                else this.data.inherit_map.set(id, { parent: id, list: [target.parent, target] });
            }
            if (v[17]) target.coldFreezesToMaterial = this.queryById(v[17]); //冻结转化
            if (v[18]) target.warmthMeltsToMaterial = this.queryById(v[18]); //加热转化
            if (v[19]) target.solidBreakToType = this.queryById(v[19]); //碎裂转化
            Object.freeze(target);
        });

        this.ReactionData.init();
    }
}
