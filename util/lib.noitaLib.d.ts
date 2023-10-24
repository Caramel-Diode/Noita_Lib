interface NumberRang {
    /** 最小值 */
    min: Number;
    /** 最大值 */
    max: Number;
}
//#region 枚举声明

/** `🔤 法术ID` */
type SpellId_Enum = "BOMB" | "LIGHT_BULLET" | "LIGHT_BULLET_TRIGGER" | "LIGHT_BULLET_TRIGGER_2" | "LIGHT_BULLET_TIMER" | "BULLET" | "BULLET_TRIGGER" | "BULLET_TIMER" | "HEAVY_BULLET" | "HEAVY_BULLET_TRIGGER" | "HEAVY_BULLET_TIMER" | "AIR_BULLET" | "SLOW_BULLET" | "SLOW_BULLET_TRIGGER" | "SLOW_BULLET_TIMER" | "HOOK" | "BLACK_HOLE" | "BLACK_HOLE_DEATH_TRIGGER" | "BLACK_HOLE_BIG" | "WHITE_HOLE_BIG" | "BLACK_HOLE_GIGA" | "TENTACLE_PORTAL" | "SPITTER" | "SPITTER_TIMER" | "SPITTER_TIER_2" | "SPITTER_TIER_2_TIMER" | "SPITTER_TIER_3" | "SPITTER_TIER_3_TIMER" | "BUBBLESHOT" | "BUBBLESHOT_TRIGGER" | "DISC_BULLET" | "DISC_BULLET_BIG" | "DISC_BULLET_BIGGER" | "BOUNCY_ORB" | "BOUNCY_ORB_TIMER" | "RUBBER_BALL" | "ARROW" | "POLLEN" | "LANCE" | "LANCE_HOLY" | "ROCKET" | "ROCKET_TIER_2" | "ROCKET_TIER_3" | "GRENADE" | "GRENADE_TRIGGER" | "GRENADE_TIER_2" | "GRENADE_TIER_3" | "GRENADE_ANTI" | "GRENADE_LARGE" | "MINE" | "MINE_DEATH_TRIGGER" | "PIPE_BOMB" | "PIPE_BOMB_DEATH_TRIGGER" | "FISH" | "EXPLODING_DEER" | "EXPLODING_DUCKS" | "WORM_SHOT" | "BOMB_DETONATOR" | "LASER" | "MEGALASER" | "LIGHTNING" | "BALL_LIGHTNING" | "LASER_EMITTER" | "LASER_EMITTER_FOUR" | "LASER_EMITTER_CUTTER" | "DIGGER" | "POWERDIGGER" | "CHAINSAW" | "LUMINOUS_DRILL" | "LASER_LUMINOUS_DRILL" | "TENTACLE" | "TENTACLE_TIMER" | "HEAL_BULLET" | "SPIRAL_SHOT" | "MAGIC_SHIELD" | "BIG_MAGIC_SHIELD" | "CHAIN_BOLT" | "FIREBALL" | "METEOR" | "FLAMETHROWER" | "ICEBALL" | "SLIMEBALL" | "DARKFLAME" | "MISSILE" | "FUNKY_SPELL" | "PEBBLE" | "DYNAMITE" | "GLITTER_BOMB" | "BUCKSHOT" | "FREEZING_GAZE" | "GLOWING_BOLT" | "SPORE_POD" | "GLUE_SHOT" | "BOMB_HOLY" | "BOMB_HOLY_GIGA" | "PROPANE_TANK" | "BOMB_CART" | "CURSED_ORB" | "EXPANDING_ORB" | "CRUMBLING_EARTH" | "SUMMON_ROCK" | "SUMMON_EGG" | "SUMMON_HOLLOW_EGG" | "TNTBOX" | "TNTBOX_BIG" | "SWARM_FLY" | "SWARM_FIREBUG" | "SWARM_WASP" | "FRIEND_FLY" | "ACIDSHOT" | "THUNDERBALL" | "FIREBOMB" | "SOILBALL" | "DEATH_CROSS" | "DEATH_CROSS_BIG" | "INFESTATION" | "WALL_HORIZONTAL" | "WALL_VERTICAL" | "WALL_SQUARE" | "TEMPORARY_WALL" | "TEMPORARY_PLATFORM" | "PURPLE_EXPLOSION_FIELD" | "DELAYED_SPELL" | "LONG_DISTANCE_CAST" | "TELEPORT_CAST" | "SUPER_TELEPORT_CAST" | "CASTER_CAST" | "MIST_RADIOACTIVE" | "MIST_ALCOHOL" | "MIST_SLIME" | "MIST_BLOOD" | "CIRCLE_FIRE" | "CIRCLE_ACID" | "CIRCLE_OIL" | "CIRCLE_WATER" | "MATERIAL_WATER" | "MATERIAL_OIL" | "MATERIAL_BLOOD" | "MATERIAL_ACID" | "MATERIAL_CEMENT" | "TELEPORT_PROJECTILE" | "TELEPORT_PROJECTILE_SHORT" | "TELEPORT_PROJECTILE_STATIC" | "SWAPPER_PROJECTILE" | "TELEPORT_PROJECTILE_CLOSER" | "NUKE" | "NUKE_GIGA" | "FIREWORK" | "SUMMON_WANDGHOST" | "TOUCH_GOLD" | "TOUCH_WATER" | "TOUCH_OIL" | "TOUCH_ALCOHOL" | "TOUCH_BLOOD" | "TOUCH_SMOKE" | "DESTRUCTION" | "BURST_2" | "BURST_3" | "BURST_4" | "BURST_8" | "BURST_X" | "SCATTER_2" | "SCATTER_3" | "SCATTER_4" | "I_SHAPE" | "Y_SHAPE" | "T_SHAPE" | "W_SHAPE" | "CIRCLE_SHAPE" | "PENTAGRAM_SHAPE" | "I_SHOT" | "Y_SHOT" | "T_SHOT" | "W_SHOT" | "QUAD_SHOT" | "PENTA_SHOT" | "HEXA_SHOT" | "SPREAD_REDUCE" | "HEAVY_SPREAD" | "RECHARGE" | "LIFETIME" | "LIFETIME_DOWN" | "NOLLA" | "SLOW_BUT_STEADY" | "EXPLOSION_REMOVE" | "EXPLOSION_TINY" | "LASER_EMITTER_WIDER" | "MANA_REDUCE" | "BLOOD_MAGIC" | "MONEY_MAGIC" | "BLOOD_TO_POWER" | "DUPLICATE" | "QUANTUM_SPLIT" | "GRAVITY" | "GRAVITY_ANTI" | "SINEWAVE" | "CHAOTIC_ARC" | "PINGPONG_PATH" | "AVOIDING_ARC" | "FLOATING_ARC" | "FLY_DOWNWARDS" | "FLY_UPWARDS" | "HORIZONTAL_ARC" | "LINE_ARC" | "ORBIT_SHOT" | "SPIRALING_SHOT" | "PHASING_ARC" | "TRUE_ORBIT" | "BOUNCE" | "REMOVE_BOUNCE" | "HOMING" | "ANTI_HOMING" | "HOMING_WAND" | "HOMING_SHORT" | "HOMING_ROTATE" | "HOMING_SHOOTER" | "AUTOAIM" | "HOMING_ACCELERATING" | "HOMING_CURSOR" | "HOMING_AREA" | "PIERCING_SHOT" | "CLIPPING_SHOT" | "DAMAGE" | "DAMAGE_RANDOM" | "BLOODLUST" | "DAMAGE_FOREVER" | "CRITICAL_HIT" | "AREA_DAMAGE" | "SPELLS_TO_POWER" | "ESSENCE_TO_POWER" | "ZERO_DAMAGE" | "HEAVY_SHOT" | "LIGHT_SHOT" | "KNOCKBACK" | "RECOIL" | "RECOIL_DAMPER" | "SPEED" | "ACCELERATING_SHOT" | "DECELERATING_SHOT" | "EXPLOSIVE_PROJECTILE" | "WATER_TO_POISON" | "BLOOD_TO_ACID" | "LAVA_TO_BLOOD" | "LIQUID_TO_EXPLOSION" | "TOXIC_TO_ACID" | "STATIC_TO_SAND" | "TRANSMUTATION" | "RANDOM_EXPLOSION" | "NECROMANCY" | "LIGHT" | "EXPLOSION" | "EXPLOSION_LIGHT" | "FIRE_BLAST" | "POISON_BLAST" | "ALCOHOL_BLAST" | "THUNDER_BLAST" | "BERSERK_FIELD" | "POLYMORPH_FIELD" | "CHAOS_POLYMORPH_FIELD" | "ELECTROCUTION_FIELD" | "FREEZE_FIELD" | "REGENERATION_FIELD" | "TELEPORTATION_FIELD" | "LEVITATION_FIELD" | "SHIELD_FIELD" | "PROJECTILE_TRANSMUTATION_FIELD" | "PROJECTILE_THUNDER_FIELD" | "PROJECTILE_GRAVITY_FIELD" | "VACUUM_POWDER" | "VACUUM_LIQUID" | "VACUUM_ENTITIES" | "SEA_LAVA" | "SEA_ALCOHOL" | "SEA_OIL" | "SEA_WATER" | "SEA_SWAMP" | "SEA_ACID" | "SEA_ACID_GAS" | "CLOUD_WATER" | "CLOUD_OIL" | "CLOUD_BLOOD" | "CLOUD_ACID" | "CLOUD_THUNDER" | "ELECTRIC_CHARGE" | "MATTER_EATER" | "FREEZE" | "HITFX_BURNING_CRITICAL_HIT" | "HITFX_CRITICAL_WATER" | "HITFX_CRITICAL_OIL" | "HITFX_CRITICAL_BLOOD" | "HITFX_TOXIC_CHARM" | "HITFX_EXPLOSION_SLIME" | "HITFX_EXPLOSION_SLIME_GIGA" | "HITFX_EXPLOSION_ALCOHOL" | "HITFX_EXPLOSION_ALCOHOL_GIGA" | "HITFX_PETRIFY" | "ROCKET_DOWNWARDS" | "ROCKET_OCTAGON" | "FIZZLE" | "BOUNCE_EXPLOSION" | "BOUNCE_SPARK" | "BOUNCE_LASER" | "BOUNCE_LASER_EMITTER" | "BOUNCE_LARPA" | "BOUNCE_SMALL_EXPLOSION" | "BOUNCE_LIGHTNING" | "BOUNCE_HOLE" | "FIREBALL_RAY" | "LIGHTNING_RAY" | "TENTACLE_RAY" | "LASER_EMITTER_RAY" | "FIREBALL_RAY_LINE" | "FIREBALL_RAY_ENEMY" | "LIGHTNING_RAY_ENEMY" | "TENTACLE_RAY_ENEMY" | "GRAVITY_FIELD_ENEMY" | "CURSE" | "CURSE_WITHER_PROJECTILE" | "CURSE_WITHER_EXPLOSION" | "CURSE_WITHER_MELEE" | "CURSE_WITHER_ELECTRICITY" | "ORBIT_DISCS" | "ORBIT_FIREBALLS" | "ORBIT_NUKES" | "ORBIT_LASERS" | "ORBIT_LARPA" | "CHAIN_SHOT" | "ARC_ELECTRIC" | "ARC_FIRE" | "ARC_GUNPOWDER" | "ARC_POISON" | "CRUMBLING_EARTH_PROJECTILE" | "X_RAY" | "UNSTABLE_GUNPOWDER" | "ACID_TRAIL" | "POISON_TRAIL" | "OIL_TRAIL" | "WATER_TRAIL" | "GUNPOWDER_TRAIL" | "FIRE_TRAIL" | "BURN_TRAIL" | "TORCH" | "TORCH_ELECTRIC" | "ENERGY_SHIELD" | "ENERGY_SHIELD_SECTOR" | "ENERGY_SHIELD_SHOT" | "TINY_GHOST" | "OCARINA_A" | "OCARINA_B" | "OCARINA_C" | "OCARINA_D" | "OCARINA_E" | "OCARINA_F" | "OCARINA_GSHARP" | "OCARINA_A2" | "KANTELE_A" | "KANTELE_D" | "KANTELE_DIS" | "KANTELE_E" | "KANTELE_G" | "RANDOM_SPELL" | "RANDOM_PROJECTILE" | "RANDOM_MODIFIER" | "RANDOM_STATIC_PROJECTILE" | "DRAW_RANDOM" | "DRAW_RANDOM_X3" | "DRAW_3_RANDOM" | "ALL_NUKES" | "ALL_DISCS" | "ALL_ROCKETS" | "ALL_DEATHCROSSES" | "ALL_BLACKHOLES" | "ALL_ACID" | "ALL_SPELLS" | "SUMMON_PORTAL" | "ADD_TRIGGER" | "ADD_TIMER" | "ADD_DEATH_TRIGGER" | "LARPA_CHAOS" | "LARPA_DOWNWARDS" | "LARPA_UPWARDS" | "LARPA_CHAOS_2" | "LARPA_DEATH" | "ALPHA" | "GAMMA" | "TAU" | "OMEGA" | "MU" | "PHI" | "SIGMA" | "ZETA" | "DIVIDE_2" | "DIVIDE_3" | "DIVIDE_4" | "DIVIDE_10" | "METEOR_RAIN" | "WORM_RAIN" | "RESET" | "IF_ENEMY" | "IF_PROJECTILE" | "IF_HP" | "IF_HALF" | "IF_END" | "IF_ELSE" | "COLOUR_RED" | "COLOUR_ORANGE" | "COLOUR_GREEN" | "COLOUR_YELLOW" | "COLOUR_PURPLE" | "COLOUR_BLUE" | "COLOUR_RAINBOW" | "COLOUR_INVIS" | "RAINBOW_TRAIL";

