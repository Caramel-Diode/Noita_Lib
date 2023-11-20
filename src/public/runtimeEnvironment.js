/**
 * @typedef {Object} BlockInfo 施法块信息
 * @prop {Number} fireRateWait 施放延迟
 * @prop {Number} spreadDegrees 散射角度
 * @prop {Number} patternDegrees 阵型分布角度
 * @prop {Number} speedMultiplier 投射速度倍数
 * @prop {Number} childSpeedMultiplier 投射子速度倍数
 * @prop {Number} damageCriticalChance 暴击率
 * @prop {Number} explosionRadius 爆炸范围
 * @prop {Number} lifetime 存在时间
 * @prop {Number} bounces 弹跳次数
 * @prop {Number} knockbackForce 击退力度
 * @prop {Number} lightningCount 电弧施放数量
 * @prop {Array<String>} material 材料类型
 * @prop {Number} materialAmount 材料数量
 * @prop {Array<String>} trailMaterial 轨迹材料类型
 * @prop {Number} trailMaterialAmount 轨迹材料数量
 * @prop {Number} gravity 重力系数
 * @prop {Boolean} friendlyFire 友伤
 *
 * @prop {Array<EntityData>} projectiles 投射物
 * @prop {DamageData} damage 伤害
 *
 * @prop {Array<String>} extraEntities 额外实体
 * @prop {Array<String>} gameEffectEntities 额外游戏效果实体
 *
 * @prop {Number} screenshake 抖屏力度
 * @prop {Number} goreParticles 伤害粒子数量
 * @prop {Number} ragdollFx 碰撞箱大小?
 */

/**
 * @typedef {Object} TimeInfo 施法次信息
 * @prop {Array<BlockInfo>} blockInfos 施法块信息
 * @prop {Number} recoilKnockback 后座力
 */

/**
 * @typedef {Object} TurnInfo 施法轮信息
 * @prop {Array<TimeInfo>} timeInfos 施法次信息
 * @prop {Number} reloadTime 充能时间
 */

/**
 * @typedef SpellInstance
 * @prop {SpellData} spellData
 * @prop {Object} instanceData
 * @prop {Number} instanceData.remain 剩余次数
 * @prop {Number} instanceData.index 排列序号
 */

const CastRuntimeEnvironment = (() => {
    const compareFn = (a, b) => a.instanceData.index - b.instanceData.index;
    return class {
        /** 施法信息初始值 */ #InitialInfo = {
            /** 抽取数 */ draw: 1,
            /** 施放延迟 */ fireRateWait: 0,
            /** 充能时间 */ reloadTime: 0,
            /** 散射角度 */ spreadDegrees: 0,
            /** 投射速度倍数 */ speedMultiplier: 1
        };
        /** 当前法力值 */ #mana = 0;
        /** 施法块信息 @type {Array<BlockInfo>} */
        #blockInfos = [];
        /** 施法次信息 @type {Array<TimeInfo>} */
        #timeInfos = [];
        /** 施法轮信息 @type {Array<TurnInfo>} */
        #turnInfos = [];

        /** @returns {BlockInfo} */
        #createBlockInfo() {
            return {
                fireRateWait: this.#InitialInfo.fireRateWait, //继承法杖基础数值
                patternDegrees: 0,
                spreadDegrees: this.#InitialInfo.spreadDegrees, //继承法杖基础数值
                speedMultiplier: this.#InitialInfo.speedMultiplier, //继承法杖基础数值
                childSpeedMultiplier: 1,
                damageCriticalChance: 0,
                explosionRadius: 0,
                lifetime: 0,
                bounces: 0,
                knockbackForce: 0,
                lightningCount: 0,
                material: [],
                materialAmount: 0,
                trailMaterial: [],
                trailMaterialAmount: 0,
                gravity: 0,
                friendlyFire: false,
                projectiles: [],
                damage: new DamageData(""),
                extraEntities: [],
                gameEffectEntities: [],
                screenshake: 0,
                goreParticles: 0,
                ragdollFx: 0
            };
        }
        /** @returns {TimeInfo} */
        #createTimeInfo() {
            return {
                blockInfos: this.#blockInfos,
                recoilKnockback: 0
            };
        }
        /** @return {TurnInfo} */
        #createTurnInfo() {
            return {
                timeInfos: this.#timeInfos,
                reloadTime: this.#InitialInfo.reloadTime //继承法杖基础数值
            };
        }

        #globalFlags = {
            dnotDraw: false,
            /** 处于始终施放中 */ inStaticCasting: false,
            /** 回绕标记 结束本轮施法 不再尝试抽取 */ turnIsOver: false,
            /** 魔杖刷新标记 强制停止抽取*/ forceStopDraw: false
        };
        /**
         * 加载法术到施法块中
         * @param {SpellInstance} spell
         */
        #load(spell) {}
        /**
         * 回收丢弃队列到预备队列
         * @param {Boolean} [needSort] 施放需要排序
         */
        #reclaim(needSort = true) {
            this.#deck.push(...this.#discarded);
            this.#discarded = [];
            if (needSort) {
                this.#deck.sort(compareFn);
            }
        }
        /**
         * 抽取法术
         * @param {Number} [amount] 抽取数
         * @param {Boolean} [canRecall] 允许回收
         */
        #draw(amount = 1, canRecall = true) {
            /// 记录抽取行为
            // 不禁用抽取且不同时满足在始终施放中抽取数为1
            if (this.#globalFlags.inStaticCasting && amount === 1 && !this.#globalFlags.dnotDraw) {
                for (let i = 0; i < amount && this.#globalFlags.turnIsOver; i++) {
                    let firstTry = true,
                        failed = true;
                    while ((this.#deck.length > 0 || firstTry) && failed) {
                        if (this.#deck.length > 0) {
                            const target = this.#deck.shift();
                            failed = target.spellData.manaDrain > this.#mana || target.instanceData.remain === 0;
                            if (failed) this.#discarded.push(target);
                            else {
                                this.#mana -= target.manaDrain;
                                this.#load(target);
                            }
                        } else {
                            this.#globalFlags.turnIsOver = true;
                            if (canRecall && !this.#globalFlags.forceStopDraw) this.#reclaim();
                        }
                        firstTry = false;
                    }
                }
            }
        }

        /** 始终施放 @type {Array<SpellInstance>} */ #staticSpells = [];
        /** 预备队列 @type {Array<SpellInstance>} */ #deck = [];
        /** 施放队列 @type {Array<SpellInstance>} */ #hand = [];
        /** 丢弃队列 @type {Array<SpellInstance>} */ #discarded = [];
        constructor(mainWand, option) {}
    };
})();
