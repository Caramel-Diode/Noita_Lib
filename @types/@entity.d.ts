/** 实体数据 */
export type EntityData = {
    /** 实体id */
    id: String;
    /** 实体名称 */
    name: String;
    /** 标签 */
    tags: Array<String>;
    projectileComponent: EntityData.Component.Projectile;
    damageModelComponent: EntityData.Component.DamageModel;
    animalAIComponent: EntityData.Component.AnimalAI;
    variableStorageComponent: { [key: String]: EntityData.Component.VariableStorage };
    aIAttackComponent: Array<EntityData.Component.AIAttack>;
    lifetimeComponent: EntityData.Component.Lifetime;
    genomeDataComponent: EntityData.Component.GenomeData;
    loadEntitiesComponent: { [key: String]: EntityData.Component.LoadEntities };
    areaDamageComponent: Array<EntityData.Component.AreaDamage>;
    explodeOnDamageComponent: EntityData.Component.ExplodeOnDamage;
    explosionComponent: EntityData.Component.Explosion;
    lightningComponent: EntityData.Component.Lightning;
    gameAreaEffectComponent: EntityData.Component.GameAreaEffect;
    homingComponent: EntityData.Component.Homing;
    magicConvertMaterialComponent: Array<EntityData.Component.MagicConvertMaterial>;
    cellEaterComponent: Array<EntityData.Component.CellEater>;
    hitBoxComponent: EntityData.Component.Hitbox;
};