/** `🔤 法术名称` */
type SpellName_Enum = "炸弹" | "火花弹" | "触发火花弹" | "双重触发火花弹" | "定时火花弹" | "魔法箭" | "触发魔法箭" | "定时魔法箭" | "魔法弹" | "触发魔法弹" | "定时魔法弹" | "强气流" | "能量球" | "触发能量球" | "定时能量球" | "钩爪" | "黑洞" | "失效触发黑洞" | "巨型黑洞" | "巨型白洞" | "终极黑洞" | "怪异传送门" | "分裂弹" | "定时分裂弹" | "大型分裂弹" | "定时大型分裂弹" | "巨型分裂弹" | "定时巨型分裂弹" | "泡泡火花" | "触发泡泡火花" | "小锯片" | "大型锯片" | "终极锯片" | "能量球体" | "定时能量球体" | "橡皮绿豆" | "箭矢" | "孢子球" | "闪耀长枪" | "神圣长枪" | "魔法飞弹" | "大型魔法飞弹" | "巨型魔法飞弹" | "火焰弹" | "触发火焰弹" | "大型火焰弹" | "巨型火焰弹" | "怪异火焰弹" | "坠落火焰弹" | "不稳晶体" | "失效触发不稳晶体" | "休眠晶体" | "失效触发休眠晶体" | "召唤鱼" | "诱饵鹿" | "鸭群" | "蠕虫发射器" | "炸药引爆器" | "汇聚之光" | "高能汇聚之光" | "雷击" | "球状闪电" | "电浆束" | "电浆束十字" | "电浆切割器" | "挖掘魔弹" | "挖掘爆破" | "链锯" | "光明穿凿" | "定时光明穿凿" | "触手" | "定时触手" | "治疗魔弹" | "螺旋魔弹" | "魔法护卫" | "大型魔法护卫" | "连锁魔弹" | "火球" | "陨石" | "火焰喷射器" | "冰球" | "粘液球" | "黑焰" | "导弹" | "？？？" | "岩石精灵" | "炸药" | "闪烁炸弹" | "三联魔弹" | "冰冷凝视" | "聚爆光束" | "多刺孢子荚" | "胶球" | "神圣炸弹" | "巨型神圣炸弹" | "丙烷罐" | "炸弹矿车" | "诅咒之球" | "扩张之球" | "召唤地震" | "岩石" | "蛋" | "空心蛋" | "炸药箱" | "大炸药箱" | "召唤苍蝇群" | "召唤萤火虫群" | "召唤黄蜂群" | "召唤苍蝇伙伴" | "酸液球" | "雷霆放射" | "微型火焰弹" | "一把泥土" | "死亡十字" | "巨型死亡十字" | "侵扰" | "水平粒子屏障" | "垂直粒子屏障" | "方形粒子屏障" | "召唤墙壁" | "召唤平台" | "盛大场面" | "延迟施放" | "远距离施放" | "传送施放" | "跳跃施放" | "本体施法" | "毒雾" | "酒雾" | "粘液雾" | "血雾" | "烈火之环" | "酸液之环" | "油液之环" | "清水之环" | "水滴" | "油滴" | "血滴" | "酸滴" | "水泥" | "传送魔弹" | "小传送魔弹" | "返回传送魔弹" | "交换传送魔弹" | "抓取传送魔弹" | "核弹" | "巨型核弹" | "烟花" | "召唤魔杖灵" | "黄金之触" | "清水之触" | "油液之触" | "烈酒之触" | "鲜血之触" | "烟雾之触" | "毁灭" | "二重施放" | "三重施放" | "四重施放" | "八重施放" | "穷尽施放" | "二重散射施放" | "三重散射施放" | "四重散射施放" | "阵型 - 前后" | "阵型 - 分叉" | "阵型 - 半圆" | "阵型 - 三叉" | "阵型 - 六边形" | "阵型 - 五边形" | "阵型拉帕 - 前后" | "阵型拉帕 - 分叉" | "阵型拉帕 - 半圆" | "阵型拉帕 - 三叉" | "阵型拉帕 - 十字" | "阵型拉帕 - 五边形" | "阵型拉帕 - 六边形" | "降低散射" | "强烈散射" | "缩减充能时间" | "延长存在时间" | "缩减存在时间" | "零时" | "缓慢但坚定" | "移除爆炸" | "聚爆" | "电浆束增强器" | "提升法力" | "血液魔法" | "黄金转伤害" | "血液转伤害" | "法术复制" | "量子分割" | "重力" | "反重力" | "蛇形路径" | "混沌路径" | "乒乓路径" | "规避路径" | "悬浮" | "向下飞行" | "向上飞行" | "水平路径" | "线性路径" | "圆环路径" | "螺旋路径" | "相位" | "自我环绕" | "弹跳" | "移除弹跳" | "追踪" | "避让" | "追踪法杖" | "短距离追踪" | "转向敌人" | "回旋镖" | "自动瞄准" | "加速追踪" | "瞄准路径" | "传送追踪" | "穿刺" | "穿墙" | "伤害增强" | "随机伤害" | "嗜血" | "法力转伤害" | "暴击增强" | "伤害领域" | "法术转伤害" | "精华转伤害" | "移除伤害" | "沉重一击" | "轻盈一击" | "击退" | "后座力" | "后座阻尼器" | "加速" | "逐渐加速" | "逐渐减速" | "易爆" | "化水为毒" | "溶血为酸" | "熔岩化血" | "液体引爆" | "毒液酸化" | "化地为沙" | "混沌转化" | "混沌魔法" | "死灵术" | "光" | "爆炸" | "魔法爆炸" | "火焰爆炸" | "毒液爆炸" | "烈酒爆炸" | "雷霆爆炸" | "激情之环" | "变形之环" | "不稳变化之环" | "雷电之环" | "静止之环" | "活力之环" | "位移之环" | "浮力之环" | "遮蔽之环" | "投射物无害化领域" | "投射物雷电化领域" | "投射物引力领域" | "粉末真空场" | "液体真空场" | "实体真空场" | "岩浆之海" | "酒之海" | "油之海" | "水之海" | "沼泽之海" | "酸液之海" | "可燃气体之海" | "雨云" | "油云" | "血云" | "酸云" | "雷云" | "电荷" | "物质吞噬者" | "冰冻" | "燃烧暴击" | "潮湿暴击" | "油污暴击" | "染血暴击" | "毒液魅惑" | "粘液爆炸" | "粘液巨型爆炸" | "醉酒爆炸" | "醉酒巨型爆炸" | "石化" | "下方向集束魔弹" | "八角形集束魔弹" | "闪灭" | "易爆弹跳" | "泡泡弹跳" | "激光弹跳" | "电浆束弹跳" | "拉帕弹跳" | "闪烁弹跳" | "雷电弹跳" | "吞噬弹跳" | "火球发射器" | "闪电发射器" | "触手怪" | "电浆束发射器" | "双向火球发射器" | "专属火球发射器" | "专属闪电发射器" | "专属触手怪" | "专属重力场" | "猛毒诅咒" | "虚弱诅咒 - 投射物" | "虚弱诅咒 - 爆炸" | "虚弱诅咒 - 近战" | "虚弱诅咒 - 雷电" | "锯片环绕" | "火球环绕" | "核弹环绕" | "电浆束环绕" | "环绕拉帕" | "连锁" | "电弧" | "火焰弧" | "火药弧" | "毒液弧" | "地震" | "全知之眼" | "爆竹" | "酸液轨迹" | "毒液轨迹" | "油液轨迹" | "清水轨迹" | "火药轨迹" | "火焰轨迹" | "燃烧" | "火把" | "电子火把" | "能量盾" | "半圆能量盾" | "投射物能量盾" | "迷你幽灵" | "陶笛 - A" | "陶笛 - B" | "陶笛 - C" | "陶笛 - D" | "陶笛 - E" | "陶笛 - F" | "陶笛 - G#" | "陶笛 - A" | "康特勒琴 - A" | "康特勒琴 - D" | "康特勒琴 - DIS" | "康特勒琴 - E" | "康特勒琴 - G" | "随机法术" | "随机投射物" | "随机修正" | "随机静态投射物" | "复制随机法术" | "复制随机法术三次" | "复制三个随机法术" | "核弹置换术" | "大型锯片置换术" | "魔法飞弹置换术" | "死亡十字置换术" | "黑洞置换术" | "酸液置换术" | "万物终结" | "召唤传送门" | "追加触发" | "追加定时触发" | "追加失效触发" | "混沌拉帕" | "下方向拉帕" | "上方向拉帕" | "轨迹拉帕" | "爆炸拉帕" | "阿尔法" | "伽马" | "陶" | "欧米伽" | "谬" | "斐" | "西格玛" | "泽塔" | "一分为二" | "一分为三" | "一分为四" | "一分为十" | "陨石雨" | "蠕虫雨" | "魔杖刷新" | "条件 - 敌人数量" | "条件 - 投射物数量" | "条件 - 低生命值" | "条件 - 每隔两次" | "条件 - 结束" | "条件 - 否则" | "红色闪光" | "橙色闪光" | "绿色闪光" | "黄色闪光" | "紫色闪光" | "蓝色闪光" | "彩虹闪光" | "隐形法术" | "彩虹轨迹";
//#endregion

