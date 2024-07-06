/** `🔤 天赋ID` */
type PerkId = "CRITICAL_HIT" | "BREATH_UNDERWATER" | "EXTRA_MONEY" | "EXTRA_MONEY_TRICK_KILL" | "GOLD_IS_FOREVER" | "TRICK_BLOOD_MONEY" | "EXPLODING_GOLD" | "HOVER_BOOST" | "FASTER_LEVITATION" | "MOVEMENT_FASTER" | "STRONG_KICK" | "TELEKINESIS" | "REPELLING_CAPE" | "EXPLODING_CORPSES" | "SAVING_GRACE" | "INVISIBILITY" | "GLOBAL_GORE" | "REMOVE_FOG_OF_WAR" | "LEVITATION_TRAIL" | "VAMPIRISM" | "EXTRA_HP" | "HEARTS_MORE_EXTRA_HP" | "GLASS_CANNON" | "LOW_HP_DAMAGE_BOOST" | "RESPAWN" | "WORM_ATTRACTOR" | "RADAR_ENEMY" | "FOOD_CLOCK" | "IRON_STOMACH" | "WAND_RADAR" | "ITEM_RADAR" | "MOON_RADAR" | "MAP" | "PROTECTION_FIRE" | "PROTECTION_RADIOACTIVITY" | "PROTECTION_EXPLOSION" | "PROTECTION_MELEE" | "PROTECTION_ELECTRICITY" | "TELEPORTITIS" | "TELEPORTITIS_DODGE" | "STAINLESS_ARMOUR" | "EDIT_WANDS_EVERYWHERE" | "NO_WAND_EDITING" | "WAND_EXPERIMENTER" | "ADVENTURER" | "ABILITY_ACTIONS_MATERIALIZED" | "PROJECTILE_HOMING" | "PROJECTILE_HOMING_SHOOTER" | "UNLIMITED_SPELLS" | "FREEZE_FIELD" | "FIRE_GAS" | "DISSOLVE_POWDERS" | "BLEED_SLIME" | "BLEED_OIL" | "BLEED_GAS" | "SHIELD" | "REVENGE_EXPLOSION" | "REVENGE_TENTACLE" | "REVENGE_RATS" | "REVENGE_BULLET" | "ATTACK_FOOT" | "LEGGY_FEET" | "PLAGUE_RATS" | "VOMIT_RATS" | "CORDYCEPS" | "MOLD" | "WORM_SMALLER_HOLES" | "PROJECTILE_REPULSION" | "RISKY_CRITICAL" | "FUNGAL_DISEASE" | "PROJECTILE_SLOW_FIELD" | "PROJECTILE_REPULSION_SECTOR" | "PROJECTILE_EATER_SECTOR" | "ORBIT" | "ANGRY_GHOST" | "HUNGRY_GHOST" | "DEATH_GHOST" | "HOMUNCULUS" | "LUKKI_MINION" | "ELECTRICITY" | "ATTRACT_ITEMS" | "EXTRA_KNOCKBACK" | "LOWER_SPREAD" | "LOW_RECOIL" | "BOUNCE" | "FAST_PROJECTILES" | "ALWAYS_CAST" | "EXTRA_MANA" | "NO_MORE_SHUFFLE" | "NO_MORE_KNOCKBACK" | "DUPLICATE_PROJECTILE" | "FASTER_WANDS" | "EXTRA_SLOTS" | "CONTACT_DAMAGE" | "EXTRA_PERK" | "PERKS_LOTTERY" | "GAMBLE" | "EXTRA_SHOP_ITEM" | "GENOME_MORE_HATRED" | "GENOME_MORE_LOVE" | "PEACE_WITH_GODS" | "MANA_FROM_KILLS" | "ANGRY_LEVITATION" | "LASER_AIM" | "PERSONAL_LASER" | "MEGA_BEAM_STONE" | "ESSENCE_AIR" | "ESSENCE_ALCOHOL" | "ESSENCE_FIRE" | "ESSENCE_LASER" | "ESSENCE_WATER";

/** `🔤 天赋名称` */
type PerkName = "暴击率 +" | "屏息静气" | "贪婪" | "技巧贪婪" | "永恒黄金" | "技巧血金" | "爆炸黄金" | "强漂浮力" | "更快漂浮" | "更快移动" | "坚持练腿" | "念力踢击" | "驱散斗篷" | "爆尸" | "死里逃生" | "隐身" | "更多血液" | "全视之眼" | "悬浮尾迹" | "吸血术" | "额外生命值（一次性）" | "更强大的心" | "玻璃大炮" | "刀尖舔血" | "额外生命（一次性）" | "蠕虫吸引" | "敌人雷达" | "素食主义" | "铁胃" | "魔杖雷达" | "物品雷达" | "探月雷达" | "空间感知" | "火焰免疫" | "绿毒免疫" | "爆炸免疫" | "近战免疫" | "雷电免疫" | "受伤传送" | "传送闪避" | "光洁铠甲" | "随时修改魔杖" | "无法修改魔杖" | "魔杖实验家" | "健康探索" | "手持炸弹" | "追踪法术" | "回旋法术" | "无限法术" | "冰冻领域" | "气体自燃" | "粉末消融" | "粘稠血液" | "油性血液" | "瓦斯之血" | "永久护盾" | "复仇爆炸" | "复仇触手" | "复仇鼠群" | "复仇子弹" | "蛛腿突变" | "猪腿变异" | "瘟疫鼠群" | "自然再生" | "虫草" | "真菌种群" | "移除虫洞" | "投射物排斥领域" | "千钧一发" | "真菌疾病" | "投射物减速领域" | "投射物排斥扇面" | "投射物吞噬者" | "相位穿越" | "愤怒幽灵" | "饥饿幽灵" | "哀伤灵魂" | "人造生命" | "蜘蛛仆从" | "雷电之体" | "吸金大法" | "击退法术" | "汇聚法术" | "低后座力" | "弹跳法术" | "更快的投射物" | "始终施放（一次性）" | "高魔低容（一次性）" | "不再乱序" | "不再击退" | "投射物复制" | "魔杖加速（一次性）" | "魔杖扩容（一次性）" | "近身伤害" | "更多天赋选项" | "天赋博彩" | "赌博（一次性" | "额外圣山物品" | "更多仇恨" | "更多友爱" | "与神和解" | "化尸为魔" | "愤怒漂浮" | "激光瞄具" | "手持电浆束" | "召唤光石（一次性）" | "气之精粹" | "酒之精粹" | "火之精粹" | "土之精粹" | "水之精粹";

/** 天赋数据 */
export type PerkData = {
    /** 天赋id */
    id: PerkId;
    /** 天赋名称 */
    name: PerkName;
    /** 基础描述 */
    desc: String;
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
    /** 图标 */
    icon: HTMLImageElement;
    /** 名称翻译键 */
    nameKey: String;
    /** 描述翻译键 */
    descKey: String;
};

export type Class = {
    /** 所有天赋数据 */
    readonly datas: Array<PerkData>;
    new (): HTMLElement & {
        perkData: {};
        contentUpdate: () => never;
    };
    /**
     * 获取天赋数据
     * @param key 查询键
     * * {@linkcode Enum.perkName|`名称`}
     * * {@linkcode Enum.perkId|`ID`}
     * * {@linkcode Enum|`别名`}
     * @returns 天赋数据
     */
    query: (id: Enum.perkId | Enum.perkName) => PerkData;
};
