/** 实体数据 */
export type EntityData = {
    /** 实体id */
    id: String;
    /** 实体名称 */
    name: String;
    /** 投射物组件 */
    projectileComponent: EntityData.ProjectileComponent;
    /** 伤害模型组件 */
    damageModelComponent: EntityData.DamageModelComponent;
};

export namespace EntityData {
    type OfferedEntityData = {
        /** 实体数据 */ entityData: EntityData;
        /** 最小数量 */ num_min: Number;
        /** 最大数量 */ num_max: Number;
    };
    /** 投射物组件 */
    type ProjectileComponent = {
        /** 提供伤害 */ offeredDamage: DamageData;
        /** 爆炸半径 */ explosionRadius: Number;
        /** 散射角度 */ spreadDegrees: Number;
        /** 存在时间 */ lifetime: {
            /** 存在时间 - 基本值 */ base: Number;
            /** 存在时间 - 波动值 */ fluctuation: number;
        };
        /** 飞行速度 */ speed: NumberRang;
        /** 弹跳次数 */ bounces: Number;
        /** 击退力度 */ knockbackForce: Number;
        /** 命中友军 */ friendlyFire: Boolean;
        /** 炸伤友军 */ friendlyExplode: Boolean;
        /** 有差速伤害加成 */ speedDiffDamage: Boolean;
        /** 物理推力系数 */ physicsImpulseCoeff: Number;
        /** 生成材料 */ materialGenerate: String;
        /** 能否爆炸 */ canExplode: Boolean;
        /** 伤害频率 */ damageFrequency: Number;
        /** 提供投射物 */ offeredEntities: Array<EntityData.OfferedEntityData>;
    };
    /** 伤害模型组件 */
    type DamageModelComponent = {
        /** 最大生命值 */ maxHp: Number;
        /** 氧气储备 */ airInLungsMax: Number;
        /** 有害材料表 */ damageMaterialList: Array<String>;
        /** 血液材料 */ bloodMaterial: {
            /** 血液材料 - 受伤 */ hurt: String;
            /** 血液材料 - 死亡 */ dir: String;
        };
        /** 尸体材料 */ corpseMaterial: String;
        /** 承伤倍率 */ damageMultipler: DamageData;
    };
}

/** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
export type Class = {
    prototype: HTMLElement;
    new (param?: EntityData | String): {
        entityData: EntityData;
        contentUpdate: () => never;
    };
    queryById: (id: String) => EntityData;
};