/** `🔤 法术标签` */
type spellTag_Enum = "#all" | "#type_projectile" | "#type_staticProjectile" | "#type_modifier" | "#type_drawMany" | "#type_material" | "#type_other" | "#type_utility" | "#type_passive" | "#level_0" | "#level_1" | "#level_2" | "#level_3" | "#level_4" | "#level_5" | "#level_6" | "#level_7" | "#level_10" | "#draw" | "#draw_common" | "#draw_hit" | "#draw_timer" | "#draw_death" | "#lifetime_mod" | "#lifetime_up" | "#lifetime_down" | "#mana_0" | "#mana_drainlowly" | "#mana_increase" | "#speed_mod" | "#damage_mod" | "#damage_mod_projectile" | "#damage_mod_melee" | "#damage_mod_electricity" | "#damage_mod_fire" | "#damage_mod_explosion" | "#damage_mod_ice" | "#damage_mod_slice" | "#damage_mod_healing" | "#damage_mod_curse" | "#damage_mod_drill" | "#damage_mod_holy";

/** `🔤 法术类型` */
type spellType_Enum = "projectile" | "staticProjectile" | "modifier" | "drawMany" | "material" | "other" | "utility" | "passive";

/** `🔤 天赋ID` */
type perkId_Enum = "CRITICAL_HIT" | "BREATH_UNDERWATER" | "EXTRA_MONEY" | "EXTRA_MONEY_TRICK_KILL" | "GOLD_IS_FOREVER" | "TRICK_BLOOD_MONEY" | "EXPLODING_GOLD" | "HOVER_BOOST" | "FASTER_LEVITATION" | "MOVEMENT_FASTER" | "STRONG_KICK" | "TELEKINESIS" | "REPELLING_CAPE" | "EXPLODING_CORPSES" | "SAVING_GRACE" | "INVISIBILITY" | "GLOBAL_GORE" | "REMOVE_FOG_OF_WAR" | "LEVITATION_TRAIL" | "VAMPIRISM" | "EXTRA_HP" | "HEARTS_MORE_EXTRA_HP" | "GLASS_CANNON" | "LOW_HP_DAMAGE_BOOST" | "RESPAWN" | "WORM_ATTRACTOR" | "RADAR_ENEMY" | "FOOD_CLOCK" | "IRON_STOMACH" | "WAND_RADAR" | "ITEM_RADAR" | "MOON_RADAR" | "MAP" | "PROTECTION_FIRE" | "PROTECTION_RADIOACTIVITY" | "PROTECTION_EXPLOSION" | "PROTECTION_MELEE" | "PROTECTION_ELECTRICITY" | "TELEPORTITIS" | "TELEPORTITIS_DODGE" | "STAINLESS_ARMOUR" | "EDIT_WANDS_EVERYWHERE" | "NO_WAND_EDITING" | "WAND_EXPERIMENTER" | "ADVENTURER" | "ABILITY_ACTIONS_MATERIALIZED" | "PROJECTILE_HOMING" | "PROJECTILE_HOMING_SHOOTER" | "UNLIMITED_SPELLS" | "FREEZE_FIELD" | "FIRE_GAS" | "DISSOLVE_POWDERS" | "BLEED_SLIME" | "BLEED_OIL" | "BLEED_GAS" | "SHIELD" | "REVENGE_EXPLOSION" | "REVENGE_TENTACLE" | "REVENGE_RATS" | "REVENGE_BULLET" | "ATTACK_FOOT" | "LEGGY_FEET" | "PLAGUE_RATS" | "VOMIT_RATS" | "CORDYCEPS" | "MOLD" | "WORM_SMALLER_HOLES" | "PROJECTILE_REPULSION" | "RISKY_CRITICAL" | "FUNGAL_DISEASE" | "PROJECTILE_SLOW_FIELD" | "PROJECTILE_REPULSION_SECTOR" | "PROJECTILE_EATER_SECTOR" | "ORBIT" | "ANGRY_GHOST" | "HUNGRY_GHOST" | "DEATH_GHOST" | "HOMUNCULUS" | "LUKKI_MINION" | "ELECTRICITY" | "ATTRACT_ITEMS" | "EXTRA_KNOCKBACK" | "LOWER_SPREAD" | "LOW_RECOIL" | "BOUNCE" | "FAST_PROJECTILES" | "ALWAYS_CAST" | "EXTRA_MANA" | "NO_MORE_SHUFFLE" | "NO_MORE_KNOCKBACK" | "DUPLICATE_PROJECTILE" | "FASTER_WANDS" | "EXTRA_SLOTS" | "CONTACT_DAMAGE" | "EXTRA_PERK" | "PERKS_LOTTERY" | "GAMBLE" | "EXTRA_SHOP_ITEM" | "GENOME_MORE_HATRED" | "GENOME_MORE_LOVE" | "PEACE_WITH_GODS" | "MANA_FROM_KILLS" | "ANGRY_LEVITATION" | "LASER_AIM" | "PERSONAL_LASER" | "MEGA_BEAM_STONE" | "ESSENCE_AIR" | "ESSENCE_ALCOHOL" | "ESSENCE_FIRE" | "ESSENCE_LASER" | "ESSENCE_WATER";

