class Icon extends $icon(16, "材料") {
    static urls = new SpriteSpliter("MaterialIcons", embed(`#icon.png`)).results;
    /** @type {MaterialData?} */ #data;

    /** @param {MaterialData} data  */
    constructor(data) {
        super();
        this.#data = data;
    }

    connectedCallback() {
        const data = this.#data ?? MaterialData.queryById(this.dataset.id);
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

/**
 * @typedef MaterialDataGroup
 * @prop {MaterialTag} [tag] 标签
 * @prop {String} [idPart] id部分
 * @prop {MaterialId} [parent] 父材料id
 * @prop {Array<MaterialData>} list 具体可用材料表
 */

class MaterialData {
    //prettier-ignore
    static { delete this.prototype.constructor; } // 禁止从实例访问构造器

    static ReactionData = class ReactionData {
        /** @type {[void,"asInput","asOutput","asCatalyzer"]} */
        static #relationshipType = [, "asInput", "asOutput", "asCatalyzer"];
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
            }
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
         * 某种材料与该反应之间的联系
         * @param {MaterialId} id
         */
        getRelationshipById(id) {
            /** 关系类型
             * * `0b00 (0)`: **无关**
             * * `0b01 (1)`: **asInput**
             * * `0b10 (2)`: **asOutput**
             * * `0b11 (3)`: **asCatalyzer**
             * @type {0|1|2|3}
             */
            let type = 0;

            let sourceInput, sourceOutput;
            const { inputs, outputs } = this;
            $: for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                if (input.parent === id) {
                    sourceInput = id;
                    type += 1;
                    break;
                }
                const { list, tag, idPart = "" } = input;
                for (let j = 0; j < list.length; j++) {
                    if (list[j].id === id) {
                        type += 1; //0b01
                        sourceInput = tag + idPart;
                        break $;
                    }
                }
            }

            $: for (let i = 0; i < outputs.length; i++) {
                const output = outputs[i];
                if (output.parent === id) {
                    sourceOutput = id;
                    type += 2;
                    break;
                }
                const { list, tag, idPart = "" } = outputs[i];
                for (let j = 0; j < list.length; j++) {
                    if (list[j].id === id) {
                        type += 2; //0b10
                        sourceOutput = tag + idPart;
                        break $;
                    }
                }
            }

            if (type === 3) {
                // 输入输出来源一致时才认为是催化剂
                if (sourceInput === sourceOutput) return "asCatalyzer";
                else if (sourceInput === id) return "asInput";
                else if (sourceOutput === id) return "asOutput";
            }
            return ReactionData.#relationshipType[type];
        }

        /**
         * 某类材料与该反应之间的联系
         * @param {MaterialTag} tag
         */
        getRelationshipByTag(tag) {
            /** 关系类型
             * * `0b00 (0)`: **无关**
             * * `0b01 (1)`: **asInput**
             * * `0b10 (2)`: **asOutput**
             * * `0b11 (3)`: **asCatalyzer**
             * @type {0|1|2|3}
             */
            let type = 0;
            const { inputs, outputs } = this;
            for (let i = 0; i < inputs.length; i++)
                if (inputs[i].tag === tag) {
                    type += 1; //0b01
                    break;
                }
            for (let i = 0; i < outputs.length; i++) {
                const output = outputs[i];
                if (!("idPart" in output) && output.tag === tag) {
                    type += 2; //0b10
                    break;
                }
            }
            return ReactionData.#relationshipType[type];
        }

        /**
         * 某种/类材料与该反应之间的联系
         * @param {MaterialId|MaterialTag} keyword
         */
        getRelationship(keyword) {
            return keyword.startsWith("[") ? this.getRelationshipByTag(keyword) : this.getRelationshipById(keyword);
        }

        /**
         *
         * @param {MaterialId} [agent] 代理材料 MaterialDataGroup 中的标签将替换为材料名; list中将单独选中代理材料
         * @param {"PlainText"|"MathML"} [format] 输出格式
         * @returns {String}
         */
        toString(agent, format = "PlainText") {
            /** @type {MaterialData} */ let agentMaterial = {},
                /** @type {"asCatalyzer"|"asInput"|"asOutput"|undefined} */ agentType;

            if (agent) {
                agentMaterial = MaterialData.queryById(agent);
                agentType = this.getRelationshipById(agent);
            }

            /**
             * @typedef {Object} MaterialDataItem
             * @prop {Number} amount 数量
             * @prop {String} plainText
             * @prop {String} mathML
             */
            /** @type {Map<String, MaterialDataItem>} */
            const mapInput = new Map(),
                /** @type {Map<String, MaterialDataItem>} */
                mapOutput = new Map();

            const inputs = [...this.inputs];
            const outputs = [...this.outputs];

            //#region 处理代理材料在产物与原料中存在的映射关系
            if (agentType === "asInput") {
                let tag;
                $: for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    const { list } = input;
                    for (let j = 0; j < list.length; j++) {
                        if (list[j].id === agent) {
                            const withAgent = Object.create(input);
                            withAgent.agent = agentMaterial;
                            inputs[i] = withAgent;
                            tag = input.tag;
                            break $;
                        }
                    }
                }
                // 通过[tag]寻找对应的[tag]_idPart 材料
                if (tag)
                    for (let i = 0; i < outputs.length; i++) {
                        const output = outputs[i];
                        if (output.tag === tag) {
                            const withAgent = Object.create(output);
                            if (output.idPart) withAgent.agent = MaterialData.queryById(agent + output.idPart);
                            else withAgent.agent = agentMaterial;
                            outputs[i] = withAgent;
                            break;
                        }
                    }
            } else if (agentType === "asOutput") {
                let data;
                $: for (let i = 0; i < outputs.length; i++) {
                    const output = outputs[i];
                    const { list } = output;
                    for (let j = 0; j < list.length; j++) {
                        if (list[j].id === agent) {
                            const withAgent = Object.create(output);
                            withAgent.agent = agentMaterial;
                            outputs[i] = withAgent;
                            // 通过_idPart寻找对应的[tag] 材料
                            if (output.idPart) data = MaterialData.queryById(agent.slice(0, -output.idPart.length));
                            break $;
                        }
                    }
                }
                if (data)
                    for (let i = 0; i < inputs.length; i++) {
                        const input = inputs[i];
                        if (input.list.includes(data)) {
                            const withAgent = Object.create(input);
                            withAgent.agent = data;
                            inputs[i] = withAgent;
                            break;
                        }
                    }
            } else if (agentType === "asCatalyzer") {
                $: for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    const { list } = input;
                    for (let j = 0; j < list.length; j++) {
                        if (list[j].id === agent) {
                            const withAgent = Object.create(input);
                            withAgent.agent = agentMaterial;
                            inputs[i] = withAgent;
                            break $;
                        }
                    }
                }
                $: for (let i = 0; i < outputs.length; i++) {
                    const output = outputs[i];
                    const { list } = output;
                    for (let j = 0; j < list.length; j++) {
                        if (list[j].id === agent) {
                            const withAgent = Object.create(output);
                            withAgent.agent = agentMaterial;
                            outputs[i] = withAgent;
                            break $;
                        }
                    }
                }
            }
            //#endregion

