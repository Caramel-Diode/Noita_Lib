/** @param {ElementNode<"damage_by_type"|"damage_multipliers">} element */
const toDamageData = element => {
    let defaultValue = -1;
    let type = "";
    let x = 1;
    if (element.tagName === "damage_by_type") {
        defaultValue = 0;
        type = "values";
        x = 25; //伤害值需要放大到25倍
    } else if (element.tagName === "damage_multipliers") {
        defaultValue = 1;
        type = "multipliers";
    }
    const damageData = new DamageData("", defaultValue, type);
    const attr = element.attr;
    /** 诅咒伤害 */
    damageData.curse = Number(attr.get("curse") ?? defaultValue) * x;
    /** 穿凿伤害 */
    damageData.drill = Number(attr.get("drill") ?? defaultValue) * x;
    /** 雷电伤害 */
    damageData.electricity = Number(attr.get("electricity") ?? defaultValue) * x;
    /** 爆炸伤害 */
    damageData.explosion = Number(attr.get("explosion") ?? defaultValue) * x;
    /** 火焰伤害 */
    damageData.fire = Number(attr.get("fire") ?? defaultValue) * x;
    /** 治疗伤害 */
    damageData.healing = Number(attr.get("healing") ?? defaultValue) * x;
    /** 冰冻伤害 */
    damageData.ice = Number(attr.get("ice") ?? defaultValue) * x;
    /** 近战伤害 */
    damageData.melee = Number(attr.get("melee") ?? defaultValue) * x;
    /** 过饱伤害 */
    damageData.overeating = Number(attr.get("overeating") ?? defaultValue) * x;
    /** 物理伤害 */
    damageData.physicsHit = Number(attr.get("physics_hit") ?? defaultValue) * x;
    /** 紫毒伤害 */
    damageData.poison = Number(attr.get("poison") ?? defaultValue) * x;
    /** 投射物伤害 */
    damageData.projectile = Number(attr.get("projectile") ?? defaultValue) * x;
    /** 绿毒伤害 */
    damageData.radioactive = Number(attr.get("radioactive") ?? defaultValue) * x;
    /** 切割伤害 */
    damageData.slice = Number(attr.get("slice") ?? defaultValue) * x;
    /** 神圣伤害 */
    damageData.holy = Number(attr.get("holy") ?? defaultValue) * x;
    return damageData;
};

/** 投射物爆炸配置 */
class ConfigExplosion {
    /** @param {ElementNode<"config_explosion">} element */
    constructor(element) {
        const attr = element.attr;
        /** 爆炸伤害(默认125) */
        this.damage = Number(attr.get("damage") ?? 5) * 25;
        /** 爆炸半径 */
        this.explosion_radius = Number(attr.get("explosion_radius") ?? 0);
        /** 能否炸伤生物 */
        this.damage_mortals = Number(attr.get("damage_mortals") ?? 1);
    }
}

/** 伤害暴击 */
class DamageCritical {
    /** @param {ElementNode<"damage_critical">} element */
    constructor(element) {
        const attr = element.attr;
        /** 暴击率 */
        this.chance = Number(attr.get("chance") ?? 0);
        /** 暴击伤害倍数 */
        this.damage_multiplier = Number(attr.get("damage_multiplier") ?? 1);
    }
}

