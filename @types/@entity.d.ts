import { HTMLNoitaElement } from "./@panel";
/** 实体数据 */
export type EntityData = {
    /** 实体id */
    id: string;
    /** 实体名称 */
    name: string;
    /** 标签 */
    tags: Array<string>;
    projectileComponent: EntityData.Component.Projectile;
    damageModelComponent: EntityData.Component.DamageModel;
    animalAIComponent: EntityData.Component.AnimalAI;
    variableStorageComponent: { [key: string]: EntityData.Component.VariableStorage };
    aIAttackComponent: Array<EntityData.Component.AIAttack>;
    lifetimeComponent: EntityData.Component.Lifetime;
    genomeDataComponent: EntityData.Component.GenomeData;
    loadEntitiesComponent: { [key: string]: EntityData.Component.LoadEntities };
    areaDamageComponent: Array<EntityData.Component.AreaDamage>;
    explodeOnDamageComponent: EntityData.Component.ExplodeOnDamage;
    explosionComponent: EntityData.Component.Explosion;
    lightningComponent: EntityData.Component.Lightning;
    gameAreaEffectComponent: EntityData.Component.GameAreaEffect;
    homingComponent: EntityData.Component.Homing;
    magicConvertMaterialComponent: Array<EntityData.Component.MagicConvertMaterial>;
    cellEaterComponent: Array<EntityData.Component.CellEater>;
    hitBoxComponent: EntityData.Component.Hitbox;
    velocityComponent: EntityData.Component.Velocity;
    gameEffectComponent: Array<EntityData.Component.GameEffect>;
    laserEmitterComponent: Array<EntityData.Component.LaserEmitter>;
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
            friendlyFire: boolean;
            /**
             * 爆炸造成伤害
             */
            explosionDamageMortals: boolean;
            /**
             * 爆炸无自伤
             */
            explosionDontDamageShooter: boolean;
            /**
             * 命中实体
             */
            collideWithEntities: boolean;
            /**
             * 命中地形
             */
            collideWithWorld: boolean;
            /**
             * 差速伤害加成
             */
            damageScaledBySpeed: boolean;
            /**
             * 接触液体时失效
             */
            dieOnLiquidCollision: boolean;
            /**
             * 低速时失效
             */
            dieOnLowVelocity: boolean;
            /**
             * 碰撞(命中)时失效
             */
            onCollisionDie: boolean;
            /**
             * 失效时爆炸
             */
            onDeathExplode: boolean;
            /**
             * 存在时间结束时爆炸
             */
            onLifetimeOutExplode: boolean;
            /**
             * 在碰撞时生成实体
             */
            onCollisionSpawnEntity: boolean;
            /**
             * 生成实体是投射物 (具备施法者信息)
             */
            spawnEntityIsProjectile: boolean;
            /**
             * 穿透实体
             */
            penetrateEntities: boolean;
            /**
             * 穿透地形
             */
            penetrateWorld: boolean;
            /**
             * 不产生命中
             */
            doMovetoUpdate: boolean;
            /**
             * 提供伤害
             */
            damage: DamageData;
            /**
             * 爆炸半径
             */
            explosionRadius: number;
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
            knockbackForce: number;
            /**
             * 弹跳次数
             */
            bounces: number;
            /**
             * 伤害间隔
             */
            damageInterval: number;
            /**
             * 榨血系数?
             */
            bloodCountMultiplier: number;
            /**
             * 安全时间
             */
            collideWithShooterFrames: number;
            /**
             * 游戏效果实体
             */
            damageGameEffectEntities: string;
            /**
             * 碰撞加载实体
             */
            collisionEntity: string;
            /**
             * 爆炸加载实体
             */
            explosionEntity: string;
            /**
             * 爆炸击退系数
             */
            explosionKnockbackForce: number;
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
            maxHp: number;
            /**
             * 血液材料
             */
            bloodMaterial: string;
            /**
             * 飞溅血液材料
             */
            bloodSprayMaterial: string;
            /**
             * 身体材料
             */
            ragdollMaterial: string;
            /**
             * 材料伤害表
             */
            materialDamageData: { [key: string]: number };
            /**
             * 肺容量
             */
            airInLungsMax: number;
            /**
             * 窒息伤害
             */
            airLackOfDamage: number;
            /**
             * 点燃概率
             */
            fireProbabilityOfIgnition: number;
            /**
             * 点燃伤害量
             */
            fireDamageIgnitedAmount: number;
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
            criticalDamageResistance: number;
            /**
             * 沾湿伤害量
             */
            wetStatusEffectDamage: number;
            /**
             * 承伤系数
             */
            damageMultipliers: DamageData;
            /**
             * 需要呼吸
             */
            airNeeded: boolean;
            /**
             * 始终燃烧
             */
            isOnFire: boolean;
            /**
             * 受到摔落伤害
             */
            fallingDamages: boolean;
            /**
             * 遗留尸体
             */
            createRagdoll: boolean;
            /**
             * 扣血显示
             */
            uiReportDamage: boolean;
            /**
             * 受冲击伤害
             */
            physicsObjectsDamage: boolean;
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
            dashDamage: number;
            /**
             * 冲撞距离
             */
            dashDistance: number;
            /**
             * 冲撞冷却时间
             */
            dashFramesCD: number;
            /**
             * 冲撞速度
             */
            dashSpeed: number;
            /**
             * 近战伤害
             */
            meleeDamage: RangeValue;
            /**
             * 近战最大距离
             */
            meleeMaxDistance: number;
            /**
             * 食物(回血)
             */
            food: string;
            /**
             * 只会反击
             */
            attackOnlyIfAttacked: boolean;
            /**
             * 可飞行
             */
            canFly: boolean;
            /**
             * 可行走
             */
            canWalk: boolean;
            /**
             * 有排泄行为
             */
            defecatesAndPees: boolean;
            /**
             * 同阵营误伤不还手
             */
            dontCounterAttackOwnHerd: boolean;
            /**
             * 寻底
             */
            senseCreatures: boolean;
            /**
             * 透视寻底
             */
            senseCreaturesThroughWalls: boolean;
            /**
             * 使用远程攻击攻击友方 (辅助形怪物)
             */
            triesToRangedAttackFriends: boolean;
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
            entity: string;
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
            framesBetween: number;
            /**
             * 全局攻击冷却
             */
            framesBetweenGlobal: number;
            /**
             * 攻击状态持续时间
             */
            stateDurationFrames: Nunber;
            /**
             * 使用率
             */
            useProbability: number;
        };
        /**
         * 变量存储组件
         * ```xml
         * <VariableStorageComponent>
         * ```
         */
        type VariableStorage = {
            string: string;
            bool: boolean;
            float: number;
            int: number;
        };
        /**
         * 存在时间组件
         * ```xml
         * <LifetimeComponent>
         * ```
         */
        type Lifetime = {
            lifetime: RangeValue | number;
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
            foodChainRank: number;
            /**
             * 阵营
             */
            herd: string;
            /**
             * 狂暴不攻击友方
             */
            berserkDontAttackriends: boolean;
            /**
             * 肉食性
             */
            isPredator: boolean;
        };
        /**
         * 实体加载组件
         * ```xml
         * <LoadEntitiesComponent>
         * ```
         */
        type LoadEntities = {
            count: RangeValue | number;
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
            damageInterval: number;
            /**
             * 半径(使用圆形领域)
             */
            circleRadius: number;
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
            damage: number;
            /**
             * 半径
             */
            radius: number;
            /**
             * 爆炸有伤害
             */
            damageMortals: boolean;
            /**
             * 受伤爆炸概率
             */
            explodeOnDamagePercent: number;
            /**
             * 失效爆炸概率
             */
            explodeOnDeathPercent: number;
            /**
             * 受损失效概率
             */
            physicsBodyModifiedDeathProbability: number;
            /**
             * 损毁所需受损占比
             */
            physicsBodyDestructionRequired: number;
            /**
             * 加载实体
             */
            entity?: string;
            /**
             * 击退系数
             */
            knockbackForce: number;
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
            damage: number;
            /**
             * 半径
             */
            radius: number;
            /**
             * 爆炸造成伤害
             */
            damageMortals: boolean;
            /**
             * 加载实体
             */
            entity: string;
            /**
             * 击退系数
             */
            knockbackForce: number;
            /**
             * 爆炸时清除具有本组件的实体
             */
            killEntity: boolean;
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
            explosionDamageMortals: boolean;
            /**
             * 爆炸具有闪电链?
             */
            explosionType: boolean;
            /**
             * 视作投射物
             */
            isProjectile: boolean;
            /**
             * 爆炸伤害
             */
            explosionDamage: number;
            /**
             * 爆炸半径
             */
            explosionRadius: number;
            /**
             * 爆炸加载实体
             */
            explosionEntity: string;
            /**
             * 爆炸击退系数
             */
            explosionKnockbackForce: number;
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
            radius: number;
            /**
             * 伤害间隔 (-1表示只生效一次)
             */
            cd: number;
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
            targetWhoShot: boolean;
            /**
             * 仅转向而不改变速度
             */
            justRotateWowardsTarget: boolean;
            /**
             * 目标标签反选
             */
            predefinedTarget: boolean;
            /**
             * 仅追踪根实体
             */
            lookForRootEntitiesOnly: boolean;
            /**
             * 探测距离
             */
            distance: number;
            targetingCoeff: number;
            velocityMultiplier: number;
            maxTurnRate: number;
            /**
             * 追踪目标要拥有的标签
             */
            targetTag: string;
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
            convertEntities: boolean;
            /**
             * 是圆形
             */
            isCircle: boolean;
            /**
             * 无视原料类型
             */
            fromAnyMaterial: boolean;
            /**
             * 完成后清除具有本组件的实体
             */
            killWhenFinished: boolean;
            /**
             * 半径
             */
            radius: number;
            /**
             * 转化表
             */
            convertMap: { [key: string]: string };
        };
        /**
         * 材料吞噬组件
         * ```xml
         * <CellEaterComponent>
         * ```
         */
        type CellEater = {
            eatDynamicPhysicsBodies: boolean;
            limitedMaterials: boolean;
            onlyStain: boolean;
            radius: number;
            eatProbability: number;
            ignoredMaterial: string;
            ignoredMaterialTag: string;
            materials: Array<string>;
        };
        /**
         * 碰撞箱组件
         * ```xml
         * <HitboxComponent>
         * ```
         */
        type Hitbox = {
            size: AABB;
            damageMultiplier: number;
        };

        /**
         * 速度组件
         * ```xml
         * <VelocityComponent>
         * ```
         */
        type Velocity = {
            airFriction: number;
            gravity: number;
            mass: number;
            speedMax: number;
        };

        /**
         * 游戏效果组件
         * ```xml
         * <GameEffectComponent>
         * ```
         */
        type GameEffect = {
            effectType: string;
            duration: number;
        };

        /**
         * 射线发射组件
         * ```xml
         * <LaserEmitterComponent>
         * ```
         */
        type LaserEmitter = {
            damage: number;
            destroyDurability: number;
            destroyEnergy: number;
            size: AABB;
            material: string;
        };
        /**
         * 物品拾取组件
         * ```xml
         * <ItemPickUpperComponent>
         * ```
         */
        type ItemPickUpper = {
            dropItems: boolean;
            isImmuneToKicks: boolean;
        };
    }
}

type HTMLNoitaEntityElement = HTMLNoitaElement & {
    entityData: EntityData;
    displayMode: "panel";
    entityId: string;
};

/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
export type Class = {
    prototype: HTMLElement;
    new (param?: EntityData | string): HTMLNoitaEntityElement;
    query: (id: string) => EntityData;
    queryByName: (id: string) => Array<EntityData>;
    queryByTag: (tag: string) => Array<EntityData>;
    queryByPath: (queryByTag) => Array<EntityData>;
    queryByComponent: (...components: string[]) => Array<EntityData>;
    getDataSection: (entityData: EntityData, extraData: { drawCount_Death: number; drawCount_Hit: number; drawCount_Timer: number }) => HTMLElement;
};