            for (let i = 0; i < inputs.length; i++) {
                const { parent, tag, idPart, list, agent } = inputs[i];
                const key = tag ? tag + (idPart ?? "") : parent;
                const r = mapInput.get(key);
                if (r) r.amount++;
                else {
                    let mathML, plainText;
                    if (agent) {
                        plainText = `${agent.name}:${agent.id}`;
                        mathML = `<munderover title="${key}"><ms>${agent.name}</ms><mi>${agent.id}</mi><mspace/></munderover>`;
                    } else {
                        if (tag) {
                            plainText = key;
                            mathML = `<mi>${key}</mi>`;
                        } else {
                            // 使用parent作为默认代理
                            const { name, id } = list[0];
                            if (list.length > 1) {
                                plainText = `@${name}:${id}`;
                                mathML = `<munderover title="${key}"><msup><ms>${name}</ms><mo>*</mo></msup><mi>${id}</mi><mspace/></munderover>`;
                            } else {
                                plainText = `${name}:${id}`;
                                mathML = `<munderover title="${key}"><ms>${name}</ms><mi>${id}</mi><mspace/></munderover>`;
                            }
                        }
                    }
                    mapInput.set(key, { amount: 1, mathML, plainText });
                }
            }

            for (let i = 0; i < outputs.length; i++) {
                const { parent, tag, idPart, list, agent } = outputs[i];
                const key = tag ? tag + (idPart ?? "") : parent;
                const r = mapOutput.get(key);
                if (r) r.amount++;
                else {
                    let mathML, plainText;
                    if (agent) {
                        plainText = `${agent.name}:${agent.id}`;
                        mathML = `<munderover title="${key}"><ms>${agent.name}</ms><mi>${agent.id}</mi><mspace/></munderover>`;
                    } else {
                        if (tag) {
                            // 针对没有被任何材料使用的标签
                            if (list.length) {
                                plainText = `${list[0].name}:${list[0].id}`;
                                mathML = `<munderover title="${key}"><ms>${list[0].name}</ms><mi>${list[0].id}</mi><mspace/></munderover>`;
                            } else {
                                plainText = key;
                                mathML = `<mi>${key}</mi>`;
                            }
                        } else {
                            //代理继承材料组 产物继承材料组不使用代理材料 仅使用 parent材料作为唯一项 ☆
                            plainText = `${list[0].name}:${list[0].id}`;
                            mathML = `<munderover title="${key}"><ms>${list[0].name}</ms><mi>${list[0].id}</mi><mspace/></munderover>`;
                        }
                    }
                    mapOutput.set(key, { amount: 1, mathML, plainText });
                }
            }