/** 投射物组件 */
class ProjectileComponent {
    /** @param {ElementNode<"ProjectileComponent">} element */
    constructor(element) {
        const attr = element.attr;
        /** 存在时间 */
        this.lifetime = Number(attr.get("lifetime")) ?? -1;
        /** 存在时间波动 */
        this.lifetime_randomness = Number(attr.get("lifetime_randomness") ?? 0);
        /** 投射物飞行速度 - 最小值 */
        this.speed_min = Number(attr.get("speed_min") ?? 60);
        /** 投射物飞行速度 - 最大值 */
        this.speed_max = Number(attr.get("speed_max") ?? 60);
        /** 散射 */
        this.direction_random_rad = Number(attr.get("direction_random_rad") ?? 0);
        /** 弹跳次数 */
        this.bounces_left = Number(attr.get("bounces_left") ?? 0);
        /** 移动更新 (会导致投射物无法正常产生命中判定) */
        this.do_moveto_update = Number(attr.get("do_moveto_update") ?? 1);
        /** 低速时失效 */
        this.die_on_low_velocity = Number(attr.get("die_on_low_velocity") ?? 0);
        /** 爆炸不会伤害发射者 */
        this.explosion_dont_damage_shooter = Number(attr.get("explosion_dont_damage_shooter") ?? 0);
        /** 穿透地形 */
        this.penetrate_world = Number(attr.get("penetrate_world") ?? 0);
        /** 穿透实体 */
        this.penetrate_entities = Number(attr.get("penetrate_entities") ?? 0);
        /** 伤害频率 */
        this.damage_every_x_frames = Number(attr.get("damage_every_x_frames") ?? 1);
        /** 差速增伤 */
        this.damage_scaled_by_speed = Number(attr.get("damage_scaled_by_speed") ?? 0);
        /** 友方命中 */
        this.friendly_fire = Number(attr.get("friendly_fire") ?? 0);
        /** 伤害(投射物伤害) */
        this.damage = Number(attr.get("damage") ?? 0) * 25;
        /** 击退力度 */
        this.knockback_force = Number(attr.get("knockback_force") ?? 0);
        /** 不会命中玩家 */
        this.never_hit_player = Number(attr.get("never_hit_player") ?? 0);

        const _config_explosion = element.childNodes.query("config_explosion")[0];
        if (_config_explosion) /** @type {ConfigExplosion} */ this.config_explosion = new ConfigExplosion(_config_explosion);
        const _damage_by_type = element.childNodes.query("damage_by_type")[0];
        if (_damage_by_type) /** @type {DamageData} */ this.damage_by_type = toDamageData(_damage_by_type).toString();
        const _damage_critical = element.childNodes.query("_damage_critical")[0];
        if (_damage_critical) /** @type {DamageCritical} */ this.damage_critical = new DamageCritical(this.damage_critical);
    }
}

/** 动物AI组件(AI攻击组件) */
class AnimalAIComponent {
    /** @param {ElementNode<"AnimalAIComponent"|"AIAttackComponent">} element */
    constructor(element) {
        const attr = element.attr;
        /** 近战攻击距离 */
        this.attack_melee_max_distance = Number(attr.get("attack_melee_max_distance") ?? 20);
        /** 近战攻击间隔 */
        this.attack_melee_frames_between = Number(attr.get("attack_melee_frames_between") ?? 10);
        /** 近战攻击伤害 - 最小值 */
        this.attack_melee_damage_min = Number(attr.get("attack_melee_damage_min") ?? 0.4);
        /** 近战攻击伤害 - 最大值 */
        this.attack_melee_damage_max = Number(attr.get("attack_melee_damage_max") ?? 0.6);
        /** 冲撞攻击距离 */
        this.attack_dash_distance = Number(attr.get("attack_dash_distance") ?? 50);
        /** 冲撞攻击间隔 */
        this.attack_dash_frames_between = Number(attr.get("attack_dash_frames_between") ?? 120);
        /** 冲撞攻击伤害 */
        this.attack_dash_damage = Number(attr.get("attack_dash_damage") ?? 0.25);
        /** 冲撞速度 */
        this.attack_dash_speed = Number(attr.get("attack_dash_speed") ?? 200);
        /** 投射物攻击距离 - 最小值 */
        this.attack_ranged_min_distance = Number(attr.get("attack_ranged_min_distance") ?? attr.get("min_distance") ?? 10);
        /** 投射物攻击距离 - 最大值 */
        this.attack_ranged_max_distance = Number(attr.get("attack_ranged_max_distance") ?? attr.get("max_distance") ?? 160);
        /** 投射物攻击位置预判 */
        this.attack_ranged_predict = Number(attr.get("attack_ranged_predict") ?? 0);
        /** 投射物攻击-使用投射物 */
        this.attack_ranged_entity_file = Number(attr.get("attack_ranged_entity_file") ?? 0);
        /** 投射物攻击-投射物数量 - 最小值 */
        this.attack_ranged_entity_count_min = Number(attr.get("attack_ranged_entity_count_min") ?? 1);
        /** 投射物攻击-投射物数量 - 最大值 */
        this.attack_ranged_entity_count_max = Number(attr.get("attack_ranged_entity_count_max") ?? 1);
        /** 投射物攻击状态持续 */
        this.attack_ranged_state_duration_frames = Number(attr.get("attack_ranged_state_duration_frames") ?? 45);
        /** 投射物攻击间隔 */
        this.attack_ranged_frames_between = Number(attr.get("attack_ranged_frames_between") ?? 0);
        /** 该攻击方式的使用概率 */
        this.use_probability = Number(attr.get("use_probability") ?? 100);
        /** 攻击冷却 */
        this.frames_between = Number(attr.get("frames_between") ?? 180);
        /** 飞行能力 */
        this.can_fly = Number(attr.get("can_fly") ?? 1);
        /** 行走能力 */
        this.can_walk = Number(attr.get("can_walk") ?? 1);
    }
}