/** `🔤 天赋名称` */
type perkName_Enum = "暴击率 +" | "屏息静气" | "贪婪" | "技巧贪婪" | "永恒黄金" | "技巧血金" | "爆炸黄金" | "强漂浮力" | "更快漂浮" | "更快移动" | "坚持练腿" | "念力踢击" | "驱散斗篷" | "爆尸" | "死里逃生" | "隐身" | "更多血液" | "全视之眼" | "悬浮尾迹" | "吸血术" | "额外生命值（一次性）" | "更强大的心" | "玻璃大炮" | "刀尖舔血" | "额外生命（一次性）" | "蠕虫吸引" | "敌人雷达" | "素食主义" | "铁胃" | "魔杖雷达" | "物品雷达" | "探月雷达" | "空间感知" | "火焰免疫" | "绿毒免疫" | "爆炸免疫" | "近战免疫" | "雷电免疫" | "受伤传送" | "传送闪避" | "光洁铠甲" | "随时修改魔杖" | "无法修改魔杖" | "魔杖实验家" | "健康探索" | "手持炸弹" | "追踪法术" | "回旋法术" | "无限法术" | "冰冻领域" | "气体自燃" | "粉末消融" | "粘稠血液" | "油性血液" | "瓦斯之血" | "永久护盾" | "复仇爆炸" | "复仇触手" | "复仇鼠群" | "复仇子弹" | "蛛腿突变" | "猪腿变异" | "瘟疫鼠群" | "自然再生" | "虫草" | "真菌种群" | "移除虫洞" | "投射物排斥领域" | "千钧一发" | "真菌疾病" | "投射物减速领域" | "投射物排斥扇面" | "投射物吞噬者" | "相位穿越" | "愤怒幽灵" | "饥饿幽灵" | "哀伤灵魂" | "人造生命" | "蜘蛛仆从" | "雷电之体" | "吸金大法" | "击退法术" | "汇聚法术" | "低后座力" | "弹跳法术" | "更快的投射物" | "始终施放（一次性）" | "高魔低容（一次性）" | "不再乱序" | "不再击退" | "投射物复制" | "魔杖加速（一次性）" | "魔杖扩容（一次性）" | "近身伤害" | "更多天赋选项" | "天赋博彩" | "赌博（一次性" | "额外圣山物品" | "更多仇恨" | "更多友爱" | "与神和解" | "化尸为魔" | "愤怒漂浮" | "激光瞄具" | "手持电浆束" | "召唤光石（一次性）" | "气之精粹" | "酒之精粹" | "火之精粹" | "土之精粹" | "水之精粹";