export namespace EntityData {
    namespace Component {
        /**
         * 投射物组件
         * ```xml
         * <ProjectileComponent>
         * ```
         */
        type Projectile = {
            /**
             * 友方命中
             */
            friendlyFire: Boolean;
            /**
             * 爆炸造成伤害
             */
            explosionDamageMortals: Boolean;
            /**
             * 爆炸无自伤
             */
            explosionDontDamageShooter: Boolean;
            /**
             * 命中实体
             */
            collideWithEntities: Boolean;
            /**
             * 命中地形
             */
            collideWithWorld: Boolean;
            /**
             * 差速伤害加成
             */
            damageScaledBySpeed: Boolean;
            /**
             * 接触液体时失效
             */
            dieOnLiquidCollision: Boolean;
            /**
             * 低速时失效
             */
            dieOnLowVelocity: Boolean;
            /**
             * 碰撞(命中)时失效
             */
            onCollisionDie: Boolean;
            /**
             * 失效时爆炸
             */
            onDeathExplode: Boolean;
            /**
             * 存在时间结束时爆炸
             */
            onLifetimeOutExplode: Boolean;
            /**
             * 在碰撞时生成实体
             */
            onCollisionSpawnEntity: Boolean;
            /**
             * 生成实体是投射物 (具备施法者信息)
             */
            spawnEntityIsProjectile: Boolean;
            /**
             * 穿透实体
             */
            penetrateEntities: Boolean;
            /**
             * 穿透地形
             */
            penetrateWorld: Boolean;
            /**
             * 不产生命中
             */
            doMovetoUpdate: Boolean;
            /**
             * 提供伤害
             */
            damage: DamageData;
            /**
             * 爆炸半径
             */
            explosionRadius: Number;
            /**
             * 存在时间
             */
            lifetime: RangeValue;
            /**
             * 飞行速度
             */
            speed: RangeValue;
            /**
             * 散射
             */
            spreadDegrees: RangeValue;
            /**
             * 击退
             */
            knockbackForce: Number;
            /**
             * 弹跳次数
             */
            bounces: Number;
            /**
             * 伤害间隔
             */
            damageInterval: Number;
            /**
             * 榨血系数?
             */
            bloodCountMultiplier: Number;
            /**
             * 安全时间
             */
            collideWithShooterFrames: Number;
            /**
             * 游戏效果实体
             */
            damageGameEffectEntities: String;
            /**
             * 碰撞加载实体
             */
            collisionEntity: String;
            /**
             * 爆炸加载实体
             */
            explosionEntity: String;
            /**
             * 爆炸击退系数
             */
            explosionKnockbackForce: Number;
        };
        /**
         * 伤害模型组件
         * ```xml
         * <DamageModelComponent>
         * ```
         */
        type DamageModel = {
            /**
             * 生命值上限
             */
            maxHp: Number;
            /**
             * 血液材料
             */
            bloodMaterial: String;
            /**
             * 飞溅血液材料
             */
            bloodSprayMaterial: String;
            /**
             * 身体材料
             */
            ragdollMaterial: String;
            /**
             * 材料伤害表
             */
            materialDamageData: { [key: String]: Number };
            /**
             * 肺容量
             */
            airInLungsMax: Number;
            /**
             * 窒息伤害
             */
            airLackOfDamage: Number;
            /**
             * 点燃概率
             */
            fireProbabilityOfIgnition: Number;
            /**
             * 点燃伤害量
             */
            fireDamageIgnitedAmount: Number;
            /**
             * 摔落伤害
             */
            fallingDamage: RangeValue;
            /**
             * 摔落高度
             */
            fallingDamageHeight: RangeValue;
            /**
             * 暴击抗性
             */
            criticalDamageResistance: Number;
            /**
             * 沾湿伤害量
             */
            wetStatusEffectDamage: Number;
            /**
             * 承伤系数
             */
            damageMultipliers: DamageData;
            /**
             * 需要呼吸
             */
            airNeeded: Boolean;
            /**
             * 始终燃烧
             */
            isOnFire: Boolean;
            /**
             * 受到摔落伤害
             */
            fallingDamages: Boolean;
            /**
             * 遗留尸体
             */
            createRagdoll: Boolean;
            /**
             * 扣血显示
             */
            uiReportDamage: Boolean;
            /**
             * 受冲击伤害
             */
            physicsObjectsDamage: Boolean;
        };
        /**
         * 动物AI组件
         * ```xml
         * <AnimalAIComponent>
         * ```
         */
        type AnimalAI = {
            /**
             * 近战伤害(冲撞)
             */
            dashDamage: Number;
            /**
             * 冲撞距离
             */
            dashDistance: Number;
            /**
             * 冲撞冷却时间
             */
            dashFramesCD: Number;
            /**
             * 冲撞速度
             */
            dashSpeed: Number;
            /**
             * 近战伤害
             */
            meleeDamage: RangeValue;
            /**
             * 近战最大距离
             */
            meleeMaxDistance: Number;
            /**
             * 食物(回血)
             */
            food: String;
            /**
             * 只会反击
             */
            attackOnlyIfAttacked: Boolean;
            /**
             * 可飞行
             */
            canFly: Boolean;
            /**
             * 可行走
             */
            canWalk: Boolean;
            /**
             * 有排泄行为
             */
            defecatesAndPees: Boolean;
            /**
             * 同阵营误伤不还手
             */
            dontCounterAttackOwnHerd: Boolean;
            /**
             * 寻底
             */
            senseCreatures: Boolean;
            /**
             * 透视寻底
             */
            senseCreaturesThroughWalls: Boolean;
            /**
             * 使用远程攻击攻击友方 (辅助形怪物)
             */
            triesToRangedAttackFriends: Boolean;
        };
        /**
         * AI攻击组件(远程)
         * ```xml
         * <AIAttackComponent>
         * ```
         */
        type AIAttack = {
            /**
             * 使用的投射物实体
             */
            entity: String;
            /**
             * 发射数量
             */
            count: RangeValue;
            /**
             * 距离
             */
            distance: RangeValue;
            /**
             * 每次攻击的冷却时间
             */
            framesBetween: Number;
            /**
             * 全局攻击冷却
             */
            framesBetweenGlobal: Number;
            /**
             * 攻击状态持续时间
             */
            stateDurationFrames: Nunber;
            /**
             * 使用率
             */
            useProbability: Number;
        };
        /**
         * 变量存储组件
         * ```xml
         * <VariableStorageComponent>
         * ```
         */
        type VariableStorage = {
            string: String;
            bool: Boolean;
            float: Number;
            int: Number;
        };
        /**
         * 存在时间组件
         * ```xml
         * <LifetimeComponent>
         * ```
         */
        type Lifetime = {
            lifetime: RangeValue | Number;
        };
        /**
         * 基因组组件
         * ```xml
         * <GenomeDataComponent>
         * ```
         */
        type GenomeData = {
            /**
             * 食物链等级
             */
            foodChainRank: Number;
            /**
             * 阵营
             */
            herd: String;
            /**
             * 狂暴不攻击友方
             */
            berserkDontAttackriends: Boolean;
            /**
             * 肉食性
             */
            isPredator: Boolean;
        };
        /**
         * 实体加载组件
         * ```xml
         * <LoadEntitiesComponent>
         * ```
         */
        type LoadEntities = {
            count: RangeValue | Number;
        };
        /**
         * 范围伤害组件
         * ```xml
         * <AreaDamageComponent>
         * ```
         */
        type AreaDamage = {
            size: AABB;
            damage: DamageData;
            damageInterval: Number;
            /**
             * 半径(使用圆形领域)
             */
            circleRadius: Number;
        };
        /**
         * 受伤爆炸组件
         * ```xml
         * <ExplodeOnDamageComponent>
         * ```
         */
        type ExplodeOnDamage = {
            /**
             * 伤害(爆炸)
             */
            damage: Number;
            /**
             * 半径
             */
            radius: Number;
            /**
             * 爆炸有伤害
             */
            damageMortals: Boolean;
            /**
             * 受伤爆炸概率
             */
            explodeOnDamagePercent: Number;
            /**
             * 失效爆炸概率
             */
            explodeOnDeathPercent: Number;
            /**
             * 受损失效概率
             */
            physicsBodyModifiedDeathProbability: Number;
            /**
             * 损毁所需受损占比
             */
            physicsBodyDestructionRequired: Number;
            /**
             * 加载实体
             */
            entity?: String;
            /**
             * 击退系数
             */
            knockbackForce: Number;
        };
        /**
         * 爆炸组件
         * ```xml
         * <ExplosionComponent>
         * ```
         */
        type Explosion = {
            /**
             * 触发条件
             */
            trigger: "ON_HIT" | "ON_TIMER" | "ON_DEATH";
            /**
             * 伤害(爆炸)
             */
            damage: Number;
            /**
             * 半径
             */
            radius: Number;
            /**
             * 爆炸造成伤害
             */
            damageMortals: Boolean;
            /**
             * 加载实体
             */
            entity: String;
            /**
             * 击退系数
             */
            knockbackForce: Number;
            /**
             * 爆炸时清除具有本组件的实体
             */
            killEntity: Boolean;
            /**
             * 定时触发的延迟
             */
            delay: RangeValue;
        };
        /**
         * 爆炸组件
         * ```xml
         * <LightningComponent>
         * ```
         */
        type Lightning = {
            /**
             * 爆炸造成伤害
             */
            explosionDamageMortals: Boolean;
            /**
             * 爆炸具有闪电链?
             */
            explosionType: Boolean;
            /**
             * 视作投射物
             */
            isProjectile: Boolean;
            /**
             * 爆炸伤害
             */
            explosionDamage: Number;
            /**
             * 爆炸半径
             */
            explosionRadius: Number;
            /**
             * 爆炸加载实体
             */
            explosionEntity: String;
            /**
             * 爆炸击退系数
             */
            explosionKnockbackForce: Number;
        };
        /**
         * 范围效果组件
         * ```xml
         * <GameAreaEffectComponent>
         * ```
         */
        type GameAreaEffect = {
            /**
             * 半径
             */
            radius: Number;
            /**
             * 伤害间隔 (-1表示只生效一次)
             */
            cd: Number;
        };
        /**
         * 追踪组件
         * ```xml
         * <HomingComponent>
         * ```
         */
        type Homing = {
            /**
             * 追踪施法者(回旋镖)
             */
            targetWhoShot: Boolean;
            /**
             * 仅转向而不改变速度
             */
            justRotateWowardsTarget: Boolean;
            /**
             * 目标标签反选
             */
            predefinedTarget: Boolean;
            /**
             * 仅追踪根实体
             */
            lookForRootEntitiesOnly: Boolean;
            /**
             * 探测距离
             */
            distance: Number;
            targetingCoeff: Number;
            velocityMultiplier: Number;
            maxTurnRate: Number;
            /**
             * 追踪目标要拥有的标签
             */
            targetTag: String;
        };
        /**
         * 材料转化组件
         * ```xml
         * <MagicConvertMaterialComponent>
         * ```
         */
        type MagicConvertMaterial = {
            /**
             * 转化实体(对实体造成伤害)
             */
            convertEntities: Boolean;
            /**
             * 是圆形
             */
            isCircle: Boolean;
            /**
             * 无视原料类型
             */
            fromAnyMaterial: Boolean;
            /**
             * 完成后清除具有本组件的实体
             */
            killWhenFinished: Boolean;
            /**
             * 半径
             */
            radius: Number;
            /**
             * 原料
             */
            fromMaterial: String;
            /**
             * 产物
             */
            toMaterial: String;
            /**
             * 转化表
             */
            reaction: { [key: String]: String };
        };
        /**
         * 材料吞噬组件
         * ```xml
         * <CellEaterComponent>
         * ```
         */
        type CellEater = {
            eatDynamicPhysicsBodies: Boolean;
            limitedMaterials: Boolean;
            onlyStain: Boolean;
            radius: Number;
            eatProbability: Number;
            ignoredMaterial: String;
            ignoredMaterialTag: String;
            materials: Array<String>;
        };
        /**
         * 碰撞箱组件
         * ```xml
         * <HitboxComponent>
         * ```
         */
        type Hitbox = {
            size: AABB;
            damageMultiplier: Number;
        };
    }
}

type HTMLNoitaEntityElement = HTMLElement & {
    entityData: EntityData;
    contentUpdate: () => never;
    displayMode: "panel";
    entityId: String;
};

/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
export type Class = {
    prototype: HTMLElement;
    new (param?: EntityData | String): HTMLNoitaEntityElement;
    query: (id: String) => EntityData;
    getDataSection: (entityData: EntityData, extraData: { drawCount_Death: Number; drawCount_Hit: Number; drawCount_Timer: Number }) => HTMLElement;
};
