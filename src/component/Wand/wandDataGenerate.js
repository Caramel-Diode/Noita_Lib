const generateData = (() => {
    /**
     * @typedef {Object} AttrData 📄属性数据表
     * @prop {Number} cost 💰️ 属性点数
     * @prop {Boolean} forceUnshuffle 必定否杖
     * @prop {Boolean} isRare **★** 稀有
     * @prop {Number} manaChargeSpeed 法力恢复速度
     * @prop {Number} manaMax 法力上限
     * @prop {Number} capacity 容量
     * @prop {Number} reloadTime 充能时间
     * @prop {Number} fireRateWait 施放延迟
     * @prop {Number} draw 抽取数
     * @prop {Number} speedMultiplier 速度倍数
     * @prop {Number} prop_drawMany 多重抽取概率
     * @prop {Number} prop_unshuffle 非乱序概率
     */
    const random = util.math.random;
    const clamp = util.math.clamp;
    const shuffle = util.math.shuffle;
    const vars1 = ["reloadTime", "fireRateWait", "spreadDegrees", "speedMultiplier"];
    /** 给指定属性分配值 */
    const distribute = (() => {
        class probs {
            /**
             * @typedef {Object} ProbsItem 概率子项
             * @prop {Number} prob
             * @prop {Number} min
             * @prop {Number} max
             * @prop {Number} mean
             * @prop {Number} sharpness
             * @prop {Number} prob_unshuffle_add
             * @prop {Number} prob_drawMany_add
             */
            /** @type {Map<String,probs>} */
            static dataMap = new Map();
            /**
             * @param {"reloadTime"|"fireRateWait"|"spreadDegrees"|"speedMultiplier"|"shuffle"|"draw"|"capacity"} probName
             * @param {Array<[Number,Number,Number,Number,Number,Number,Number]>} datas
             */
            constructor(probName, datas) {
                /** @type {"reloadTime"|"fireRateWait"|"spreadDegrees"|"speedMultiplier"|"shuffle"|"draw"|"capacity"} 概率名 */ this.name = probName;
                /** @type {Number} 总概率 */ this.totalprob = 0;
                /** @type {Array<ProbsItem>} */
                this.items = [];
                for (let i = 0; i < datas.length; i++) {
                    const data = datas[i];
                    /** @type {ProbsItem} */ const item = {
                        prob: data[0],
                        min: data[1],
                        max: data[2],
                        mean: data[3],
                        sharpness: data[4],
                        prob_unshuffle_add: data[5] ?? 0,
                        prob_drawMany_add: data[6] ?? 0
                    };
                    this.totalprob += item.prob;
                    this.items.push(Object.freeze(item));
                }
            }

            static init() {
                const datas = [
                    [
                        "capacity",
                        [
                            [1, 3, 10, 6, 2],
                            [0.1, 2, 7, 4, 4, 0.8, 0],
                            [0.05, 1, 5, 3, 4, 0.8, 0],
                            [0.15, 5, 11, 8, 2],
                            [0.12, 2, 20, 8, 4],
                            [0.15, 3, 12, 6, 6, 0, 0.8],
                            [1, 1, 20, 6, 6]
                        ]
                    ],
                    [
                        "reloadTime",
                        [
                            [1, 5, 60, 30, 2],
                            [0.5, 1, 100, 40, 2],
                            [0.02, 1, 100, 40, 0],
                            [0.35, 1, 240, 40, 0, 0.5]
                        ]
                    ],
                    [
                        "fireRateWait",
                        [
                            [1, 1, 30, 5, 2],
                            [0.1, 1, 50, 12, 3],
                            [0.1, -15, 15, 0, 3],
                            [0.45, 0, 35, 12, 0]
                        ]
                    ],
                    [
                        "spreadDegrees",
                        [
                            [1, -5, 10, 0, 3],
                            [0.1, -35, 35, 0, 0]
                        ]
                    ],
                    [
                        "speedMultiplier",
                        [
                            [1, 0.8, 1.2, 1, 6],
                            [0.05, 1, 2, 1.1, 3],
                            [0.05, 0.5, 1, 0.9, 3],
                            [1, 0.8, 1.2, 1, 0],
                            [0, 001, 1, 10, 5, 2] //easter_egg
                        ]
                    ],
                    [
                        "draw",
                        [
                            [1, 1, 3, 1, 3],
                            [0.2, 2, 4, 2, 8],
                            [0.05, 1, 5, 2, 2],
                            [1, 1, 5, 2, 0]
                        ]
                    ]
                ];
                for (let i = 0; i < datas.length; i++) {
                    const data = datas[i];
                    const ps = Object.freeze(new this(data[0], data[1]));
                    this.dataMap(ps.name, ps);
                }
            }

            static getProbsItem(probName) {
                const probs_ = this.dataMap.get(probName);
                let r = Math.random() * probs_.totalprob;
                for (let i = 0; i < probs_.items.length; i++) {
                    const item = probs_.items[i];
                    if(r > item.prob) r -= item.prob;
                    else return item;
                }
            }
        }

        /**
         * @param {"reloadTime"|"fireRateWait"|"spreadDegrees"|"speedMultiplier"|"shuffle"|"draw"|"capacity"} attrName 属性名
         * @param {AttrData} data 数据表
         */
        return (attrName, data) => {
            let cost = data.cost;
            let probsItem = probs.getProbsItem(attrName);
            switch (attrName) {
            }
        };
    })();
    /**
     * 生成法杖数据
     * @param {Number} cost 属性点数
     * @param {Number} level 法杖等级
     * @param {Boolean} forceUnshuffle 必定否杖
     */
    return (cost, level, forceUnshuffle) => {
        if (random(100) < 50 && level === 1) cost += 5; // 1级杖有50%概率额外获得5点属性分配点数
        /** @type {AttrData} */ const data = {
            cost: cost + random(-3, 3),
            forceUnshuffle: random(85) < 6 * level,
            isRare: random(100) < 5,
            manaChargeSpeed: 50 * level + random(-5, 5 * level),
            manaMax: 50 + 150 * level + random(-50, 50),
            fireRateWait: 0,
            reloadTime: 0,
            prop_drawMany: 0.15,
            prop_unshuffle: 0.1
        };
        if (data.isRare) data.cost += 65; // 罕见杖奖励额外点数
        const p = random(100);
        if (p < 5) {
            /// 5%概率生成 高容蓝杖
            data.manaChargeSpeed /= 5;
            data.manaMax *= 3;
        } else if (p < 15) {
            /// 15%概率生成 高回蓝杖
            data.manaChargeSpeed *= 5;
            data.manaMax /= 3;
        }
        // 属性兜底
        if (data.manaChargeSpeed < 10) data.manaChargeSpeed = 10;
        if (data.manaMax < 50) data.manaMax = 50;

        // 属性分配 属性分配先后顺序会影响生成结果
        shuffle(vars1);
        const vars3 = ["shuffle", "draw"];
        if (!data.forceUnshuffle) shuffle(vars3);
        /// 第一组: 充能时间, 施放延迟, 散射, 速度倍数
        distribute(vars1[0]);
        distribute(vars1[1]);
        distribute(vars1[2]);
        distribute(vars1[3]);
        /// 第二组: 容量
        distribute("capacity");
        /// 第三组: 乱序, 抽取数
        distribute(vars3[0]);
        distribute(vars3[1]);

        // 有99.5%的概率将剩余点数分配给容量
        if (data.cost > 5 && random(1000) < 995) {
            if (data.forceUnshuffle) data.capacity += data.cost / 5;
            else data.capacity += data.cost / 10;
            data.cost = 0;
        }
        // 极小概率容量将不受上限限制
        if (random(10000) <= 9999) data.capacity = clamp(data.capacity, 2, 26);
        else if (data.capacity < 2) data.capacity = 2; //属性兜底
        // 充能满1s将有机会额外获得抽取数
        if (data.reloadTime >= 60) {
            // 以70%概率不断增加抽取数直至失败
            while (random(100) < 70) data.draw++;
            // 50%概率再增加抽取数 随机选取当前抽取数到容量之间的数6次将其中最小的值作为抽取数
            if (random(1)) {
                let result = data.draw;
                for (let i = 0; i < 6; i++) {
                    const temp = random(data.draw, data.capacity);
                    if (temp < result) result = temp;
                }
                data.draw = result;
            }
        }
        //限制抽取数取值范围
        data.draw = clamp(data.draw, 1, data.capacity);
    };
})();