/** `🔤 法杖名称` */
type wandName_Enum = "初始攻击杖" | "初始炸弹杖" | "长笛" | "康特勒琴" | "狗鱼下颚骨" | "康特勒琴(狗鱼下颚骨强化)" | "桑拿拂尘" | "桦木拂尘" | "迅捷之杖" | "毁灭之杖" | "群体之杖" | "闪光实验性魔杖" | "条件实验性魔杖" | "机枪实验性魔杖" | "拐杖" | "玫瑰" | "权杖" | "许愿骨" | "魔法扫帚";
//#endregion

/** 伤害相关数据 */
interface DamageData {
    /** 投射物 */
    projectile: Number;
    /** 近战 */
    melee: Number;
    /** 雷电 */
    electricity: Number;
    /** 火焰 */
    fire: Number;
    /** 爆炸 */
    explosion: Number;
    /** 冰冻 */
    ice: Number;
    /** 切割 */
    slice: Number;
    /** 治疗 */
    healing: Number;
    /** 诅咒 */
    curse: Number;
    /** 穿凿 */
    drill: Number;
    /** 神圣 */
    holy: Number;
    /** 过饱 */
    overeating: Number;
    /** 物理 */
    physicsHit: Number;
    /** 剧毒 */
    poison: Number;
    /** 辐射 */
    radioactive: Number;
}

