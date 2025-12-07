import { list } from "./entityList.js";
const blank = Symbol("");
/**
 * #### 用于将属性转化类型 若属性为默认值则返回 *空白 `Symbol("")`*
 * *空白 `Symbol("")` 在编译为JS时将会在源码变为空字符串以减少体积*
 * @template {string|number|boolean} T
 * @param {string} value
 * @param {T} defaultValue
 * @returns {(T extends number ? number : T extends boolean ? boolean : T extends string ? string : unknown)|symbol}
 */
const $value = (value, defaultValue) => {
    const targetType = typeof defaultValue;
    if (targetType === "number") value = +value;
    else if (targetType === "string") value = "" + value;
    else if (targetType === "boolean") value = !!value;
    else throw TypeError("不支持转化的类型");
    if (Object.is(value, defaultValue)) return blank;
    return value;
};
const zh_cn = langData.getZH_CN;
/**
 * 最小化xml路径
 * @param {String} path
 */
const minPath = path => {
    let paths = path.split(",").map(p => p.replace("data/entities/", "").replace(".xml", ""));
    // paths = paths.filter(p => !p.startsWith("particles/"));
    // return paths.join(",");
    if (paths.length) return paths.join(",");
    return blank;
};
// 使用到材料式使用索引代替材料名以压缩字符数量
const materialMap = [
    "air",
    "fire",
    "fire_blue",
    "spark",
    "spark_green",
    "spark_green_bright",
    "spark_blue",
    "spark_blue_dark",
    "spark_red",
    "spark_red_bright",
    "spark_white",
    "spark_white_bright",
    "spark_yellow",
    "spark_purple",
    "spark_purple_bright",
    "spark_player",
    "spark_teal",
    "spark_electric",
    "flame",
    "sand_static",
    "sand_static_rainforest",
    "sand_static_rainforest_dark",
    "bone_static",
    "rust_static",
    "sand_static_bright",
    "meat_static",
    "sand_static_red",
    "nest_static",
    "bluefungi_static",
    "rock_static",
    "rock_static_intro",
    "rock_static_trip_secret",
    "rock_static_trip_secret2",
    "rock_static_cursed",
    "rock_static_purple",
    "water_static",
    "endslime_static",
    "slime_static",
    "spore_pod_stalk",
    "rock_hard",
    "rock_static_fungal",
    "wood_tree",
    "rock_static_noedge",
    "rock_hard_border",
    "rock_magic_gate",
    "rock_magic_bottom",
    "rock_eroding",
    "rock_vault",
    "coal_static",
    "rock_static_grey",
    "rock_static_radioactive",
    "rock_static_cursed_green",
    "rock_static_poison",
    "skullrock",
    "rock_static_wet",
    "lavarock_static",
    "static_magic_material",
    "meteorite_static",
    "templerock_static",
    "templebrick_static",
    "templebrick_static_broken",
    "templebrick_static_soft",
    "templebrick_noedge_static",
    "templerock_soft",
    "templebrick_thick_static",
    "templebrick_thick_static_noedge",
    "templeslab_static",
    "templeslab_crumbling_static",
    "templebrickdark_static",
    "wizardstone",
    "templebrick_golden_static",
    "templebrick_diamond_static",
    "templebrick_static_ruined",
    "glowstone",
    "glowstone_altar",
    "glowstone_altar_hdr",
    "glowstone_potion",
    "templebrick_red",
    "templebrick_moss_static",
    "the_end",
    "steel_static",
    "steelmoss_static",
    "steel_rusted_no_holes",
    "steel_grey_static",
    "steelfrost_static",
    "steelmoss_slanted",
    "steelsmoke_static",
    "steelpipe_static",
    "steel_static_strong",
    "steel_static_unmeltable",
    "rock_static_glow",
    "snow_static",
    "ice_static",
    "rock_static_intro_breakable",
    "ice_blood_static",
    "ice_slime_static",
    "ice_acid_static",
    "ice_cold_static",
    "ice_radioactive_static",
    "ice_poison_static",
    "ice_meteor_static",
    "tubematerial",
    "glass_static",
    "waterrock",
    "ice_glass",
    "tube_physics",
    "ice_acid_glass",
    "ice_cold_glass",
    "ice_radioactive_glass",
    "ice_poison_glass",
    "ice_blood_glass",
    "ice_slime_glass",
    "ice_glass_b2",
    "glass_brittle",
    "snowrock_static",
    "concrete_static",
    "wood_static",
    "cheese_static",
    "wood_static_wet",
    "root_growth",
    "wood_burns_forever",
    "creepy_liquid_emitter",
    "gold_static",
    "gold_static_radioactive",
    "gold_static_dark",
    "wood_static_vertical",
    "wood_static_gas",
    "corruption_static",
    "smoke",
    "cloud",
    "cloud_lighter",
    "smoke_magic",
    "smoke_explosion",
    "steam",
    "steam_trailer",
    "acid_gas",
    "acid_gas_static",
    "smoke_static",
    "poison_gas",
    "fungal_gas",
    "poo_gas",
    "blood_cold_vapour",
    "sand_herb_vapour",
    "radioactive_gas",
    "radioactive_gas_static",
    "magic_gas_hp_regeneration",
    "magic_gas_midas",
    "magic_gas_worm_blood",
    "rainbow_gas",
    "magic_gas_polymorph",
    "magic_gas_weakness",
    "magic_gas_teleport",
    "magic_gas_fungus",
    "water",
    "water_fading",
    "water_salt",
    "void_liquid",
    "mimic_liquid",
    "just_death",
    "water_temp",
    "water_ice",
    "water_swamp",
    "oil",
    "liquid_fire",
    "liquid_fire_weak",
    "alcohol",
    "beer",
    "milk",
    "molut",
    "sima",
    "juhannussima",
    "alcohol_gas",
    "midas_precursor",
    "midas",
    "magic_liquid",
    "material_confusion",
    "material_darkness",
    "pus",
    "material_rainbow",
    "magic_liquid_weakness",
    "magic_liquid_movement_faster",
    "magic_liquid_faster_levitation",
    "magic_liquid_faster_levitation_and_movement",
    "magic_liquid_worm_attractor",
    "magic_liquid_protection_all",
    "magic_liquid_mana_regeneration",
    "magic_liquid_unstable_teleportation",
    "magic_liquid_teleportation",
    "magic_liquid_hp_regeneration",
    "magic_liquid_hp_regeneration_unstable",
    "magic_liquid_polymorph",
    "magic_liquid_random_polymorph",
    "magic_liquid_unstable_polymorph",
    "magic_liquid_berserk",
    "magic_liquid_charm",
    "magic_liquid_invisibility",
    "cloud_radioactive",
    "cloud_blood",
    "cloud_slime",
    "swamp",
    "mud",
    "blood",
    "blood_fading",
    "blood_fading_slow",
    "blood_fungi",
    "blood_worm",
    "porridge",
    "blood_cold",
    "radioactive_liquid",
    "poison",
    "cursed_liquid",
    "radioactive_liquid_yellow",
    "radioactive_liquid_fading",
    "plasma_fading",
    "plasma_fading_bright",
    "plasma_fading_green",
    "plasma_fading_pink",
    "gold_molten",
    "steel_static_molten",
    "steelmoss_slanted_molten",
    "steelmoss_static_molten",
    "steelsmoke_static_molten",
    "metal_sand_molten",
    "metal_molten",
    "metal_rust_molten",
    "metal_nohit_molten",
    "aluminium_molten",
    "aluminium_robot_molten",
    "metal_prop_molten",
    "steel_rust_molten",
    "aluminium_oxide_molten",
    "wax_molten",
    "silver_molten",
    "copper_molten",
    "brass_molten",
    "glass_molten",
    "glass_broken_molten",
    "steel_molten",
    "creepy_liquid",
    "cement",
    "concrete_sand",
    "sand",
    "sand_blue",
    "sand_surface",
    "lavasand",
    "sand_petrify",
    "bone",
    "soil",
    "soil_lush",
    "soil_lush_dark",
    "soil_dead",
    "soil_dark",
    "sandstone",
    "sandstone_surface",
    "fungisoil",
    "honey",
    "glue",
    "slime",
    "slush",
    "slime_green",
    "slime_yellow",
    "pea_soup",
    "vomit",
    "endslime",
    "endslime_blood",
    "explosion_dirt",
    "vine",
    "root",
    "snow",
    "snow_sticky",
    "rotten_meat",
    "meat_slime_sand",
    "meat_slime_green",
    "meat_slime_orange",
    "rotten_meat_radioactive",
    "meat_worm",
    "meat_helpless",
    "meat_trippy",
    "meat_frog",
    "meat_cursed",
    "meat_cursed_dry",
    "meat_slime_cursed",
    "meat_teleport",
    "meat_fast",
    "meat_polymorph",
    "meat_polymorph_protection",
    "meat_confusion",
    "ice",
    "sand_herb",
    "wax",
    "gold",
    "gold_radioactive",
    "silver",
    "steel_sand",
    "metal_sand",
    "copper",
    "brass",
    "diamond",
    "coal",
    "sulphur",
    "salt",
    "sodium",
    "purifying_powder",
    "burning_powder",
    "sodium_unstable",
    "gunpowder",
    "gunpowder_explosive",
    "gunpowder_tnt",
    "gunpowder_unstable",
    "gunpowder_unstable_big",
    "monster_powder_test",
    "rat_powder",
    "fungus_powder",
    "fungus_powder_bad",
    "shock_powder",
    "orb_powder",
    "gunpowder_unstable_boss_limbs",
    "plastic_red",
    "plastic_grey",
    "plastic_red_molten",
    "plastic_grey_molten",
    "plastic_molten",
    "plastic_prop_molten",
    "grass",
    "grass_holy",
    "grass_darker",
    "grass_ice",
    "grass_dry",
    "fungi",
    "fungi_green",
    "fungi_yellow",
    "grass_dark",
    "fungi_creeping",
    "fungi_creeping_secret",
    "spore",
    "peat",
    "moss_rust",
    "moss",
    "plant_material",
    "plant_material_red",
    "plant_material_dark",
    "ceiling_plant_material",
    "mushroom_seed",
    "plant_seed",
    "mushroom",
    "mushroom_giant_red",
    "mushroom_giant_blue",
    "glowshroom",
    "bush_seed",
    "acid",
    "lava",
    "wood_player",
    "wood_player_b2",
    "wood_player_b2_vertical",
    "wood",
    "wax_b2",
    "fuse",
    "fuse_bright",
    "fuse_tnt",
    "fuse_holy",
    "templebrick_box2d",
    "wood_trailer",
    "wood_wall",
    "cactus",
    "grass_loose",
    "fungus_loose",
    "fungus_loose_green",
    "fungus_loose_trippy",
    "wood_prop",
    "wood_prop_noplayerhit",
    "cloth_box2d",
    "wood_prop_durable",
    "nest_box2d",
    "nest_firebug_box2d",
    "cocoon_box2d",
    "wood_loose",
    "rock_loose",
    "ice_ceiling",
    "brick",
    "concrete_collapsed",
    "tnt",
    "tnt_static",
    "trailer_text",
    "meteorite",
    "sulphur_box2d",
    "meteorite_test",
    "meteorite_crackable",
    "meteorite_green",
    "steel",
    "steel_rust",
    "metal_rust_rust",
    "metal_rust_barrel_rust",
    "plastic",
    "plastic_prop",
    "aluminium",
    "aluminium_robot",
    "metal_prop",
    "metal_prop_low_restitution",
    "metal_prop_loose",
    "metal",
    "metal_hard",
    "rock_box2d",
    "templebrick_box2d_edgetiles",
    "rock_box2d_hard",
    "poop_box2d_hard",
    "rock_box2d_nohit",
    "rock_box2d_nohit_heavy",
    "rock_box2d_nohit_hard",
    "rock_static_box2d",
    "rock_box2d",
    "item_box2d",
    "item_box2d_glass",
    "item_box2d_meat",
    "gem_box2d",
    "potion_glass_box2d",
    "glass_box2d",
    "gem_box2d_yellow_sun",
    "gem_box2d_red_float",
    "gem_box2d_yellow_sun_gravity",
    "gem_box2d_darksun",
    "gem_box2d_pink",
    "gem_box2d_red",
    "gem_box2d_turquoise",
    "gem_box2d_opal",
    "gem_box2d_white",
    "gem_box2d_green",
    "gem_box2d_orange",
    "gold_box2d",
    "bloodgold_box2d",
    "metal_nohit",
    "metal_chain_nohit",
    "metal_wire_nohit",
    "metal_rust",
    "metal_rust_barrel",
    "bone_box2d",
    "crystal",
    "magic_crystal",
    "magic_crystal_green",
    "gold_b2",
    "crystal_purple",
    "crystal_solid",
    "crystal_magic",
    "aluminium_oxide",
    "meat",
    "meat_fruit",
    "meat_pumpkin",
    "meat_warm",
    "meat_hot",
    "meat_done",
    "meat_burned",
    "meat_pumpkin",
    "meat_slime",
    "urine",
    "poo",
    "mammi",
    "physics_throw_material_part2",
    "rocket_particles",
    "ice_melting_perf_killer",
    "ice_b2",
    "glass_liquidcave",
    "glass",
    "glass_broken",
    "neon_tube_purple",
    "neon_tube_cyan",
    "neon_tube_blood_red",
    "blood_thick",
    "snow_b2",
    "fungal_shift_particle_fx"
];