/** 伤害模型组件 */
class DamageModelComponent {
    /** @param {ElementNode<"DamageModelComponent">} element */
    constructor(element) {
        const attr = element.attr;
        /** 血上限 */
        this.max_hp = Number(attr.get("max_hp") ?? 0);
        /** 收到暴击伤害的伤害系数 */
        this.critical_damage_resistance = Number(attr.get("critical_damage_resistance") ?? 0);
        /** 能否收到衰落伤害 */
        this.falling_damages = Number(attr.get("falling_damages") ?? 0);
        /** 需要呼吸 */
        this.air_needed = Number(attr.get("air_needed") ?? 1);
        /** 可保存氧气量 */
        this.air_in_lungs_max = Number(attr.get("air_in_lungs_max") ?? 1);
        /** 窒息伤害(/s) */
        this.air_lack_of_damage = Number(attr.get("air_lack_of_damage") ?? 0.2);
        /** 是否会收到材料伤害 */
        this.materials_damage = Number(attr.get("materials_damage") ?? 1);
        /** 有害材料 */
        this.materials_that_damage = attr.get("materials_that_damage") ?? "acid";
        /** 有害材料对应伤害 */
        this.materials_how_much_damage =
            attr.get("materials_how_much_damage") ??
            this.materials_that_damage
                .split(",")
                .map(_ => 0.1)
                .join(",");
        /** 材料伤害为百分比模式 */
        this.materials_damage_proportional_to_maxhp = Number(attr.get("materials_damage_proportional_to_maxhp") ?? 0);
        /** 能否收到冲击伤害(石板) */
        this.physics_objects_damage = Number(attr.get("physics_objects_damage") ?? 0);
        /** 血液材料 */
        this.blood_material = attr.get("blood_material") ?? "blood_fading";
        /** 血液材料(喷射) */
        this.blood_spray_material = attr.get("blood_spray_material") ?? "blood_fading";
        /** 在液体中施放电流的概率 */
        this.in_liquid_shooting_electrify_prob = Number(attr.get("in_liquid_shooting_electrify_prob") ?? 0);
        /** 潮湿状态下收到的伤害 */
        this.wet_status_effect_damage = Number(attr.get("wet_status_effect_damage")) ?? 0;
        /** 点燃伤害(进入燃烧状态时的伤害) */
        this.fire_damage_ignited_amount = Number(attr.get("fire_damage_ignited_amount") ?? 0.0003);
        /** 燃烧持续伤害(所以这个是百分比吗) */
        this.fire_damage_amount = Number(attr.get("fire_damage_amount") ?? 0.2);
        const _damage_multipliers = element.childNodes.query("damage_multipliers")[0];
        if (_damage_multipliers) this.damage_multipliers = toDamageData(_damage_multipliers).toString();
    }
}

/** 存在时间组件 */
class LifetimeComponent {
    /** @param {ElementNode<"LifetimeComponent">} element */
    constructor(element) {
        const attr = element.attr;
        /** 存在时间 */
        this.lifetime = Number(attr.get("lifetime") ?? -1);
        /** 存在时间波动 */
        this.randomize_lifetime = Number(attr.get("randomize_lifetime") ?? 0);
    }
}

/** 蠕虫AI组件(蠕虫组件) */
class WormAIComponent {
    /** @param {ElementNode<"LifetimeComponent">} element */
    constructor(element) {
        const attr = element.attr;
        /** 常规移速 */
        this.speed = Number(attr.get("speed") ?? 1);
        /** 索敌半径 */
        this.hunt_box_radius = Number(attr.get("hunt_box_radius") ?? 512);
        /** 啃咬伤害 */
        this.bite_damage = Number(attr.get("bite_damage") ?? 1);
    }
}