/** 实体数据 */
interface EntityData {
    /** 实体id */
    id: String;
    /** 实体名称 */
    name: String;
    /** 投射物组件 */
    projectileComponent: {
        /** 提供伤害 */
        offeredDamage: DamageData;
        /** 爆炸半径 */
        explosionRadius: Number;
        /** 散射角度 */
        spreadDegrees: Number;
        /** 存在时间 */
        lifetime: {
            /** 存在时间 - 基本值 */
            base: Number;
            /** 存在时间 - 波动值 */
            fluctuation: number;
        };
        /** 飞行速度 */
        speed: NumberRang;
        /** 弹跳次数 */
        bounces: Number;
        /** 击退力度 */
        knockbackForce: Number;
        /** 命中友军 */
        friendlyFire: Boolean;
        /** 炸伤友军 */
        friendlyExplode: Boolean;
        /** 有差速伤害加成 */
        speedDiffDamage: Boolean;
        /** 物理推力系数 */
        physicsImpulseCoeff: Number;
        /** 生成材料 */
        materialGenerate: String;
        /** 能否爆炸 */
        canExplode: Boolean;
        /** 伤害频率 */
        damageFrequency: Number;
        /** 提供投射物 */
        offeredEntities: NumberRang & { entity: EntityData };
    };
    /** 伤害模型组件 */
    damageModelComponent: {
        /** 最大生命值 */
        maxHp: Number;
        /** 氧气储备 */
        airInLungsMax: Number;
        /** 有害材料表 */
        damageMaterialList: Array<String>;
        /** 血液材料 */
        bloodMaterial: {
            /** 血液材料 - 受伤 */
            hurt: String;
            /** 血液材料 - 死亡 */
            dir: String;
        };
        /** 尸体材料 */
        corpseMaterial: String;
        /** 承伤倍率 */
        damageMultipler: DamageData;
    };
}