const $materialIndex = id => materialMap.indexOf(id);

const abbrList = new AbbrList();

const attackRangedEntityFiles = new Set();

/** @typedef {typeof XML.ElementNode.prototype} XML_Element */

/** `Noita` 实体 */
const NoitaEntity = (() => {
    /**
     * 转换为实际伤害
     * @param {String|Number} value
     */
    const $25 = value => +(value * 25).toFixed(12);
    /** 编译函数 key */
    const compile = Symbol("compile");

    /**
     * #### 裁剪编译结果的空白
     * @template T
     * @param {Array<T>} array
     */
    const trim = array => {
        while (array.at(-1) === blank) array.pop();
        return array;
    };

    /** 组件基类 */
    class Component {
        /** @type {CSV} */
        static lifetimeList;
        /** @type {XMLObject} 数据对象 */
        #raw;
        /** @type {String} 组件名 */
        #type;

        /** @return {XMLObject} 数据对象 */
        get data() {
            return this.#raw;
        }

        /** @return {String} 组件类型 */
        get type() {
            return this.#type;
        }

        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            this.#raw = freeze(data);
            this.#type = new.target.name;
        }
    }

    /** 精灵图组件 */
    class SpriteComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data, path) {
            super(data);
        }

        /** 获取画板 */
        get canavs() {
            /** @type {String} */
            const path = "/" + this.data("attr").image_file;

            if (path.endsWith(".xml")) {
                // 这里要用绝对路径
                // 拿到定义精灵图的xml文件并解析为xml文档
                fetch(path).then(async value => {
                    const textConent = await value.text();
                    // 这里忽略解析结果中的注释节点和文本节点
                    const xmlDoc = XML.parse(textConent, { ignore: ["#text", "#comment"] });
                    // 拿到 <Sprite> 下的所有 <RectAnimation> 元素
                    /** @type {typeof XML.ElementNode.prototype} */
                    const root = xmlDoc.childNodes[0];
                    // 拿到精灵图文件
                    const img = await PNG.removeGAMA("/" + root.attr.get("filename"));
                    // 等待图像解码完成
                    await img.decode();
                    /** @type {{[key: String]: Array<HTMLCanvasElement>}} */
                    const result = {};
                    for (const rectAnimation of root.childNodes.query("RectAnimation")) {
                        // 动画名
                        const name = rectAnimation.attr.get("name");
                        // 帧总数
                        const count = rectAnimation.attr.get("frame_count");
                        // 帧高度
                        const height = rectAnimation.attr.get("frame_height");
                        // 帧宽度
                        const width = rectAnimation.attr.get("frame_width");
                        // x轴偏移
                        const x = rectAnimation.attr.get("pos_x");
                        // y轴偏移
                        const y = rectAnimation.attr.get("pos_y");

                        // 每一帧都单独生成canvas
                        const canvasArray = [];
                        const imgArray = [];
                        for (let i = 0; i < count; i++) {
                            const canavs = h.canvas();
                            canavs.height = height;
                            canavs.width = width;
                            const ctx = canavs.getContext("2d");
                            ctx.drawImage(img, x + i * width, y, width, height, 0, 0, width, height);

                            canvasArray[i] = canavs;
                            imgArray[i] = h.img({ src: canavs.toDataURL() });
                        }
                        // result[name] = canvasArray;
                        result[name] = imgArray;
                    }
                    // 放到页面上看看效果
                    const box = h.section({ class: "box" }, h.h3(path));
                    for (const name in result) {
                        // const canvases = result[name];
                        // box.append(h.details({ open: true }, h.summary(name), canvases));
                        const imgs = result[name];
                        box.append(h.details({ open: true }, h.summary(name), imgs));
                    }
                    document.body.append(box);
                });
            } else if (path.endsWith(".png")) {
                const box = h.section({ class: "box" }, h.h3(path), h.img({ src: path }));
                document.body.append(box);
            }
        }
    }

    /**
     * #### 爆炸配置
     * 可能在多个组件中被使用
     */
    class ConfigExplosion {
        /** @param {XMLObject} data */
        constructor(data) {
            const attr = data("attr");
            /** @type {Number} 爆炸伤害 */
            this.damage = $25(attr.damage);
            /** @type {Number} 爆炸半径 */
            this.explosion_radius = +attr.explosion_radius;
            /** @type {0|1} 具备伤害 */
            this.damage_mortals = +attr.damage_mortals;
            /** @type {(typeof blank)|String} 爆炸后加载实体 */
            this.load_this_entity = attr.load_this_entity === "" ? blank : minPath(attr.load_this_entity);
            /** @type {(typeof blank)|Number} 爆炸击退系数 */
            this.knockback_force = $value(attr.knockback_force, 1);
            /** @type {number} 爆炸挖掘等级 */
            this.max_durability_to_destroy = +attr.max_durability_to_destroy;
            /** @type {number} 爆炸挖掘能量 */
            this.ray_energy = +attr.ray_energy;
            /** @type {string} 爆炸产生材料 */
            this.create_material = attr.create_cell_probability === "0" ? blank : attr.create_cell_material + ":" + attr.create_cell_probability;
        }
    }

    /** 投射物组件 `唯一` */
    class ProjectileComponent extends Component {
        /**
         * @param {XMLObject} data
         * @param {String} path
         */
        constructor(data, path) {
            super(data);
            this.path = path;
        }

        [compile]() {
            const data = this.data;
            const attr = data("attr");
            const configExplosion = new ConfigExplosion(data.config_explosion[0]);
            const damageData = new DamageData("", 0);
            // 读取伤害

            // 从<damage_by_type> 获取数据
            for (const [type, value] of Object.entries(data.damage_by_type[0]("attr"))) damageData[toHumpNaming(type)] = $25(value);

            // 投射物伤害直接从组件属性获取
            damageData.projectile = $25(attr.damage);

            //爆炸伤害从<config_explosion>中获取
            damageData.explosion = configExplosion.damage;

            //爆炸生成的实体
            const explosionEntity = configExplosion.load_this_entity;

            //碰撞生成的实体
            const collisionEntity = $value(minPath(attr.spawn_entity), "");

            // 保险时间为-1f时应当省略
            const collide_with_shooter_frames = $value(attr.collide_with_shooter_frames, -1);

            // 散射为0时应当省略
            const direction_random_rad = $value(attr.direction_random_rad, 0);

            // 伤害频率为1f/次 时应当省略
            const damage_every_x_frames = Math.abs(attr.damage_every_x_frames) === 1 ? blank : +attr.damage_every_x_frames;

            // 榨血系数为1时应当省略
            const blood_count_multiplier = $value(attr.blood_count_multiplier, 1);

            // 存在时间波动为0f时应当省略
            const lifetime_randomness = $value(attr.lifetime_randomness, 0);
            let lifetime = +attr.lifetime;

            if (lifetime_randomness !== blank) {
                //存在波动时使用人工解析数据
                lifetime = +NoitaEntity.lifetimeList.get(this.path, "lifetime");
                if (isNaN(lifetime)) {
                    console.error("缺失存在时间:", this.path);
                }
            }

            // 弹跳次数为0时应当省略
            const bounces_left = $value(attr.bounces_left, 0);

            // 击退系数为0时应当省略
            const knockback_force = $value(attr.knockback_force, 0);

            // 游戏效果实体
            const damage_game_effect_entities = $value(minPath(attr.damage_game_effect_entities), "");

            // 我究竟要不要这个数据// 现在要了
            // 挖掘等级为0时应当省略
            let ground_penetration_max_durability_to_destroy = +attr.ground_penetration_max_durability_to_destroy;
            // 爆炸挖掘等级为0时应当省略
            const max_durability_to_destroy = $value(configExplosion.max_durability_to_destroy, 0);
            // 爆炸挖掘能量等级为20000时应当省略
            const ray_energy = $value(configExplosion.ray_energy, 20000);

            const ground_penetration_coeff = +attr.ground_penetration_coeff;
            if (ground_penetration_coeff > 0) {
                if (ground_penetration_max_durability_to_destroy === 0) {
                    ground_penetration_max_durability_to_destroy = Infinity; // 此时应当认为穿透无视挖掘等级
                }
                // console.log(+attr.ground_penetration_coeff);
            }

            /* prettier-ignore */
            return trim([
                new Bits([
                    +attr.friendly_fire, //================== [0] 友方伤害
                    configExplosion.damage_mortals, //======= [1] 爆炸造成伤害
                    +attr.explosion_dont_damage_shooter, //== [2] 爆炸无自伤
                    +attr.collide_with_entities, //========== [3] 命中实体
                    +attr.collide_with_world, //============= [4] 命中地形
                    +attr.damage_scaled_by_speed, //========= [5] 差速伤害加成
                    +attr.die_on_liquid_collision, //======== [6] 接触液体时失效
                    +attr.die_on_low_velocity, //============ [7] 低速时失效
                    +attr.on_collision_die, //=============== [8] 碰撞(命中)时失效
                    +attr.on_death_explode, //=============== [9] 失效时爆炸
                    +attr.on_lifetime_out_explode, //======== [10] 过期时爆炸
                    +attr.on_collision_spawn_entity, //====== [11] 在碰撞时生成实体
                    +attr.spawn_entity_is_projectile, //===== [12] 生成实体是投射物 (具备施法者信息)
                    +attr.penetrate_entities, //============= [13] 穿透实体
                    +attr.penetrate_world, //================ [14] 穿透地形
                    +attr.do_moveto_update //================ [15] 不产生命中
                ]).toBigInt(), //===================================== [0] bits
                damageData.toString(), //============================= [1] 伤害数据
                configExplosion.explosion_radius, //================== [2] 爆炸半径
                lifetime, //========================================== [3] 存在时间 (注意导出的数据存在时间已被修改)
                +attr.speed_max, //=================================== [4] 最大速度
                +attr.speed_min, //=================================== [5] 最小速度
                //=========// 下面这些很有可能会使用默认值 放在末尾方便省略 //==========//
                lifetime_randomness, //=============================== [6] 存在时间波动 默认0
                direction_random_rad, //============================== [7] 散射          默认0
                knockback_force, //=================================== [8] 击退系数      默认0
                bounces_left, //====================================== [9] 弹跳次数      默认0
                damage_every_x_frames, //============================= [10] 伤害频率     默认1
                blood_count_multiplier, //============================ [11] 榨血系数     默认1
                collide_with_shooter_frames, //======================= [12] 保险时间     默认-1
                ground_penetration_max_durability_to_destroy, //====== [13] 挖掘等级     默认 0
                ground_penetration_coeff, //========================== [14] 挖掘穿透系数  默认0
                max_durability_to_destroy, //========================= [15] 爆炸挖掘等
                ray_energy, //======================================== [16] 爆炸挖掘能量
                damage_game_effect_entities, //======================= [17] 游戏效果实体
                collisionEntity, //=================================== [18] 生成实体(碰撞)
                explosionEntity, //=================================== [19] 爆炸生成的实体
                configExplosion.knockback_force, //=================== [20] 爆炸击退系数 默认1
                configExplosion.create_material, //=================== [21] 爆炸生成材料
                $value(attr.collide_with_tag,"hittable"), //==[22] 可命中目标
            ]);
        }
    }

    /** 加载实体组件 `可能多个` */
    class LoadEntitiesComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        get entity() {
            return minPath(this.data("attr").entity_file);
        }

        [compile]() {
            const attr = this.data("attr");
            const min = +attr["count.min"];
            const max = +attr["count.max"];
            if(min === max) return max; // 数量固定时仅返回单个数值而不是数组
            else
            /* prettier-ignore */
            return [
                min, //=== [1] 最小数量
                max //==== [2] 最大数量
            ]
        }
    }

    /** 变量组件 `可能多个` */
    class VariableStorageComponent extends Component {
        /** @type {String} */
        name = "";

        /**
         * @param {XMLObject} data
         */
        constructor(data, path) {
            super(data);
            this.name = data("attr").name;
            this.path = path;
        }

        [compile]() {
            const attr = this.data("attr");
            const _bool = +attr.value_bool || blank;
            const _float = +attr.value_float || blank;
            const _int = +attr.value_int || blank;
            let _string = minPath(attr.value_string) || blank;
            if (this.name === "projectile_file") {
                if (_string === minPath(this.path)) _string = ""; // 与自身路径相同时存储空字符串
            }
            return trim([_string, _bool, _float, _int]);
        }
    }

    /**
     * 动物行为组件
     * *`很蛋疼的是这个组件属性会囊括一些<AIAttackComponent>的属性, 我将会把它们重定向为<AIAttackComponent>组件`*
     */
    class AnimalAIComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data, path) {
            super(data);
            const attr = this.data("attr");
            // console.log(path, attr);
            if (attr.attack_ranged_entity_file) attackRangedEntityFiles.add(attr.attack_ranged_entity_file);
        }

        get hasAttackRanged() {
            return !!+this.data("attr").attack_ranged_enabled;
            const file = this.data("attr").attack_ranged_entity_file;
            if (!file) return false;
            // 这个投射物是个默认值 并不存在该投射物 应当认为该组件不具备远程攻击
            if (file === "data/entities/projectiles/spear.xml") return false;
            return true;
        }

        #compile_AnimalAIComponent() {
            const attr = this.data("attr");
            /* prettier-ignore */
            return [
                (+attr.attack_dash_enabled) ? $25(attr.attack_dash_damage) : 0, //= [0] 冲撞-近战伤害
                attr.attack_dash_distance, //=========== [1] 冲撞距离
                attr.attack_dash_frames_between, //===== [2] 冲撞冷却
                attr.attack_dash_speed, //============== [3] 冲撞速度
                $25(attr.attack_melee_damage_max), //======== [4] 直接近战伤害 最大值
                $25(attr.attack_melee_damage_min), //======== [5] 直接近战伤害 最小值
                attr.attack_melee_max_distance, //====== [6] 直接近战距离
                attr.food_material, //================== [7] 食物
                new Bits([
                    +attr.attack_only_if_attacked, //========== [0] 仅被攻击时才会反击
                    +attr.can_fly, //========================== [1] 可以飞行
                    +attr.can_walk, //========================= [2] 可以行走
                    +attr.defecates_and_pees, //=============== [3] 排泄
                    +attr.dont_counter_attack_own_herd, //===== [4] 被同阵营误伤时不会反击
                    +attr.sense_creatures, //================== [5] 搜索敌人
                    +attr.sense_creatures_through_walls, //==== [6] 搜索敌人的视线不受地形阻碍
                    +attr.tries_to_ranged_attack_friends //==== [7] 使用远程攻击攻击友方 (辅助形怪物)
                ]).toBigInt()
            ]
        }

        #compile_AIAttackComponent() {
            const attr = this.data("attr");
            if (!this.hasAttackRanged) return console.error(`不应该被转换为AIAttackComponent`);
            /* prettier-ignore */
            return [
                minPath(attr.attack_ranged_entity_file), //============ [0] 投射物
                +attr.attack_ranged_entity_count_max, //====== [1] 投射物最大数量
                +attr.attack_ranged_entity_count_min, //====== [2] 投射物最大数量
                +attr.attack_ranged_max_distance, //========== [3] 最大射程
                +attr.attack_ranged_min_distance, //========== [4] 最小射程
                +attr.attack_ranged_frames_between, //======== [5] 每次攻击冷却
                blank, //===================================== [6] 切换到其它攻击模式的冷却 (应该为0)
                +attr.attack_ranged_state_duration_frames //== [7] 攻击状态持续时长
                //============================================ [8] 攻击模式被使用概率(应该默认100 此处省略)
            ]
        }

        [compile](type = "AnimalAIComponent") {
            if (type === "AnimalAIComponent") return this.#compile_AnimalAIComponent();
            else return this.#compile_AIAttackComponent();
        }
    }

    /** (远程)攻击行为组件 `可能多个` */
    class AIAttackComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
            const attr = this.data("attr");
            if (attr.attack_ranged_entity_file) attackRangedEntityFiles.add(attr.attack_ranged_entity_file);
        }

        [compile]() {
            const attr = this.data("attr");
            /* prettier-ignore */
            const result = [
                minPath(attr.attack_ranged_entity_file), //========= [0] 投射物
                +attr.attack_ranged_entity_count_max, //=== [1] 投射物最大数量
                +attr.attack_ranged_entity_count_min, //=== [2] 投射物最小数量
                +attr.max_distance, //===================== [3] 最大射程
                +attr.min_distance, //===================== [4] 最小射程
                +attr.frames_between, //=================== [5] 每次攻击冷却
                +attr.frames_between_global, //============ [6] 切换到其它攻击模式的冷却
                +attr.state_duration_frames, //============ [7] 攻击状态持续时长
                +attr.use_probability //=================== [8] 攻击模式被使用概率
            ];
            if (result[6] === 0) result[6] = blank; //切换到其它攻击模式的冷却 应当省略
            if (result[8] === 100) result.pop(); //攻击模式被使用概率 为100时 应当省略
            return result;
        }
    }

    /** 伤害模型组件 `唯一` */
    class DamageModelComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data, path) {
            super(data);
            this.path = path;
            $materialData: {
                const attr = this.data("attr");
                let damageData = {};
                if (!+attr.materials_damage) break $materialData;
                if (!attr.materials_that_damage) break $materialData;
                const damages = attr.materials_how_much_damage.split(",");
                const materials = attr.materials_that_damage.split(",");
                for (let i = 0; i < damages.length; i++) damageData[$materialIndex(materials[i])] = $25(damages[i]);
                abbrList.add(damageData);
                this.materialDamageData = damageData;
            }
            $damageMultipliers: {
                //读取承伤系数
                const damageData = new DamageData("", 1, "multipliers");
                for (const [type, value] of Object.entries(this.data.damage_multipliers[0]("attr"))) damageData[toHumpNaming(type)] = +value;
                this.damageMultipliers = damageData.toString();
                if (this.damageMultipliers) abbrList.add(this.damageMultipliers);
            }
        }

        [compile]() {
            const attr = this.data("attr");
            //读取承伤系数
            // const damageData = new DamageData("", 1, "multipliers");

            // for (const [type, value] of Object.entries(this.data.damage_multipliers[0]("attr"))) damageData[toHumpNaming(type)] = +value;

            //读取材料伤害
            const materialDamageData = this.materialDamageData ? abbrList.abbr(this.materialDamageData) : blank;
            let blood_material = materialMap.indexOf(attr.blood_material);
            let blood_spray_material = materialMap.indexOf(attr.blood_spray_material);
            let ragdoll_material = materialMap.indexOf(attr.ragdoll_material);

            console.log({ blood_material_id: blood_material, blood_spray_material_id: blood_spray_material, ragdoll_material_id: ragdoll_material, path: this.path });

            if (materialMap.indexOf(attr.blood_material) < 0) blood_material = blank;
            if (materialMap.indexOf(attr.blood_spray_material) < 0) blood_spray_material = blank;
            if (materialMap.indexOf(attr.ragdoll_material) < 0) ragdoll_material = blank;

            /* prettier-ignore */
            return [
                $25(attr.max_hp), //================================ [0] 生命值上限
                blood_material, //====================================== [1] 血液材料
                blood_spray_material, //================================ [2] 溅射血液材料
                ragdoll_material, //==================================== [3] 尸体材料
                materialDamageData, //===================================== [4] 材料伤害
                +attr.air_in_lungs_max, //================================= [5] 肺容量
                $25(attr.air_lack_of_damage), //==================== [6] 窒息伤害
                +attr.fire_probability_of_ignition, //===================== [7] 点燃概率
                $25(attr.fire_damage_ignited_amount), //============= [8] 点燃伤害
                +attr.fire_damage_amount, //=============================== [9] 燃烧伤害
                $25(attr.falling_damage_damage_max), //============= [10] 最大摔落伤害
                $25(attr.falling_damage_damage_min), //============= [11] 最小摔落伤害
                +attr.falling_damage_height_max, //======================== [12] 最大摔落高度
                +attr.falling_damage_height_min, //======================== [13] 最小摔落高度
                +attr.critical_damage_resistance, //======================= [14] 暴击抗性
                $25(attr.wet_status_effect_damage), //============== [15] 潮湿状态伤害
                abbrList.abbr(this.damageMultipliers), //============== [16] 承伤系数
                // damageData.toString(), //================================== [16] 承伤系数
                new Bits([
                    +attr.air_needed, //================ [0] 需要呼吸
                    +attr.is_on_fire, //================ [1] 始终燃烧
                    +attr.falling_damages, //=========== [2] 有摔落伤害
                    +attr.create_ragdoll, //============ [3] 遗留尸体
                    +attr.ui_report_damage, //========== [4] 扣血显示
                    +attr.physics_objects_damage //===== [5] 受冲击伤害
                ]).toBigInt() //=========================================== [17] bits
            ]
        }
    }

    /** 基因组数据组件 */
    class GenomeDataComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");
            /* prettier-ignore */
            return [
                +attr.food_chain_rank, //================ [0] 食物链等级
                attr.herd_id, //========================= [1] 阵营
                new Bits([
                    +attr.berserk_dont_attack_friends, //= [0] 狂暴不攻击友方
                    +attr.is_predator  //================= [1] 肉食性
                ]).toBigInt()
            ];
        }
    }

    /** 存在时间组件 */
    class LifetimeComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");

            const randomMin = +attr["randomize_lifetime.min"];
            const randomMax = +attr["randomize_lifetime.max"];

            if (randomMin !== 0 || randomMax !== 0) return [+attr.lifetime + randomMin, +attr.lifetime + randomMax];

            return +attr.lifetime;
        }
    }

    /** 伤害领域组件 `可能多个` */
    class AreaDamageComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");
            // 计算 AABB 尺寸
            let w = +attr["aabb_max.x"] - +attr["aabb_min.x"];
            let h = +attr["aabb_max.y"] - +attr["aabb_min.y"];

            // 半径为0时应当省略
            const circle_radius = +attr.circle_radius;
            // 伤害频率为1时应当省略
            const update_every_n_frame = +attr.update_every_n_frame === 1 ? blank : +attr.update_every_n_frame;
            const damage_type = toHumpNaming(String(attr.damage_type).slice(7).toLowerCase());
            const entities_with_tag = attr.entities_with_tag;
            let damageData = new DamageData("");
            if (DamageData.types.includes(damage_type)) {
                damageData[damage_type] = $25(attr.damage_per_frame);
            } else {
                console.warn("非标准伤害类型", attr.damage_type);
            }
            /* prettier-ignore */
            return trim([
                w,
                h,
                damageData + "",
                update_every_n_frame,
                circle_radius,
                entities_with_tag
            ]);
        }
    }

    /** 受损爆炸组件 `可能多个` */
    class ExplodeOnDamageComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");
            const configExplosion = new ConfigExplosion(this.data.config_explosion[0]);
            // 受伤害时爆炸概率
            const explode_on_damage_percent = $value(attr.explode_on_damage_percent, 1);
            // 失效时爆炸概率
            const explode_on_death_percent = $value(attr.explode_on_death_percent, 1);
            // 到达损毁程度后爆炸概率
            const physics_body_modified_death_probability = $value(attr.physics_body_modified_death_probability, 0);
            // 视为损毁的受损程度
            const physics_body_destruction_required = $value(attr.physics_body_destruction_required, 0.5);
            // 爆炸挖掘等级为0时应当省略
            const max_durability_to_destroy = $value(configExplosion.max_durability_to_destroy, 10);
            // 爆炸挖掘能量等级为20000时应当省略
            const ray_energy = $value(configExplosion.ray_energy, 20000);

            /* prettier-ignore */
            return trim([
                configExplosion.damage, //====================== [0] 爆炸伤害
                configExplosion.explosion_radius, //============ [1] 爆炸半径
                configExplosion.damage_mortals, //============== [2] 具备伤害
                explode_on_damage_percent, //=================== [3] 受伤害时爆炸概率
                explode_on_death_percent, //==================== [4] 失效时爆炸概率
                physics_body_modified_death_probability, //===== [5] 到达损毁程度后爆炸概率
                physics_body_destruction_required, //=========== [6] 视为损毁的受损程度
                configExplosion.load_this_entity, //============ [7] 爆炸后加载实体
                configExplosion.knockback_force, //============= [8] 爆炸击退系数
                max_durability_to_destroy, //=================== [9] 爆炸挖掘等级
                ray_energy, //================================== [10] 爆炸挖掘能量
                configExplosion.create_material, //============= [11] 爆炸生成材料
            ]);
        }
    }

    /** 爆炸组件 `可能多个` */
    class ExplosionComponent extends Component {
        // 触发爆炸条件
        static triggerType = {
            ON_HIT: 1,
            ON_TIMER: 2,
            ON_DEATH: 3
        };

        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const data = this.data;
            const attr = this.data("attr");
            const configExplosion = new ConfigExplosion(data.config_explosion[0]);

            // 爆炸挖掘等级为0时应当省略
            const max_durability_to_destroy = $value(configExplosion.max_durability_to_destroy, 10);
            // 爆炸挖掘能量等级为20000时应当省略
            const ray_energy = $value(configExplosion.ray_energy, 20000);
            // 爆炸后实体会被清除
            const kill_entity = +attr.kill_entity === 1 ? blank : 0;
            // 定时触发延迟
            const timeout_frames = +attr.timeout_frames;
            // 定时触发延迟波动
            const timeout_frames_random = $value(attr.timeout_frames_random, 0);
            const { triggerType } = ExplosionComponent;
            const trigger = triggerType[attr.trigger];
            switch (trigger) {
                case triggerType.ON_HIT:
                case triggerType.ON_DEATH:
                    /* prettier-ignore */
                    return trim([
                        trigger,
                        configExplosion.damage,
                        configExplosion.explosion_radius,
                        configExplosion.damage_mortals,
                        configExplosion.load_this_entity,
                        configExplosion.knockback_force,
                        kill_entity,
                        max_durability_to_destroy,
                        ray_energy,
                        configExplosion.create_material
                    ]);
                case triggerType.ON_TIMER:
                    /* prettier-ignore */
                    return trim([
                        trigger, //=========================== [0] 触发条件
                        configExplosion.damage, //============ [1] 爆炸伤害
                        configExplosion.explosion_radius, //== [2] 爆炸半径
                        configExplosion.damage_mortals, //==== [3] 爆炸具备伤害
                        configExplosion.load_this_entity, //== [4] 爆炸加载实体
                        configExplosion.knockback_force, //=== [5] 击退系数
                        kill_entity, //======================= [6] 爆炸后消失
                        max_durability_to_destroy, //========= [7] 爆炸挖掘等级
                        ray_energy, //======================== [8] 爆炸挖掘能量
                        configExplosion.create_material, //=== [9] 爆炸生成材料
                        timeout_frames, //==================== [10] 定时延迟 (仅 ON_TIMER 具备)
                        timeout_frames_random //============== [11] 定时延迟波动 (仅 ON_TIMER 具备)
                    ]);
            }
        }
    }

    /** 闪电组件 */
    class LightningComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");
            const configExplosion = new ConfigExplosion(this.data.config_explosion[0]);
            // 电弧存在时间
            const arc_lifetime = $value(attr.arc_lifetime, 60);
            // 爆炸类型?(闪电轨迹)
            const explosion_type = +attr.explosion_type;
            // 视作投射物
            const is_projectile = +attr.is_projectile;

            // 爆炸挖掘等级为0时应当省略
            const max_durability_to_destroy = $value(configExplosion.max_durability_to_destroy, 10);
            // 爆炸挖掘能量等级为20000时应当省略
            const ray_energy = $value(configExplosion.ray_energy, 20000);

            /* prettier-ignore */
            return trim([
                new Bits([
                    configExplosion.damage_mortals, //===== [0] 爆炸具备伤害
                    explosion_type, //===================== [1] 爆炸具有闪电链
                    is_projectile //======================= [2] 视作投射物
                ]).toBigInt(), //========================== [0] bits
                configExplosion.damage, //================= [1] 爆炸伤害
                configExplosion.explosion_radius, //======= [2] 爆炸半径
                max_durability_to_destroy, //============== [3] 爆炸挖掘等级
                ray_energy, //============================= [4] 爆炸挖掘能量
                configExplosion.load_this_entity, //======= [5] 爆炸后加载实体
                configExplosion.knockback_force, //======== [6] 爆炸击退系数
                configExplosion.create_material  //======== [7] 爆炸生成材料
            ]);
        }
    }

    /** 碰撞箱组件 */
    class HitboxComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }
        [compile]() {
            const data = this.data;
            const attr = this.data("attr");
            // 计算 AABB 尺寸
            let w = +attr.aabb_max_x - +attr.aabb_min_x;
            let h = +attr.aabb_max_y - +attr.aabb_min_y;
            const damage_multiplier = $value(attr.damage_multiplier, 1);
            /* prettier-ignore */
            return trim([
                w,
                h,
                damage_multiplier
            ]);
        }
    }

    /**
     * 游戏效果领域组件
     *
     * ---
     * 具体效果在`ProjectileComponent`的`damage_game_effect_entities`中指定
     */
    class GameAreaEffectComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");
            // 重复应用效果的间隔 `-1`表示每个单位仅能被应用一次
            const frame_length = $value(attr.frame_length, -1);
            const radius = +attr.radius;
            return trim([radius, frame_length]);
        }
    }

    /** 追踪组件 */
    class HomingComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const data = this.data;
            const attr = this.data("attr");
            // 探测半径
            const detect_distance = +attr.detect_distance;
            // 追踪的积极性?
            const homing_targeting_coeff = +attr.homing_targeting_coeff;
            // 追踪时的速度系数(基于原有速度)
            const homing_velocity_multiplier = +attr.homing_velocity_multiplier;
            // 仅转向而不改变速度
            const just_rotate_towards_target = +attr.just_rotate_towards_target;
            // 仅跟踪根实体
            const look_for_root_entities_only = +attr.look_for_root_entities_only;
            // 最大转向角度 (rad/f)
            const max_turn_rate = +attr.max_turn_rate;
            // 目标标签反选
            const predefined_target = +attr.predefined_target;
            // 目标标签
            const target_tag = $value(attr.target_tag, "homing_target");
            // 追踪施法者(回旋镖)
            const target_who_shot = +attr.target_who_shot;
            predefined_target;
            return trim([
                new Bits([
                    target_who_shot, //============== [0] 追踪施法者(回旋镖)
                    just_rotate_towards_target, //=== [1] 仅转向而不改变速度
                    predefined_target, //============ [2] 目标标签反选
                    look_for_root_entities_only //=== [3] 仅追踪根实体
                ]).toBigInt(), //========================== [0] bits
                detect_distance, //======================== [1] 探测半径
                homing_targeting_coeff, //================= [2] 追踪的积极性?
                homing_velocity_multiplier, //============= [3] 追踪时的速度系数(基于原有速度)
                max_turn_rate, //========================== [4] 最大转向角度 (rad/f)
                target_tag //============================== [5] 目标标签
            ]);
        }
    }

    /** 物质转化组件 `可能多个` */
    class MagicConvertMaterialComponent extends Component {
        /** @type {Map<string,number>} */
        static materialConvertDataMap = new Map();
        /**
         * @param {XMLObject} data
         */
        constructor(data, path) {
            super(data);
            const attr = this.data("attr");

            const from = attr.from_material_array.split(",").filter(Boolean).map($materialIndex);
            const to = attr.to_material_array.split(",").filter(Boolean).map($materialIndex);
            this.convertMap = {};
            for (let i = 0; i < from.length; i++) this.convertMap[from[i]] = to[i];
            if (+attr.from_any_material) {
                this.convertMap["*"] = $materialIndex(attr.to_material);
            } else if (!Object.keys(this.convertMap).length) {
                if (attr.from_material_tag) this.convertMap[attr.from_material_tag] = $materialIndex(attr.to_material);
                else {
                    if (attr.from_material !== "unknown" && attr.to_material !== "unknown") {
                        this.convertMap[$materialIndex(attr.from_material)] = $materialIndex(attr.to_material);
                    }
                }
            }
            // 移除无意义转化
            for (const [from, to] of Object.entries(this.convertMap)) {
                if (+from === +to) delete this.convertMap[from];
            }

            if (Object.keys(this.convertMap).length) {
                abbrList.add(this.convertMap);
                // console.log(JSON5.stringify(this.convertMap));
            } else this.convertMap = blank;
        }

        [compile]() {
            const attr = this.data("attr");
            // 转化半径
            const radius = +attr.radius;
            // 是圆形
            const is_circle = +attr.is_circle;
            // 转化实体(这个值好像是错的)
            const convert_entities = +attr.convert_entities;
            // 扩散速度(/f)
            const steps_per_frame = +attr.steps_per_frame;
            // 完成后清除实体
            const kill_when_finished = +attr.kill_when_finished;
            // 点燃材料
            const ignite_materials = $value(+attr.ignite_materials, 0);

            /* prettier-ignore */
            return trim([
                new Bits([
                    convert_entities, //=== [0] 转化实体
                    is_circle, //========== [1] 是圆形
                    kill_when_finished //== [2] 完成后清除实体
                ]).toBigInt(),
                radius, //===================== [1] 半径
                steps_per_frame, //============ [2] 扩散速度(/f)
                abbrList.abbr(this.convertMap), // [3] 转换表
                ignite_materials //============ [4] 点燃材料
            ]);
        }
    }

    /** 材料吞噬组件 `可能多个` */
    class CellEaterComponent extends Component {
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const attr = this.data("attr");
            // 能破坏物理刚体
            const eat_dynamic_physics_bodies = +attr.eat_dynamic_physics_bodies;
            // 吞噬概率
            const eat_probability = +attr.eat_probability;
            // 无法吞噬的材料 默认空气
            const ignored_material = $value(attr.ignored_material, "air");
            // 无法吞噬的材料的标签
            const ignored_material_tag = $value(attr.ignored_material_tag, "");
            // 为true 表示仅能吞噬材料表中物质 否则表示能吞噬材料表外的其它物质
            const limited_materials = +attr.limited_materials;
            // 材料表
            const materials = $value(attr.materials, "");
            // 仅吞噬污渍
            const only_stain = +attr.only_stain;
            // 吞噬半径
            const radius = +attr.radius;
            /* prettier-ignore */
            return trim([
                new Bits([
                    eat_dynamic_physics_bodies, //=== [0] 能破坏物理刚体
                    limited_materials, //============ [1] 为true 表示仅能吞噬材料表中物质 否则表示能吞噬材料表外的其它物质
                    only_stain //==================== [2] 仅吞噬污渍
                ]).toBigInt(),
                radius, //=============================== [0] 吞噬半径
                eat_probability, //====================== [1] 吞噬概率
                ignored_material, //===================== [2] 无法吞噬的材料 默认空气
                ignored_material_tag, //================= [3] 无法吞噬的材料的标签
                materials //============================= [4] 材料表
            ]);
        }
    }

    /** 速度组件 `唯一` */
    class VelocityComponent extends Component {
        constructor(data) {
            super(data);
        }

        [compile]() {
            const data = this.data;
            const attr = data("attr");
            const air_friction = +attr.air_friction;
            const gravity = +attr.gravity_y;
            const mass = +attr.mass;
            const terminal_velocity = $value(+attr.terminal_velocity, 1000);

            /* prettier-ignore */
            return trim([
                air_friction,
                gravity,
                mass,
                terminal_velocity
            ]);
        }
    }

    class GameEffectComponent extends Component {
        constructor(data) {
            super(data);
        }
        [compile]() {
            const data = this.data;
            const attr = data("attr");
            const { effect } = attr;
            const frames = +attr.frames;
            return [effect, frames];
        }
    }
    class LaserEmitterComponent extends Component {
        constructor(data) {
            super(data);
        }
        [compile]() {
            const data = this.data;
            const laser = data.laser[0];
            const attr = laser("attr");
            const damage_to_entities = $25(attr.damage_to_entities);
            const max_cell_durability_to_destroy = +attr.max_cell_durability_to_destroy;
            const damage_to_cells = +attr.damage_to_cells;
            // 射线宽度
            const beam_radius = +attr.beam_radius;
            // 射线长度
            const max_length = +attr.max_length;
            const { beam_particle_type } = attr;
            return [damage_to_entities, max_cell_durability_to_destroy, damage_to_cells, beam_radius, max_length, beam_particle_type];
        }
    }

    class LuaComponent extends Component {
        constructor(data) {
            super(data);
            // const data = this.data;
            const attr = this.data("attr");
            // 掉落金块
            if (attr.script_death === "data/scripts/items/drop_money.lua") {
                this.dropMoney = true;
            }
        }
        [compile]() {
            const data = this.data;
            const attr = data("attr");
            // 掉落金块
            if (attr.script_death === "data/scripts/items/drop_money.lua") {
            }
            return [damage_to_entities, max_cell_durability_to_destroy, damage_to_cells, beam_radius, max_length, beam_particle_type];
        }
    }

    class ItemPickUpperComponent extends Component {
        constructor(data) {
            super(data);
        }
        [compile]() {
            const data = this.data;
            const attr = data("attr");
            return new Bits([+attr.is_immune_to_kicks, +attr.drop_items_on_death]).toBigInt();
        }
    }

    return class NoitaEntity {
        /** @type {{[key: string]: string}} */
        static tags = {};

        static #sortedTags;
        /** @returns {Array<string>} */
        static get sortedTags() {
            if (this.#sortedTags) return this.#sortedTags;
            return (this.#sortedTags = Object.keys(this.tags)
                .map(tag => ({ tag, count: this.tags[tag] }))
                .sort((a, b) => a.count - b.count)
                .map(e => e.tag));
        }

        static DamageModelComponent = DamageModelComponent;

        component = {
            /** @type {ProjectileComponent} 投射物组件 `唯一` */
            projectile: null,
            /** @type {VelocityComponent} 速度组件 `唯一` */
            velocity: null,
            /** @type {DamageModelComponent} 伤害模型组件 `唯一` */
            damageModel: null,
            /** @type {{[key: String]: VariableStorageComponent}} 变量组件 */
            variableStorage: {},
            /** @type {Array<AIAttackComponent>} */
            aIAttack: [],
            /** @type {AnimalAIComponent} */
            animalAI: null,
            /** @type {LifetimeComponent} */
            lifetime: null,
            /** @type {GenomeDataComponent} */
            genomeData: null,
            /** @type {{[key: String]: LoadEntitiesComponent}} */
            loadEntities: [],
            /** @type {Array<AreaDamageComponent>} */
            areaDamage: [],
            /** @type {ExplodeOnDamageComponent} */
            explodeOnDamage: null,
            /** @type {ExplosionComponent} */
            explosion: null,
            /** @type {LightningComponent} */
            lightning: null,
            /** @type {Array<GameAreaEffectComponent>} */
            gameAreaEffect: [],
            /** @type {Array<HomingComponent>} */
            homing: [],
            /** @type {Array<MagicConvertMaterialComponent>} */
            magicConvertMaterial: [],
            /** @type {Array<CellEaterComponent>} */
            cellEater: [],
            /** @type {HitboxComponent} */
            hitbox: null,
            /** @type {Array<GameEffectComponent>} */
            gameEffect: [],
            /** @type {Array<LaserEmitterComponent>} */
            laserEmitter: [],
            /** @type {ItemPickUpperComponent} */
            itemPickUpper: null
        };
        /** @type {Array<String>} */
        tags = [];

        /** @type {String} */
        name = "";

        /**
         * @param {typeof XML.DocumentNode.prototype} doc
         * @param {string} path
         */
        constructor(doc, path) {
            // console.log(path.split("/").at(-1).slice(0, -4));

            this.path = path;
            /** @type {XML_Element} */
            const root = doc.childNodes[0];
            this.tags = root.attr.get("tags").split(",");
            for (const tag of this.tags) {
                if (tag === "") continue;
                if (tag in NoitaEntity.tags) {
                    NoitaEntity.tags[tag]++;
                } else {
                    NoitaEntity.tags[tag] = 1;
                }
            }
            // namekey要以文件名为准 name属性有错的 (ps:超级坦克的name属性写错成了kk坦克的翻译key)
            let nameKey = root.attr.get("name").split("$").at(-1);
            // 检测是否为animals前缀
            if (nameKey.startsWith("animal_")) nameKey = "animal_" + path.split("/").at(-1).slice(0, -4);
            if (nameKey === "DEBUG_NAME:player") nameKey = "animal_player";
            if (nameKey === "unknown") {
                this.name = blank;
                console.log(doc);
            }

            if (nameKey === "projectile_default") this.name = blank;
            else if (nameKey) this.name = zh_cn(nameKey);
            else this.name = blank;
            const { component } = this;
            // /** @type {XMLObject} */
            const { xmlObject } = root;
            for (const key in xmlObject) {
                const values = xmlObject[key];
                switch (key) {
                    case "ProjectileComponent":
                        try {
                            component.projectile = new ProjectileComponent(values[0], path);
                        } catch (error) {
                            console.warn("!!!");
                            console.dir(rawRoot.xmlObject);
                        }
                        break;
                    case "VelocityComponent":
                        component.velocity = new VelocityComponent(values[0]);
                        break;
                    case "DamageModelComponent":
                        component.damageModel = new DamageModelComponent(values[0], path);
                        break;
                    case "VariableStorageComponent":
                        for (let i = 0; i < values.length; i++) {
                            const comp = new VariableStorageComponent(values[i], path);
                            component.variableStorage[comp.name] = comp;
                        }
                        break;
                    case "AIAttackComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.aIAttack.push(new AIAttackComponent(values[i]));
                        }
                        break;
                    case "AnimalAIComponent":
                        component.animalAI = new AnimalAIComponent(values[0], path);
                        if (component.animalAI.hasAttackRanged) component.aIAttack.push(component.animalAI);
                        break;

                    case "LifetimeComponent":
                        component.lifetime = new LifetimeComponent(values[0]);
                        break;
                    case "GenomeDataComponent":
                        component.genomeData = new GenomeDataComponent(values[0]);
                        break;
                    case "LoadEntitiesComponent": {
                        const comp = new LoadEntitiesComponent(values[0]);
                        component.loadEntities[comp.entity] = comp;
                        break;
                    }
                    case "AreaDamageComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.areaDamage.push(new AreaDamageComponent(values[i]));
                        }
                        break;
                    case "ExplodeOnDamageComponent":
                        component.explodeOnDamage = new ExplodeOnDamageComponent(values[0]);
                        break;
                    case "ExplosionComponent":
                        component.explosion = new ExplosionComponent(values[0]);
                        break;
                    case "LightningComponent":
                        component.lightning = new LightningComponent(values[0]);
                        break;
                    case "GameAreaEffectComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.gameAreaEffect.push(new GameAreaEffectComponent(values[i]));
                        }
                        break;
                    case "HomingComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.homing.push(new HomingComponent(values[i]));
                        }
                        break;
                    case "MagicConvertMaterialComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.magicConvertMaterial.push(new MagicConvertMaterialComponent(values[i], path));
                        }
                        break;
                    case "CellEaterComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.cellEater.push(new CellEaterComponent(values[i]));
                        }
                        break;
                    case "HitboxComponent":
                        this.component.hitbox = new HitboxComponent(values[0]);
                        break;
                    case "SpriteComponent":
                        // new SpriteComponent(values[0]).canavs; //读取canvas
                        break;
                    case "GameEffectComponent":
                        for (let i = 0; i < values.length; i++) {
                            // console.log(new GameEffectComponent(values[i])[compile]());

                            this.component.gameEffect.push(new GameEffectComponent(values[i]));
                        }
                        break;
                    case "LaserEmitterComponent":
                        for (let i = 0; i < values.length; i++) {
                            this.component.laserEmitter.push(new LaserEmitterComponent(values[i]));
                        }
                        break;
                    case "LuaComponent": {
                        for (let i = 0; i < values.length; i++) {
                            const comp = new LuaComponent(values[i]);
                            if (comp.dropMoney) this.dropMoney = comp.dropMoney;
                        }
                        break;
                    }
                    case "ItemPickUpperComponent":
                        this.component.itemPickUpper = new ItemPickUpperComponent(values[0]);
                        break;
                }
            }
            // 查询子实体的 GameEffect组件
            for (const childEntity of xmlObject.Entity ?? []) {
                for (const key in childEntity) {
                    const values = childEntity[key];
                    switch (key) {
                        case "GameEffectComponent":
                            for (let i = 0; i < values.length; i++) {
                                // console.log(new GameEffectComponent(values[i])[compile]());

                                this.component.gameEffect.push(new GameEffectComponent(values[i]));
                            }
                            break;
                    }
                }
            }
        }

        compile() {
            // console.log("@@", this.path);
            const obj = Object.create(null);

            const { component: _ } = this;

            {
                const tags = new Bits(NoitaEntity.sortedTags.map(tag => this.tags.includes(tag))).toBigInt().toString(36);
                obj[0] = trim([this.name, tags, this.dropMoney ? 1 : blank]);
            }

            if (_.projectile) obj[1] = _.projectile[compile]();

            if (_.damageModel) obj[2] = _.damageModel[compile]();

            if (_.animalAI) obj[3] = _.animalAI[compile]();

            for (const key in _.variableStorage) {
                obj[4] ??= Object.create(null);
                obj[4][key] = _.variableStorage[key][compile]();
            }

            for (const comp of _.aIAttack) {
                obj[5] ??= [];
                obj[5].push(comp[compile]("AIAttackComponent"));
            }

            if (_.lifetime) obj[6] = _.lifetime[compile]();

            if (_.genomeData) obj[7] = _.genomeData[compile]();
            for (const key in _.loadEntities) {
                obj[8] ??= Object.create(null);
                obj[8][key] = _.loadEntities[key][compile]();
            }
            for (const comp of _.areaDamage) {
                obj[9] ??= [];
                obj[9].push(comp[compile]());
            }
            if (_.explodeOnDamage) obj[10] = _.explodeOnDamage[compile]();
            if (_.explosion) obj[11] = _.explosion[compile]();
            if (_.lightning) obj[12] = _.lightning[compile]();
            for (const comp of _.gameAreaEffect) {
                obj[13] ??= [];
                obj[13].push(comp[compile]());
            }
            for (const comp of _.homing) {
                obj[14] ??= [];
                obj[14].push(comp[compile]());
            }
            for (const comp of _.magicConvertMaterial) {
                obj[15] ??= [];
                obj[15].push(comp[compile]());
            }
            for (const comp of _.cellEater) {
                obj[16] ??= [];
                obj[16].push(comp[compile]());
            }
            if (_.hitbox) obj[17] = _.hitbox[compile]();
            if (_.velocity) obj[18] = _.velocity[compile]();
            for (const comp of _.gameEffect) {
                obj[19] ??= [];
                obj[19].push(comp[compile]());
            }
            for (const comp of _.laserEmitter) {
                obj[20] ??= [];
                obj[20].push(comp[compile]());
            }
            if (_.itemPickUpper) obj[21] = _.itemPickUpper[compile]();
            return obj;
        }
    };
})();