            const inputStrCache = [];
            const outputStrCache = [];
            if (format === "MathML") {
                for (const [key, value] of mapInput)
                    if (value.amount > 1) inputStrCache.push(`<mn>${value.amount}</mn><mo>×</mo>${value.mathML}`);
                    else inputStrCache.push(value.mathML);
                for (const [key, value] of mapOutput)
                    if (value.amount > 1) outputStrCache.push(`<mn>${value.amount}</mn><mo>×</mo>${value.mathML}`);
                    else outputStrCache.push(value.mathML);
                const equalSign = `<mspace width="10px"/><munderover><mo stretchy="true">=</mo><ms>${this.rapidly ? "快速" : ""}</ms><mrow><mspace width="15px"/><mn>${this.speed}</mn><mo>%/f</mo><mspace width="15px"/></mrow></munderover><mspace width="10px"/>`;
                const addSign = `<mspace width="10px"/><mo>+</mo><mspace width="10px"/>`;
                return `<math>${inputStrCache.join(addSign)}${equalSign}${outputStrCache.join(addSign)}</math>`;
            } else {
                for (const [key, value] of mapInput)
                    if (value.amount > 1) inputStrCache.push(`${value.amount}×${value.plainText}`);
                    else inputStrCache.push(value.plainText);
                for (const [key, value] of mapOutput)
                    if (value.amount > 1) outputStrCache.push(`${value.amount}×${value.plainText}`);
                    else outputStrCache.push(value.plainText);
                return `${inputStrCache.join(" + ")} ${this.rapidly ? "==" : "="} ${outputStrCache.join(" + ")}`;
            }
        }

        /**
         * @param {MaterialId} id
         */
        static queryById(id) {
            const /** @type {Set<MaterialData.ReactionData>} */ asInput = new Set(),
                /** @type {Set<MaterialData.ReactionData>} */ asOutput = new Set(),
                /** @type {Set<MaterialData.ReactionData>} */ asCatalyzer = new Set();
            const { tags } = MaterialData.queryById(id);
            //查询具体材料相关反应
            for (let i = 0; i < this.data.length; i++) {
                const reaction = this.data[i];
                switch (reaction.getRelationshipById(id)) {
                    case "asInput":
                        asInput.add(reaction);
                        break;
                    case "asOutput":
                        asOutput.add(reaction);
                        break;
                    case "asCatalyzer":
                        asCatalyzer.add(reaction);
                        break;
                }
                // for (let j = 0; j < tags.length; j++) {
                //     switch (reaction.getRelationshipByTag(tags[j])) {
                //         case "asInput":
                //             if (reaction.getRelationshipById(id) === "asInput") asInput.add(reaction);
                //             break;
                //         // 标签不应该单独出现在产物中 至少应该是原料和产物同时出现或以id+标签的形式出现
                //         // case "asOutput":
                //         //     asInput.add(reaction);
                //         //     break;
                //         case "asCatalyzer":
                //             asCatalyzer.add(reaction);
                //     }
                // }
            }
            return { asCatalyzer, asInput, asOutput };
        }

        /**
         * @param {MaterialTag} tag
         */
        static queryByTag(tag) {
            const /** @type {Set<MaterialData.ReactionData>} */ asInput = new Set(),
                /** @type {Set<MaterialData.ReactionData>} */ asOutput = new Set(),
                /** @type {Set<MaterialData.ReactionData>} */ asCatalyzer = new Set();
            // 查询标签相关反应
            for (let i = 0; i < this.data.length; i++) {
                const reaction = this.data[i];
                switch (reaction.getRelationshipByTag(tag)) {
                    case "asInput":
                        asInput.add(reaction);
                        break;
                    case "asOutput":
                        asOutput.add(reaction);
                        break;
                    case "asCatalyzer":
                        asCatalyzer.add(reaction);
                        break;
                }
            }
            return { asCatalyzer, asInput, asOutput };
        }

        /**
         * @param {MaterialId|MaterialTag} keyword
         */
        static query(keyword) {
            if (keyword.startsWith("[")) {
                const { asInput, asOutput, asCatalyzer } = this.queryByTag(keyword);
                return { asCatalyzer: [...asCatalyzer], asInput: [...asInput], asOutput: [...asOutput] };
            } else {
                const { asInput, asOutput, asCatalyzer } = this.queryById(keyword);
                return { asCatalyzer: [...asCatalyzer], asInput: [...asInput], asOutput: [...asOutput] };
            }
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