/** 法术数据 */
interface SpellData {
    /** 法术ID */
    id: SpellId_Enum;
    /** 法术名称 */
    name: SpellName_Enum;
    /** 法术描述 */
    description: String;
    /** 额外描述 */
    extraDescription: String;
    /** 法术类型 */
    type: "null" | spellType_Enum;
    /** 最大使用次数 */
    maxUse: Number;
    /** 无法无限化 */
    neverUnlimited: Boolean;
    /** 法力消耗 */
    manaDrain: Number;
    /** 法术生成数据 */
    spawningData: {
        prob_lv0: Number;
        prob_lv1: Number;
        prob_lv2: Number;
        prob_lv3: Number;
        prob_lv4: Number;
        prob_lv5: Number;
        prob_lv6: Number;
        prob_lv7: Number;
        prob_lv10: Number;
        /** 生成前置条件(解锁) */
        requiresFlag: "None" | String;
    };
    /** 价格 */
    price: Number;
    /** 提供投射物 */
    offeredProjectiles: {
        /** 投射物数据 */
        projectileData: EntityData;
        /** 最小数量 */
        num_min: Number;
        /** 最大数量 */
        num_max: Number;
        /** 关联投射物 */
        isRelatedProjectiles: Boolean;
        /** 处于施法块 */
        isInCastState: Boolean;
    };
    /** 被动效果 */
    passiveEffect: String;
    /** 法术抽取数据 */
    draw: {
        /** 常规抽取 */
        common: Number;
        /** 碰撞抽取 */
        hit: Number;
        /** 失效抽取 */
        death: Number;
        /** 定时抽取 */
        timer: {
            /** 抽取数 */
            count: Number;
            /** 延迟时间 */
            delay: Number;
        };
    };
    /** 施放延迟 */
    fireRateWait: Number;
    /** 暴击率 */
    damageCriticalChance: Number;
    /** 伤害修正 */
    damageMod: DamageData;
    /** 爆炸半径 */
    explosionRadius: Number;
    /** 散射角度 */
    spreadDegrees: Number;
    /** 阵型角度 */
    patternDegrees: Number;
    /** 速度倍率 */
    speedMultiplier: Number;
    /** 子速度倍率? */
    childSpeedMultiplier: Number;
    /** 存在时间 */
    lifetime: Number;
    /** 弹跳次数 */
    bounces: Number;
    /** 击退力度 */
    knockbackForce: Number;
    /** 友伤 */
    friendlyFire: Boolean;
    /** **<未知>** 可能是废弃的削弱后座力的属性 */
    dampening: Number;
    /** 屏幕振动系数 */
    screenshake: Number;
    /** 电弧施放数量 */
    lightningCount: Number;
    /** 材料类型 */
    material: String;
    /** 材料数量 */
    materialAmount: Number;
    /** 轨迹材料类型 */
    trailMaterial: String;
    /** 轨迹材料数量 */
    trailMaterialAmount: Number;
    /** 重力影响 */
    gravity: Number;
    /** 伤害粒子数量 */
    goreParticles: Number;
    /** 碰撞箱? */
    ragdollFx: Number;
    /** 额外实体 */
    extraEntities: String;
    /** 游戏效果实体 */
    gameEffectEntities: String;
    /** 后座力 */
    recoilKnockback: Number;
    /** 充能时间 */
    reloadTime: Number;
    /** 法术行为函数 */
    action: Function | null;
}