(async () => {
    await langData.ready;
    NoitaEntity.lifetimeList = await parseCSVFromUrl("lifetimeList.csv");
    const all = list;
    //可读性极好的代码
    /* prettier-ignore */
    const r = (await Promise.all(all.map(async url => {
        const doc = XML.parse(await (await fetch(url)).text(), { ignore: ["#text", "#comment"] });
        let rawDoc;
        try {
            // const text = await (await fetch("/" + url)).text();
            // rawDoc = XML.parse(text, { ignore: ["#text", "#comment"] });
        } catch (error) { // 404 处理
            rawDoc = null;
        }
        const data = new NoitaEntity(doc,url);
        return data;
    }))).map(e => e.compile());

    const result = Object.create(null);
    for (let i = 0; i < r.length; i++) {
        // console.log(all[i], i);
        /** @type {String} */
        const path = minPath(all[i]);
        // console.log(path);
        const _namespaces = path.split("/");

        const id = _namespaces.pop();
        let target = result;
        for (const _ of _namespaces) target = target[_] ??= Object.create(null);
        target[id] = r[i];
    }
    console.log(result, r.length);

    /* prettier-ignore */
    console.log(`((${
        abbrList
        // NoitaEntity.DamageModelComponent.materialDamageDataMapArray.map((v, i) => `$${i.toString(36)}=${v}`).join(",")
        })=>[${
            JSON5.stringify(result)},"${NoitaEntity.sortedTags.join(" ")
        }"])()`);

    console.log(abbrList);
    console.log(attackRangedEntityFiles);

    // NoitaEntity.DamageModelComponent.getMaterialDamageDataIndex({});
})();