/** 法杖数据 */
interface WandData {
    /** 法杖名称 */
    name: String | wandName_Enum;
    /** 乱序 */
    shuffle: Boolean;
    /** 容量 */
    capacity: NumberRang | Number;
    /** 抽取数 */
    draw: NumberRang | Number;
    /** 施放延迟 */
    fireRateWait: NumberRang | Number;
    /** 充能时间 */
    reloadTime: NumberRang | Number;
    /** 散射角度 */
    spreadDegrees: NumberRang | Number;
    /** 速度倍数 */
    speedMultiplier: NumberRang | Number;
    /** 法力恢复速度 */
    manaChargeSpeed: NumberRang | Number;
    /** 法力上限 */
    manaMax: NumberRang | Number;
    /** 始终施放 */
    staticSpells: Array<unknown>;
    /** 可编辑法术 */
    dynamicSpells: Array<unknown>;
}

/** 天赋数据 */
interface PerkData {
    /** 天赋id */
    id: String;
    /** 天赋名称 */
    name: String;
    /** 基础描述 */
    description: String;
    /** 天赋类型 */
    type: String;
    /** 堆叠极限 */
    maxStack: Number;
    /** 天赋池允许存在的最大数量 */
    maxInPool: Number;
    /** 游戏效果 */
    gameEffect: String;
    /** 敌人能否使用 */
    usableByEnemies: String;
}

declare const noitaLib: {
    readonly version: () => never;
    /** ## [`🧨 实体`](https://noita.wiki.gg/zh/wiki) */
    readonly entity: {
        prototype: HTMLElement;
        new (param?: EntityData | String): {
            entityData: EntityData;
            toString: () => String;
            contentUpdate: () => never;
        };
        queryById: (id: String) => EntityData;
    };
    /** ## [`✨ 法术`](https://noita.wiki.gg/zh/wiki/法术) */
    readonly spell: {
        prototype: HTMLElement;
        new (
            param?:
                | Array<SpellData>
                | [
                      Array<SpellData>,
                      {
                          id?: String;
                          name?: String;
                          exp?: String;
                          datas?: Array<SpellData>;
                          display: "icon" | "panel";
                          needDefaultFn?: Boolean;
                          instance?: {
                              remain: Number;
                          };
                      }
                  ]
        ): {
            instance: {
                remain: Number;
            };
            spellDatas: Array<SpellData>;
            toString: () => String;
            contentUpdate: () => never;
        };
        queryById: (id: SpellId_Enum) => SpellData;
        queryByName: (name: SpellName_Enum) => SpellData;
        queryByExp: (exp: String) => Array<SpellData>;
    };
    /** ## [`🪄 魔杖`](https://noita.wiki.gg/zh/wiki/法杖) */
    readonly wand: {
        prototype: HTMLElement;
        new (): {
            wandData: WandData;
            toString: () => String;
            contentUpdate: () => never;
        };
    };
    /** ## [`🛡️ 天赋`](https://noita.wiki.gg/zh/wiki/天赋) */
    readonly perk: {
        prototype: HTMLElement;
        new (): {
            perkData: {};
            toString: () => String;
            contentUpdate: () => never;
        };
    };
};
