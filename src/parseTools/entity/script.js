const blank = Symbol("");
const zh_cn = langData.getZH_CN;
/**
 * 最小化xml路径
 * @param {String} path
 */
const minPath = path => {
    let paths = path.split(",").map(p => p.replace("data/entities/", "").replace(".xml", ""));
    paths = paths.filter(p => !p.startsWith("particles/"));
    if (paths.length) return paths.join(",");
    return blank;
};

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
            const path = "/" + this.data.image_file;
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
                    // document.body.append(img);
                    const rectAnimationElements = root.childNodes.query("RectAnimation");
                    /** @type {{[key: String]: Array<HTMLCanvasElement>}} */
                    const result = {};
                    for (const rectAnimation of rectAnimationElements) {
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
                        for (let i = 0; i < count; i++) {
                            const canavs = h.canvas();
                            canavs.height = height;
                            canavs.width = width;
                            const ctx = canavs.getContext("2d");
                            ctx.drawImage(img, x + i * width, y, width, height, 0, 0, width, height);
                            canvasArray[i] = canavs;
                        }
                        result[name] = canvasArray;
                    }
                    // 放到页面上看看效果
                    const box = h.section({ class: "box" }, h.h3(path));
                    for (const name in result) {
                        const canvases = result[name];
                        box.append(h.details({ open: true }, h.summary(name), canvases));
                    }
                    document.body.append(box);
                });
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
            /** @type {Number} 爆炸伤害 */
            this.damage = $25(data.damage);
            /** @type {Number} 爆炸半径 */
            this.explosion_radius = +data.explosion_radius;
            /** @type {0|1} 具备伤害 */
            this.damage_mortals = +data.damage_mortals;
            /** @type {(typeof blank)|String} 爆炸后加载实体 */
            this.load_this_entity = data.load_this_entity === "" ? blank : minPath(data.load_this_entity);
            /** @type {(typeof blank)|Number} 爆炸击退系数 */
            this.knockback_force = +data.knockback_force === 1 ? blank : +data.knockback_force;
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
            const configExplosion = new ConfigExplosion(data.config_explosion[0]);
            const damageData = new DamageData("", 0);
            // 读取伤害

            // 从<damage_by_type> 获取数据
            const damage_by_type = data.damage_by_type[0];
            for (const key in damage_by_type) damageData[toHumpNaming(key)] = $25(damage_by_type[key]);

            // 投射物伤害直接从组件属性获取
            damageData.projectile = $25(data.damage);

            //爆炸伤害从<config_explosion>中获取
            damageData.explosion = configExplosion.damage;

            //爆炸生成的实体
            const explosionEntity = configExplosion.load_this_entity;

            //碰撞生成的实体
            const collisionEntity = minPath(data.spawn_entity) || blank;

            // 保险时间为-1f时应当省略
            const collide_with_shooter_frames = +data.collide_with_shooter_frames === -1 ? blank : +data.collide_with_shooter_frames;

            // 散射为0时应当省略
            const direction_random_rad = +data.direction_random_rad === 0 ? blank : +data.direction_random_rad;

            // 伤害频率为1f/次 时应当省略
            const damage_every_x_frames = Math.abs(+data.damage_every_x_frames) === 1 ? blank : +data.damage_every_x_frames;

            // 榨血系数为1时应当省略
            const blood_count_multiplier = +data.blood_count_multiplier === 1 ? blank : +data.blood_count_multiplier;

            // 存在时间波动为0f时应当省略
            const lifetime_randomness = +data.lifetime_randomness === 0 ? blank : +data.lifetime_randomness;
            let lifetime = +data.lifetime;
            if (+data.lifetime_randomness) {
                //存在波动时使用人工解析数据
                lifetime = +NoitaEntity.lifetimeList.get(this.path, "lifetime");
                // console.warn(this.path, lifetime);
            }

            // 弹跳次数为0时应当省略
            const bounces_left = +data.bounces_left === 0 ? blank : +data.bounces_left;

            // 击退系数为0时应当省略
            const knockback_force = +data.knockback_force === 0 ? blank : +data.knockback_force;

            // 游戏效果实体
            const damage_game_effect_entities = data.damage_game_effect_entities === "" ? blank : minPath(data.damage_game_effect_entities);

            // 我究竟要不要这个数据
            // 地形穿透等级为0时应当省略
            const ground_penetration_max_durability_to_destroy = +data.ground_penetration_max_durability_to_destroy === 0 ? blank : +data.ground_penetration_max_durability_to_destroy === 0;

            /* prettier-ignore */
            return trim([
                bitsToNum([
                    +data.friendly_fire, //================== [0] 友方伤害
                    configExplosion.damage_mortals, //======= [1] 爆炸造成伤害
                    +data.explosion_dont_damage_shooter, //== [2] 爆炸无自伤
                    +data.collide_with_entities, //========== [3] 命中实体
                    +data.collide_with_world, //============= [4] 命中地形
                    +data.damage_scaled_by_speed, //========= [5] 差速伤害加成
                    +data.die_on_liquid_collision, //======== [6] 接触液体时失效
                    +data.die_on_low_velocity, //============ [7] 低速时失效
                    +data.on_collision_die, //=============== [8] 碰撞(命中)时失效
                    +data.on_death_explode, //=============== [9] 失效时爆炸
                    +data.on_lifetime_out_explode, //======== [10] 过期时爆炸
                    +data.on_collision_spawn_entity, //====== [11] 在碰撞时生成实体
                    +data.spawn_entity_is_projectile, //===== [12] 生成实体是投射物 (具备施法者信息)
                    +data.penetrate_entities, //============= [13] 穿透实体
                    +data.penetrate_world, //================ [14] 穿透地形
                    +data.do_moveto_update //================ [15] 不产生命中
                ]), //================================================ [0] bits
                damageData.toString(), //============================= [1] 伤害数据
                configExplosion.explosion_radius, //================== [2] 爆炸半径
                lifetime, //========================================== [3] 存在时间 (注意导出的数据存在时间已被修改)
                +data.speed_max, //=================================== [4] 最大速度
                +data.speed_min, //=================================== [5] 最小速度
                //=========// 下面这些很有可能会使用默认值 放在末尾方便省略 //==========//
                lifetime_randomness, //=============================== [6] 存在时间波动 默认0
                direction_random_rad, //============================== [7] 散射        默认0
                knockback_force, //=================================== [8] 击退系数    默认0
                bounces_left, //====================================== [9] 弹跳次数    默认0
                damage_every_x_frames, //============================= [10] 伤害频率    默认1
                blood_count_multiplier, //============================ [11] 榨血系数   默认1
                collide_with_shooter_frames, //======================= [12] 保险时间   默认-1
                damage_game_effect_entities, //======================= [13] 游戏效果实体
                collisionEntity, //=================================== [14] 生成实体(碰撞)
                explosionEntity, //=================================== [15] 爆炸生成的实体
                configExplosion.knockback_force, //=================== [16] 爆炸击退系数 默认1
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
            return minPath(this.data.entity_file);
        }

        [compile]() {
            const min = +this.data["count.min"];
            const max = +this.data["count.max"];
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
        constructor(data) {
            super(data);
            this.name = this.data.name;
        }

        [compile]() {
            const _bool = +this.data.value_bool || blank;
            const _float = +this.data.value_float || blank;
            const _int = +this.data.value_int || blank;
            const _string = minPath(this.data.value_string) || blank;
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
        constructor(data) {
            super(data);
        }

        get hasAttackRanged() {
            const file = this.data.attack_ranged_entity_file;
            if (!file) return false;
            // 这个投射物是个默认值 并不存在该投射物 应当认为该组件不具备远程攻击
            if (file === "data/entities/projectiles/spear.xml") return false;
            return true;
        }

        #compile_AnimalAIComponent() {
            const data = this.data;
            /* prettier-ignore */
            return [
                data.attack_dash_damage, //============= [0] 冲撞-近战伤害
                data.attack_dash_distance, //=========== [1] 冲撞距离
                data.attack_dash_frames_between, //===== [2] 冲撞冷却
                data.attack_dash_speed, //============== [3] 冲撞速度
                data.attack_melee_damage_max, //======== [4] 直接近战伤害 最大值
                data.attack_melee_damage_min, //======== [5] 直接近战伤害 最小值
                data.attack_melee_max_distance, //====== [6] 直接近战距离
                data.food_material, //================== [7] 食物
                bitsToNum([
                    data.attack_only_if_attacked, //========== [0] 仅被攻击时才会反击
                    data.can_fly, //========================== [1] 可以飞行
                    data.can_walk, //========================= [2] 可以行走
                    data.defecates_and_pees, //=============== [3] 排泄
                    data.dont_counter_attack_own_herd, //===== [4] 被同阵营误伤时不会反击
                    data.sense_creatures, //================== [5] 搜索敌人
                    data.sense_creatures_through_walls, //==== [6] 搜索敌人的视线不受地形阻碍
                    data.tries_to_ranged_attack_friends //==== [7] 使用远程攻击攻击友方 (辅助形怪物)
                ])
            ]
        }

        #compile_AIAttackComponent() {
            const data = this.data;
            if (!this.hasAttackRanged) return console.error(`不应该被转换为AIAttackComponent`);
            /* prettier-ignore */
            return [
                minPath(data.attack_ranged_entity_file), //============ [0] 投射物
                +data.attack_ranged_entity_count_max, //====== [1] 投射物最大数量
                +data.attack_ranged_entity_count_min, //====== [2] 投射物最大数量
                +data.attack_ranged_max_distance, //========== [3] 最大射程
                +data.attack_ranged_min_distance, //========== [4] 最小射程
                +data.attack_ranged_frames_between, //======== [5] 每次攻击冷却
                blank, //===================================== [6] 切换到其它攻击模式的冷却 (应该为0)
                +data.attack_ranged_state_duration_frames //== [7] 攻击状态持续时长
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
        }

        [compile]() {
            const data = this.data;
            /* prettier-ignore */
            const result = [
                minPath(data.attack_ranged_entity_file), //========= [0] 投射物
                +data.attack_ranged_entity_count_max, //=== [1] 投射物最大数量
                +data.attack_ranged_entity_count_min, //=== [2] 投射物最小数量
                +data.max_distance, //===================== [3] 最大射程
                +data.min_distance, //===================== [4] 最小射程
                +data.frames_between, //=================== [5] 每次攻击冷却
                +data.frames_between_global, //============ [6] 切换到其它攻击模式的冷却
                +data.state_duration_frames, //============ [7] 攻击状态持续时长
                +data.use_probability //=================== [8] 攻击模式被使用概率
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
        constructor(data) {
            super(data);
        }

        [compile]() {
            const data = this.data;

            //读取承伤系数
            const damageData = new DamageData("", 1, "multipliers");

            const damageMultipliers = data.damage_multipliers[0];
            for (const key in damageMultipliers) damageData[toHumpNaming(key)] = +damageMultipliers[key];

            //读取材料伤害
            const materialDamageData = {};

            /** @type {Array<String>} */
            const damages = data.materials_how_much_damage.split(",");
            /** @type {Array<String>} */
            const materials = data.materials_that_damage.split(",");

            if (materials.join("") !== "") {
                for (let i = 0; i < damages.length; i++) materialDamageData[materials[i]] = +damages[i];
            }

            /* prettier-ignore */
            return [
                $25(data.max_hp), //===================== [0] 生命值上限
                data.blood_material, //======================== [1] 血液材料
                data.blood_spray_material, //================== [2] 溅射血液材料
                data.ragdoll_material, //====================== [3] 尸体材料
                materialDamageData, //========================= [4] 材料伤害
                +data.air_in_lungs_max, //===================== [5] 肺容量
                $25(data.air_lack_of_damage), //======== [6] 窒息伤害
                +data.fire_probability_of_ignition, //========= [7] 点燃概率
                $25(data.fire_damage_ignited_amount), //= [8] 点燃伤害
                +data.fire_damage_amount, //=================== [9] 燃烧伤害
                +data.falling_damage_damage_max, //============ [10] 最大摔落伤害
                +data.falling_damage_damage_min, //============ [11] 最小摔落伤害
                +data.falling_damage_height_max, //============ [12] 最大摔落高度
                +data.falling_damage_height_min, //============ [13] 最小摔落高度
                +data.critical_damage_resistance, //=========== [14] 暴击抗性
                $25(data.wet_status_effect_damage), //== [15] 潮湿状态伤害
                damageData.toString(), //====================== [16] 承伤系数
                bitsToNum([
                    +data.air_needed, //================ [0] 需要呼吸
                    +data.is_on_fire, //================ [1] 始终燃烧
                    +data.falling_damages, //=========== [2] 有摔落伤害
                    +data.create_ragdoll, //============ [3] 遗留尸体
                    +data.ui_report_damage, //========== [4] 扣血显示
                    +data.physics_objects_damage //===== [5] 受冲击伤害
                ]) //==================================== [17] bits
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
            const data = this.data;
            /* prettier-ignore */
            return [
                +data.food_chain_rank, //================ [0] 食物链等级
                data.herd_id, //========================= [1] 阵营
                bitsToNum([
                    +data.berserk_dont_attack_friends, //= [0] 狂暴不攻击友方
                    +data.is_predator  //================= [1] 肉食性
                ])
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
            const randomMin = +this.data["randomize_lifetime.min"];
            const randomMax = +this.data["randomize_lifetime.max"];
            if (randomMin !== 0 || randomMax !== 0) return [+this.data.lifetime + randomMin, +this.data.lifetime + randomMax];

            return +this.data.lifetime;
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
            const data = this.data;
            // 计算 AABB 尺寸
            let w = +data["aabb_max.x"] - +data["aabb_min.x"];
            let h = +data["aabb_max.y"] - +data["aabb_min.y"];

            // 半径为0时应当省略
            const circle_radius = +data.circle_radius;
            // 伤害频率为1时应当省略
            const update_every_n_frame = +data.update_every_n_frame === 1 ? blank : +data.update_every_n_frame;
            const damage_type = toHumpNaming(String(data.damage_type).slice(7).toLowerCase());
            let damageData = new DamageData("");
            if (DamageData.types.includes(damage_type)) {
                damageData[damage_type] = $25(data.damage_per_frame);
            } else {
                console.warn("非标准伤害类型", data.damage_type);
            }
            /* prettier-ignore */
            return trim([
                w,
                h,
                damageData + "",
                update_every_n_frame,
                circle_radius
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
            const data = this.data;
            const configExplosion = new ConfigExplosion(data.config_explosion[0]);
            // 受伤害时爆炸概率
            const explode_on_damage_percent = +data.explode_on_damage_percent === 1 ? blank : +data.explode_on_damage_percent;
            // 失效时爆炸概率
            const explode_on_death_percent = +data.explode_on_death_percent === 1 ? blank : +data.explode_on_death_percent;
            // 到达损毁程度后爆炸概率
            const physics_body_modified_death_probability = +data.physics_body_modified_death_probability === 0 ? blank : +data.physics_body_modified_death_probability;
            // 视为损毁的受损程度
            const physics_body_destruction_required = +data.physics_body_destruction_required === 0.5 ? blank : +data.physics_body_destruction_required;
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
                configExplosion.knockback_force //============== [8] 爆炸击退系数
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
            const configExplosion = new ConfigExplosion(data.config_explosion[0]);
            // 爆炸后实体会被清除
            const kill_entity = +data.kill_entity === 1 ? blank : 0;
            // 定时触发延迟
            const timeout_frames = +data.timeout_frames;
            // 定时触发延迟波动
            const timeout_frames_random = +data.timeout_frames_random === 0 ? blank : +data.timeout_frames_random;
            const { triggerType } = ExplosionComponent;
            const trigger = triggerType[data.trigger];
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
                        timeout_frames, //==================== [7] 定时延迟 (仅 ON_TIMER 具备)
                        timeout_frames_random //============== [8] 定时延迟波动 (仅 ON_TIMER 具备)
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
            const data = this.data;
            const configExplosion = new ConfigExplosion(data.config_explosion[0]);
            // 电弧存在时间
            const arc_lifetime = +data.arc_lifetime === 60 ? blank : +data.arc_lifetime;
            // 爆炸类型?(闪电轨迹)
            const explosion_type = +data.explosion_type;
            // 视作投射物
            const is_projectile = +data.is_projectile;

            /* prettier-ignore */
            return trim([
                bitsToNum([
                    configExplosion.damage_mortals, //===== [0] 爆炸具备伤害
                    explosion_type, //===================== [1] 爆炸具有闪电链
                    is_projectile //======================= [2] 视作投射物
                ]), //===================================== [0] bits
                configExplosion.damage, //================= [1] 爆炸伤害
                configExplosion.explosion_radius, //======= [2] 爆炸半径
                configExplosion.load_this_entity, //======= [3] 爆炸后加载实体
                configExplosion.knockback_force //========= [4] 爆炸击退系数
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
            // 计算 AABB 尺寸
            let w = +data.aabb_max_x - +data.aabb_min_x;
            let h = +data.aabb_max_y - +data.aabb_min_y;
            const damage_multiplier = +data.damage_multiplier === 1 ? blank : +data.damage_multiplier;
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
            const data = this.data;
            // 重复应用效果的间隔 `-1`表示每个单位仅能被应用一次
            const frame_length = +data.frame_length === -1 ? blank : +data.frame_length;
            const radius = +data.radius;
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
            // 探测半径
            const detect_distance = +data.detect_distance;
            // 追踪的积极性?
            const homing_targeting_coeff = +data.homing_targeting_coeff;
            // 追踪时的速度系数(基于原有速度)
            const homing_velocity_multiplier = +data.homing_velocity_multiplier;
            // 仅转向而不改变速度
            const just_rotate_towards_target = +data.just_rotate_towards_target;
            // 仅跟踪根实体
            const look_for_root_entities_only = +data.look_for_root_entities_only;
            // 最大转向角度 (rad/f)
            const max_turn_rate = +data.max_turn_rate;
            // 目标标签反选
            const predefined_target = +data.predefined_target;
            // 目标标签
            const target_tag = data.target_tag === "homing_target" ? blank : data.target_tag;
            // 追踪施法者(回旋镖)
            const target_who_shot = +data.target_who_shot;
            predefined_target;
            return trim([
                bitsToNum([
                    target_who_shot, //============== [0] 追踪施法者(回旋镖)
                    just_rotate_towards_target, //=== [1] 仅转向而不改变速度
                    predefined_target, //============ [2] 目标标签反选
                    look_for_root_entities_only //=== [3] 仅追踪根实体
                ]), //===================================== [0] bits
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
        /**
         * @param {XMLObject} data
         */
        constructor(data) {
            super(data);
        }

        [compile]() {
            const data = this.data;
            // 转化半径
            const radius = +data.radius;
            // 是圆形
            const is_circle = +data.is_circle;
            // 转化实体(这个值好像是错的)
            const convert_entities = +data.convert_entities;
            // 原料
            const from_material = data.from_material === "air" ? blank : data.from_material;
            // 产物
            const to_material = data.to_material;
            // 任何原料
            const from_any_material = +data.from_any_material;
            // 扩散速度(/f)
            const steps_per_frame = +data.steps_per_frame;
            // 完成后清除实体
            const kill_when_finished = +data.kill_when_finished;

            /* prettier-ignore */
            return trim([
                bitsToNum([
                    convert_entities, //=== [0] 转化实体
                    is_circle, //========== [1] 是圆形
                    from_any_material, //== [2] 任何原料
                    kill_when_finished //== [3] 完成后清除实体
                ]),
                radius, //===================== [1] 半径
                from_material, //============== [2] 原料
                to_material, //================ [3] 产物
                steps_per_frame, //============ [4] 扩散速度(/f)
                data.from_material_array, //=== [5] 原料组
                data.to_material_array //====== [6] 产物组
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
            const data = this.data;
            // 能破坏物理刚体
            const eat_dynamic_physics_bodies = +data.eat_dynamic_physics_bodies;
            // 吞噬概率
            const eat_probability = +data.eat_probability;
            // 无法吞噬的材料 默认空气
            const ignored_material = data.ignored_material === "air" ? blank : data.ignored_material;
            // 无法吞噬的材料的标签
            const ignored_material_tag = data.ignored_material_tag === "" ? blank : data.ignored_material_tag;
            // 为true 表示仅能吞噬材料表中物质 否则表示能吞噬材料表外的其它物质
            const limited_materials = +data.limited_materials;
            // 材料表
            const materials = data.materials === "" ? blank : data.materials;
            // 仅吞噬污渍
            const only_stain = +data.only_stain;
            // 吞噬半径
            const radius = +data.radius;
            /* prettier-ignore */
            return trim([
                bitsToNum([
                    eat_dynamic_physics_bodies, //=== [0] 能破坏物理刚体
                    limited_materials, //============ [1] 为true 表示仅能吞噬材料表中物质 否则表示能吞噬材料表外的其它物质
                    only_stain //==================== [2] 仅吞噬污渍
                ]),
                radius, //=============================== [0] 吞噬半径
                eat_probability, //====================== [1] 吞噬概率
                ignored_material, //===================== [2] 无法吞噬的材料 默认空气
                ignored_material_tag, //================= [3] 无法吞噬的材料的标签
                materials //============================= [4] 材料表
            ]);
        }
    }

    return class NoitaEntity {
        static #tagDatas = {};
        static #tag;
        static get tags() {
            if (this.#tag) return this.#tag;
            const arr = [];
            for (const tag in this.#tagDatas) arr.push({ tag, count: this.#tagDatas[tag] });

            return (this.#tag = arr.sort((a, b) => a.count - b.count));
        }
        /** @param {String} tag  */
        static #addTag(tag) {
            if (this.#tagDatas[tag]) {
                this.#tagDatas[tag]++;
            } else {
                this.#tagDatas[tag] = 1;
            }
        }
        /** @type {Array<String>} */
        static tags = [];
        component = {
            /** @type {ProjectileComponent} 投射物组件 `唯一` */
            projectile: null,
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
            hitbox: null
        };
        /** @type {Array<String>} */
        tags = [];

        /** @type {String} */
        name = "";

        /**
         * @param {typeof XML.DocumentNode.prototype} doc
         */
        constructor(doc, path) {
            /** @type {XML_Element} */
            const root = doc.childNodes[0];
            this.tags = root.attr.get("tags").split(",");
            for (const tag of this.tags) {
                if (tag === "") continue;
                if (!NoitaEntity.tags.includes(tag)) NoitaEntity.tags.push(tag);
            }
            const nameKey = root.attr.get("name").split("$").at(-1);
            if (nameKey === "unknown") console.log(doc);

            if (nameKey === "projectile_default") this.name = blank;
            else if (nameKey) this.name = zh_cn(nameKey);
            else this.name = blank;
            const { component } = this;
            /** @type {XMLObject} */
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
                    case "DamageModelComponent":
                        component.damageModel = new DamageModelComponent(values[0]);
                        break;
                    case "VariableStorageComponent":
                        for (let i = 0; i < values.length; i++) {
                            const comp = new VariableStorageComponent(values[i]);
                            component.variableStorage[comp.name] = comp;
                        }
                        break;
                    case "AIAttackComponent":
                        for (let i = 0; i < values.length; i++) {
                            component.aIAttack.push(new AIAttackComponent(values[i]));
                        }
                        break;
                    case "AnimalAIComponent":
                        component.animalAI = new AnimalAIComponent(values[0]);
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
                        component.areaDamage.push(new AreaDamageComponent(values[0]));
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
                            component.magicConvertMaterial.push(new MagicConvertMaterialComponent(values[i]));
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
                        new SpriteComponent(values[0]).canavs; //读取canvas
                        break;
                }
            }
        }

        compile() {
            const obj = Object.create(null);

            const { component: _ } = this;

            {
                /** @type {[Number,Number,Number]} 使用三位 32bit整数表示72个标签的状态 */
                const codes = [];
                for (let i = 0; i < NoitaEntity.tags.length; ) {
                    const bits = new Array(32);
                    for (let j = 0; j < 32; j++, i++) {
                        if (i >= NoitaEntity.tags.length) break;
                        bits[j] = this.tags.includes(NoitaEntity.tags[i]);
                    }
                    codes.push(bitsToNum(bits));
                }

                obj[0] = [this.name, ...codes];
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
            return obj;
        }
    };
})();

const list = [
    // 额外实体,游戏效果实体
    "data/entities/misc/effect_disintegrated.xml",
    "data/entities/misc/effect_apply_wet.xml",
    "data/entities/misc/effect_apply_oiled.xml",
    "data/entities/misc/effect_apply_bloody.xml",
    "data/entities/misc/effect_necromancy.xml",
    "data/entities/misc/effect_frozen.xml",
    "data/entities/misc/effect_apply_poison.xml",
    "data/entities/misc/effect_apply_on_fire.xml",
    "data/entities/misc/effect_rainbow_farts.xml",
    "data/entities/misc/caster_cast.xml",
    "data/entities/misc/nolla.xml",
    "data/entities/misc/explosion_remove.xml",
    "data/entities/misc/explosion_tiny.xml",
    "data/entities/misc/laser_emitter_wider.xml",
    "data/entities/misc/quantum_split.xml",
    "data/entities/misc/sinewave.xml",
    "data/entities/misc/chaotic_arc.xml",
    "data/entities/misc/pingpong_path.xml",
    "data/entities/misc/avoiding_arc.xml",
    "data/entities/misc/floating_arc.xml",
    "data/entities/misc/fly_downwards.xml",
    "data/entities/misc/fly_upwards.xml",
    "data/entities/misc/horizontal_arc.xml",
    "data/entities/misc/line_arc.xml",
    "data/entities/misc/spiraling_shot.xml",
    "data/entities/misc/orbit_shot.xml",
    "data/entities/misc/phasing_arc.xml",
    "data/entities/misc/true_orbit.xml",
    "data/entities/misc/remove_bounce.xml",
    "data/entities/misc/homing.xml",
    "data/entities/misc/anti_homing.xml",
    "data/entities/misc/homing_wand.xml",
    "data/entities/misc/homing_short.xml",
    "data/entities/misc/homing_rotate.xml",
    "data/entities/misc/homing_shooter.xml",
    "data/entities/misc/autoaim.xml",
    "data/entities/misc/homing_accelerating.xml",
    "data/entities/misc/homing_cursor.xml",
    "data/entities/misc/homing_area.xml",
    "data/entities/misc/piercing_shot.xml",
    "data/entities/misc/clipping_shot.xml",
    "data/entities/misc/area_damage.xml",
    "data/entities/misc/spells_to_power.xml",
    "data/entities/misc/essence_to_power.xml",
    "data/entities/misc/zero_damage.xml",
    "data/entities/misc/accelerating_shot.xml",
    "data/entities/misc/decelerating_shot.xml",
    "data/entities/misc/clusterbomb.xml",
    "data/entities/misc/water_to_poison.xml",
    "data/entities/misc/blood_to_acid.xml",
    "data/entities/misc/lava_to_blood.xml",
    "data/entities/misc/liquid_to_explosion.xml",
    "data/entities/misc/toxic_to_acid.xml",
    "data/entities/misc/static_to_sand.xml",
    "data/entities/misc/transmutation.xml",
    "data/entities/misc/random_explosion.xml",
    "data/entities/misc/light.xml",
    "data/entities/misc/matter_eater.xml",
    "data/entities/misc/hitfx_burning_critical_hit.xml",
    "data/entities/misc/hitfx_critical_water.xml",
    "data/entities/misc/hitfx_critical_oil.xml",
    "data/entities/misc/hitfx_critical_blood.xml",
    "data/entities/misc/hitfx_toxic_charm.xml",
    "data/entities/misc/hitfx_explode_slime.xml",
    "data/entities/misc/hitfx_explode_slime_giga.xml",
    "data/entities/misc/hitfx_explode_alcohol.xml",
    "data/entities/misc/hitfx_explode_alcohol_giga.xml",
    "data/entities/misc/hitfx_petrify.xml",
    "data/entities/misc/rocket_downwards.xml",
    "data/entities/misc/rocket_octagon.xml",
    "data/entities/misc/fizzle.xml",
    "data/entities/misc/bounce_explosion.xml",
    "data/entities/misc/bounce_spark.xml",
    "data/entities/misc/bounce_laser.xml",
    "data/entities/misc/bounce_laser_emitter.xml",
    "data/entities/misc/bounce_larpa.xml",
    "data/entities/misc/bounce_small_explosion.xml",
    "data/entities/misc/bounce_lightning.xml",
    "data/entities/misc/bounce_hole.xml",
    "data/entities/misc/fireball_ray.xml",
    "data/entities/misc/lightning_ray.xml",
    "data/entities/misc/tentacle_ray.xml",
    "data/entities/misc/laser_emitter_ray.xml",
    "data/entities/misc/fireball_ray_line.xml",
    "data/entities/misc/hitfx_fireball_ray_enemy.xml",
    "data/entities/misc/hitfx_lightning_ray_enemy.xml",
    "data/entities/misc/hitfx_tentacle_ray_enemy.xml",
    "data/entities/misc/hitfx_gravity_field_enemy.xml",
    "data/entities/misc/hitfx_curse.xml",
    "data/entities/misc/hitfx_curse_wither_projectile.xml",
    "data/entities/misc/hitfx_curse_wither_explosion.xml",
    "data/entities/misc/hitfx_curse_wither_melee.xml",
    "data/entities/misc/hitfx_curse_wither_electricity.xml",
    "data/entities/misc/orbit_discs.xml",
    "data/entities/misc/orbit_fireballs.xml",
    "data/entities/misc/orbit_nukes.xml",
    "data/entities/misc/orbit_lasers.xml",
    "data/entities/misc/orbit_larpa.xml",
    "data/entities/misc/chain_shot.xml",
    "data/entities/misc/arc_electric.xml",
    "data/entities/misc/arc_fire.xml",
    "data/entities/misc/arc_gunpowder.xml",
    "data/entities/misc/arc_poison.xml",
    "data/entities/misc/crumbling_earth_projectile.xml",
    "data/entities/misc/burn.xml",
    "data/entities/misc/energy_shield_shot.xml",
    "data/entities/misc/larpa_chaos.xml",
    "data/entities/misc/larpa_downwards.xml",
    "data/entities/misc/larpa_upwards.xml",
    "data/entities/misc/larpa_chaos_2.xml",
    "data/entities/misc/larpa_death.xml",
    "data/entities/misc/effect_meteor_rain.xml",
    "data/entities/misc/colour_red.xml",
    "data/entities/misc/colour_orange.xml",
    "data/entities/misc/colour_green.xml",
    "data/entities/misc/colour_yellow.xml",
    "data/entities/misc/colour_purple.xml",
    "data/entities/misc/colour_blue.xml",
    "data/entities/misc/colour_rainbow.xml",
    "data/entities/misc/colour_invis.xml",
    // 法术投射物
    "data/entities/projectiles/bomb.xml",
    "data/entities/projectiles/deck/light_bullet.xml",
    "data/entities/projectiles/deck/light_bullet_blue.xml",
    "data/entities/projectiles/deck/bullet.xml",
    "data/entities/projectiles/deck/bullet_heavy.xml",
    "data/entities/projectiles/deck/light_bullet_air.xml",
    "data/entities/projectiles/deck/bullet_slow.xml",
    "data/entities/projectiles/deck/hook.xml",
    "data/entities/projectiles/deck/black_hole.xml",
    "data/entities/projectiles/deck/white_hole.xml",
    "data/entities/projectiles/deck/black_hole_big.xml",
    "data/entities/projectiles/deck/white_hole_big.xml",
    "data/entities/projectiles/deck/black_hole_giga.xml",
    "data/entities/projectiles/deck/white_hole_giga.xml",
    "data/entities/projectiles/deck/tentacle_portal.xml",
    "data/entities/projectiles/deck/spitter.xml",
    "data/entities/projectiles/deck/spitter_tier_2.xml",
    "data/entities/projectiles/deck/spitter_tier_3.xml",
    "data/entities/projectiles/deck/bubbleshot.xml",
    "data/entities/projectiles/deck/disc_bullet.xml",
    "data/entities/projectiles/deck/disc_bullet_big.xml",
    "data/entities/projectiles/deck/disc_bullet_bigger.xml",
    "data/entities/projectiles/deck/bouncy_orb.xml",
    "data/entities/projectiles/deck/rubber_ball.xml",
    "data/entities/projectiles/deck/arrow.xml",
    "data/entities/projectiles/deck/pollen.xml",
    "data/entities/projectiles/deck/lance.xml",
    "data/entities/projectiles/deck/lance_holy.xml",
    "data/entities/projectiles/deck/rocket.xml",
    "data/entities/projectiles/deck/rocket_tier_2.xml",
    "data/entities/projectiles/deck/rocket_tier_3.xml",
    "data/entities/projectiles/deck/grenade.xml",
    "data/entities/projectiles/deck/grenade_tier_2.xml",
    "data/entities/projectiles/deck/grenade_tier_3.xml",
    "data/entities/projectiles/deck/grenade_anti.xml",
    "data/entities/projectiles/deck/grenade_large.xml",
    "data/entities/projectiles/deck/mine.xml",
    "data/entities/projectiles/deck/pipe_bomb.xml",
    "data/entities/projectiles/deck/fish.xml",
    "data/entities/projectiles/deck/exploding_deer.xml",
    "data/entities/projectiles/deck/duck.xml",
    "data/entities/projectiles/deck/worm_shot.xml",
    "data/entities/projectiles/deck/bomb_detonator.xml",
    "data/entities/projectiles/deck/laser.xml",
    "data/entities/projectiles/deck/megalaser_beam.xml",
    "data/entities/projectiles/deck/megalaser.xml",
    "data/entities/projectiles/deck/lightning.xml",
    "data/entities/projectiles/deck/ball_lightning.xml",
    "data/entities/projectiles/deck/orb_laseremitter.xml",
    "data/entities/projectiles/deck/orb_laseremitter_four.xml",
    "data/entities/projectiles/deck/orb_laseremitter_cutter.xml",
    "data/entities/projectiles/deck/digger.xml",
    "data/entities/projectiles/deck/powerdigger.xml",
    "data/entities/projectiles/deck/chainsaw.xml",
    "data/entities/projectiles/deck/luminous_drill.xml",
    "data/entities/projectiles/deck/tentacle.xml",
    "data/entities/projectiles/deck/heal_bullet.xml",
    "data/entities/projectiles/deck/healhurt.xml",
    "data/entities/projectiles/deck/spiral_shot.xml",
    "data/entities/projectiles/deck/magic_shield_start.xml",
    "data/entities/projectiles/deck/big_magic_shield_start.xml",
    "data/entities/projectiles/deck/chain_bolt.xml",
    "data/entities/projectiles/deck/fireball.xml",
    "data/entities/projectiles/deck/meteor.xml",
    "data/entities/projectiles/deck/flamethrower.xml",
    "data/entities/projectiles/deck/iceball.xml",
    "data/entities/projectiles/deck/slime.xml",
    "data/entities/projectiles/darkflame.xml",
    "data/entities/projectiles/deck/rocket_player.xml",
    "data/entities/projectiles/deck/machinegun_bullet.xml",
    "data/entities/projectiles/deck/pebble_player.xml",
    "data/entities/projectiles/deck/tnt.xml",
    "data/entities/projectiles/deck/glitter_bomb.xml",
    "data/entities/projectiles/deck/buckshot_player.xml",
    "data/entities/projectiles/deck/freezing_gaze_beam.xml",
    "data/entities/projectiles/deck/glowing_bolt.xml",
    "data/entities/projectiles/deck/spore_pod.xml",
    "data/entities/projectiles/deck/glue_shot.xml",
    "data/entities/projectiles/bomb_holy.xml",
    "data/entities/projectiles/bomb_holy_giga.xml",
    "data/entities/projectiles/propane_tank.xml",
    "data/entities/projectiles/bomb_cart.xml",
    "data/entities/projectiles/orb_cursed.xml",
    "data/entities/projectiles/orb_expanding.xml",
    "data/entities/projectiles/deck/crumbling_earth.xml",
    "data/entities/projectiles/deck/rock.xml",
    // "data/entities/items/pickup/egg_nil.xml",
    "data/entities/items/pickup/egg_slime.xml",
    "data/entities/items/pickup/egg_red.xml",
    "data/entities/items/pickup/egg_fire.xml",
    "data/entities/items/pickup/egg_monster.xml",
    "data/entities/items/pickup/egg_hollow.xml",
    "data/entities/projectiles/deck/tntbox.xml",
    "data/entities/projectiles/deck/tntbox_big.xml",
    "data/entities/projectiles/deck/swarm_fly.xml",
    "data/entities/projectiles/deck/swarm_firebug.xml",
    "data/entities/projectiles/deck/swarm_wasp.xml",
    "data/entities/projectiles/deck/friend_fly.xml",
    "data/entities/projectiles/deck/acidshot.xml",
    "data/entities/projectiles/thunderball.xml",
    "data/entities/projectiles/deck/firebomb.xml",
    "data/entities/projectiles/chunk_of_soil.xml",
    "data/entities/projectiles/deck/death_cross.xml",
    "data/entities/projectiles/deck/death_cross_big.xml",
    "data/entities/projectiles/deck/infestation.xml",
    "data/entities/projectiles/deck/wall_horizontal.xml",
    "data/entities/projectiles/deck/wall_vertical.xml",
    "data/entities/projectiles/deck/wall_square.xml",
    "data/entities/projectiles/deck/temporary_wall.xml",
    "data/entities/projectiles/deck/temporary_platform.xml",
    "data/entities/projectiles/deck/purple_explosion_field.xml",
    "data/entities/projectiles/deck/delayed_spell.xml",
    "data/entities/projectiles/deck/long_distance_cast.xml",
    "data/entities/projectiles/deck/teleport_cast.xml",
    "data/entities/projectiles/deck/super_teleport_cast.xml",
    "data/entities/projectiles/deck/caster_cast.xml",
    "data/entities/projectiles/deck/mist_radioactive.xml",
    "data/entities/projectiles/deck/mist_alcohol.xml",
    "data/entities/projectiles/deck/mist_slime.xml",
    "data/entities/projectiles/deck/mist_blood.xml",
    "data/entities/projectiles/deck/circle_fire.xml",
    "data/entities/projectiles/deck/circle_acid.xml",
    "data/entities/projectiles/deck/circle_oil.xml",
    "data/entities/projectiles/deck/circle_water.xml",
    "data/entities/projectiles/deck/material_water.xml",
    "data/entities/projectiles/deck/material_oil.xml",
    "data/entities/projectiles/deck/material_blood.xml",
    "data/entities/projectiles/deck/material_acid.xml",
    "data/entities/projectiles/deck/material_cement.xml",
    "data/entities/projectiles/deck/teleport_projectile.xml",
    "data/entities/projectiles/deck/teleport_projectile_short.xml",
    "data/entities/projectiles/deck/teleport_projectile_static.xml",
    "data/entities/projectiles/deck/swapper.xml",
    "data/entities/projectiles/deck/teleport_projectile_closer.xml",
    "data/entities/projectiles/deck/nuke.xml",
    "data/entities/projectiles/deck/nuke_giga.xml",
    // "data/entities/projectiles/deck/fireworks/firework_nil.xml",
    "data/entities/projectiles/deck/fireworks/firework_pink.xml",
    "data/entities/projectiles/deck/fireworks/firework_green.xml",
    "data/entities/projectiles/deck/fireworks/firework_blue.xml",
    "data/entities/projectiles/deck/fireworks/firework_orange.xml",
    "data/entities/projectiles/deck/wand_ghost_player.xml",
    "data/entities/projectiles/deck/touch_gold.xml",
    "data/entities/projectiles/deck/touch_water.xml",
    "data/entities/projectiles/deck/touch_oil.xml",
    "data/entities/projectiles/deck/touch_alcohol.xml",
    "data/entities/projectiles/deck/touch_piss.xml",
    "data/entities/projectiles/deck/touch_grass.xml",
    "data/entities/projectiles/deck/touch_blood.xml",
    "data/entities/projectiles/deck/touch_smoke.xml",
    "data/entities/projectiles/deck/destruction.xml",
    "data/entities/projectiles/deck/mass_polymorph.xml",
    "data/entities/projectiles/deck/explosion.xml",
    "data/entities/projectiles/deck/explosion_light.xml",
    "data/entities/projectiles/deck/fireblast.xml",
    "data/entities/projectiles/deck/poison_blast.xml",
    "data/entities/projectiles/deck/alcohol_blast.xml",
    "data/entities/projectiles/deck/thunder_blast.xml",
    "data/entities/projectiles/deck/berserk_field.xml",
    "data/entities/projectiles/deck/polymorph_field.xml",
    "data/entities/projectiles/deck/chaos_polymorph_field.xml",
    "data/entities/projectiles/deck/electrocution_field.xml",
    "data/entities/projectiles/deck/freeze_field.xml",
    "data/entities/projectiles/deck/regeneration_field.xml",
    "data/entities/projectiles/deck/teleportation_field.xml",
    "data/entities/projectiles/deck/levitation_field.xml",
    "data/entities/projectiles/deck/shield_field.xml",
    "data/entities/projectiles/deck/projectile_transmutation_field.xml",
    "data/entities/projectiles/deck/projectile_thunder_field.xml",
    "data/entities/projectiles/deck/projectile_gravity_field.xml",
    "data/entities/projectiles/deck/vacuum_powder.xml",
    "data/entities/projectiles/deck/vacuum_liquid.xml",
    "data/entities/projectiles/deck/vacuum_entities.xml",
    "data/entities/projectiles/deck/sea_lava.xml",
    "data/entities/projectiles/deck/sea_alcohol.xml",
    "data/entities/projectiles/deck/sea_oil.xml",
    "data/entities/projectiles/deck/sea_water.xml",
    "data/entities/projectiles/deck/sea_swamp.xml",
    "data/entities/projectiles/deck/sea_acid.xml",
    "data/entities/projectiles/deck/sea_acid_gas.xml",
    "data/entities/projectiles/deck/sea_mimic.xml",
    "data/entities/projectiles/deck/cloud_water.xml",
    "data/entities/projectiles/deck/cloud_oil.xml",
    "data/entities/projectiles/deck/cloud_blood.xml",
    "data/entities/projectiles/deck/cloud_acid.xml",
    "data/entities/projectiles/deck/cloud_thunder.xml",
    "data/entities/projectiles/deck/xray.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_a.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_b.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_c.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_d.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_e.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_f.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_gsharp.xml",
    "data/entities/projectiles/deck/ocarina/ocarina_a2.xml",
    "data/entities/projectiles/deck/kantele/kantele_a.xml",
    "data/entities/projectiles/deck/kantele/kantele_d.xml",
    "data/entities/projectiles/deck/kantele/kantele_dis.xml",
    "data/entities/projectiles/deck/kantele/kantele_e.xml",
    "data/entities/projectiles/deck/kantele/kantele_g.xml",
    "data/entities/projectiles/deck/all_nukes.xml",
    "data/entities/projectiles/deck/all_discs.xml",
    "data/entities/projectiles/deck/all_rockets.xml",
    "data/entities/projectiles/deck/all_deathcrosses.xml",
    "data/entities/projectiles/deck/all_blackholes.xml",
    "data/entities/projectiles/deck/all_acid.xml",
    "data/entities/projectiles/deck/summon_portal.xml",
    "data/entities/projectiles/deck/meteor_rain.xml",
    "data/entities/projectiles/deck/meteor_rain_meteor.xml",
    "data/entities/projectiles/deck/worm_rain.xml",
    // 敌人
    "data/entities/player.xml",
    "data/entities/animals/sheep.xml",
    "data/entities/animals/sheep_bat.xml",
    "data/entities/animals/sheep_fly.xml",
    "data/entities/animals/scorpion.xml",
    "data/entities/animals/fish.xml",
    "data/entities/animals/fish_large.xml",
    "data/entities/animals/duck.xml",
    "data/entities/animals/wolf.xml",
    "data/entities/animals/deer.xml",
    "data/entities/animals/elk.xml",
    "data/entities/animals/eel.xml",
    "data/entities/animals/zombie_weak.xml",
    "data/entities/animals/zombie.xml",
    "data/entities/animals/miner_weak.xml",
    "data/entities/animals/miner.xml",
    "data/entities/animals/miner_fire.xml",
    "data/entities/animals/miner_santa.xml",
    "data/entities/animals/miner_chef.xml",
    "data/entities/animals/goblin_bomb.xml",
    "data/entities/animals/shotgunner_weak.xml",
    "data/entities/animals/shotgunner.xml",
    "data/entities/animals/scavenger_smg.xml",
    "data/entities/animals/scavenger_grenade.xml",
    "data/entities/animals/scavenger_mine.xml",
    "data/entities/animals/scavenger_heal.xml",
    "data/entities/animals/scavenger_glue.xml",
    "data/entities/animals/scavenger_invis.xml",
    "data/entities/animals/scavenger_shield.xml",
    "data/entities/animals/scavenger_poison.xml",
    "data/entities/animals/scavenger_clusterbomb.xml",
    "data/entities/animals/scavenger_leader.xml",
    "data/entities/animals/alchemist.xml",
    "data/entities/animals/sniper.xml",
    "data/entities/animals/shaman.xml",
    "data/entities/animals/coward.xml",
    "data/entities/animals/flamer.xml",
    "data/entities/animals/icer.xml",
    "data/entities/animals/bigzombie.xml",
    "data/entities/animals/bigzombietorso.xml",
    "data/entities/animals/bigzombiehead.xml",
    "data/entities/animals/slimeshooter_weak.xml",
    "data/entities/animals/slimeshooter.xml",
    "data/entities/animals/acidshooter_weak.xml",
    "data/entities/animals/acidshooter.xml",
    "data/entities/animals/lasershooter.xml",
    "data/entities/animals/giantshooter_weak.xml",
    "data/entities/animals/giantshooter.xml",
    "data/entities/animals/miniblob.xml",
    "data/entities/animals/blob.xml",
    "data/entities/animals/ant.xml",
    "data/entities/animals/rat.xml",
    "data/entities/animals/bat.xml",
    "data/entities/animals/bigbat.xml",
    "data/entities/animals/firebug.xml",
    "data/entities/animals/bigfirebug.xml",
    "data/entities/animals/bloom.xml",
    "data/entities/animals/shooterflower.xml",
    "data/entities/animals/fly.xml",
    "data/entities/animals/frog.xml",
    "data/entities/animals/frog_big.xml",
    "data/entities/animals/fungus.xml",
    "data/entities/animals/fungus_big.xml",
    "data/entities/animals/fungus_giga.xml",
    "data/entities/animals/lurker.xml",
    "data/entities/animals/maggot.xml",
    "data/entities/animals/skullrat.xml",
    "data/entities/animals/skullfly.xml",
    "data/entities/animals/tentacler_small.xml",
    "data/entities/animals/tentacler.xml",
    "data/entities/animals/ghoul.xml",
    "data/entities/animals/giant.xml",
    "data/entities/animals/pebble_physics.xml",
    "data/entities/animals/longleg.xml",
    "data/entities/animals/lukki/lukki_tiny.xml",
    "data/entities/animals/lukki/lukki.xml",
    "data/entities/animals/lukki/lukki_longleg.xml",
    "data/entities/animals/lukki/lukki_creepy_long.xml",
    "data/entities/animals/lukki/lukki_dark.xml",
    "data/entities/animals/worm_tiny.xml",
    "data/entities/animals/worm.xml",
    "data/entities/animals/worm_big.xml",
    "data/entities/animals/worm_skull.xml",
    "data/entities/animals/worm_end.xml",
    "data/entities/animals/drone_physics.xml",
    "data/entities/animals/drone_lasership.xml",
    "data/entities/animals/drone_shield.xml",
    "data/entities/animals/basebot_sentry.xml",
    "data/entities/animals/basebot_hidden.xml",
    "data/entities/animals/basebot_neutralizer.xml",
    "data/entities/animals/basebot_soldier.xml",
    "data/entities/animals/healerdrone_physics.xml",
    "data/entities/animals/roboguard.xml",
    "data/entities/animals/roboguard_big.xml",
    "data/entities/animals/assassin.xml",
    "data/entities/animals/spearbot.xml",
    "data/entities/animals/tank.xml",
    "data/entities/animals/tank_rocket.xml",
    "data/entities/animals/tank_super.xml",
    "data/entities/animals/turret_left.xml",
    "data/entities/animals/turret_right.xml",
    "data/entities/animals/monk.xml",
    "data/entities/animals/missilecrab.xml",
    "data/entities/animals/necrobot.xml",
    "data/entities/animals/necrobot_super.xml",
    "data/entities/animals/fireskull.xml",
    "data/entities/animals/iceskull.xml",
    "data/entities/animals/thunderskull.xml",
    "data/entities/animals/firemage_weak.xml",
    "data/entities/animals/firemage.xml",
    "data/entities/animals/icemage.xml",
    "data/entities/animals/thundermage.xml",
    "data/entities/animals/thundermage_big.xml",
    "data/entities/animals/barfer.xml",
    "data/entities/animals/wizard_dark.xml",
    "data/entities/animals/wizard_tele.xml",
    "data/entities/animals/wizard_poly.xml",
    "data/entities/animals/wizard_swapper.xml",
    "data/entities/animals/wizard_neutral.xml",
    "data/entities/animals/wizard_returner.xml",
    "data/entities/animals/wizard_hearty.xml",
    "data/entities/animals/wizard_homing.xml",
    "data/entities/animals/wizard_weaken.xml",
    "data/entities/animals/wizard_twitchy.xml",
    "data/entities/animals/enlightened_alchemist.xml",
    "data/entities/animals/failed_alchemist.xml",
    "data/entities/animals/failed_alchemist_b.xml",
    "data/entities/animals/wraith.xml",
    "data/entities/animals/wraith_storm.xml",
    "data/entities/animals/wraith_glowing.xml",
    "data/entities/animals/statue.xml",
    "data/entities/animals/statue_physics.xml",
    "data/entities/buildings/snowcrystal.xml",
    "data/entities/buildings/hpcrystal.xml",
    "data/entities/animals/ghost.xml",
    "data/entities/animals/wand_ghost.xml",
    "data/entities/animals/ethereal_being.xml",
    "data/entities/animals/playerghost.xml",
    "data/entities/animals/phantom_a.xml",
    "data/entities/animals/phantom_b.xml",
    "data/entities/animals/confusespirit.xml",
    "data/entities/animals/berserkspirit.xml",
    "data/entities/animals/weakspirit.xml",
    "data/entities/animals/slimespirit.xml",
    "data/entities/animals/necromancer.xml",
    "data/entities/animals/gazer.xml",
    "data/entities/animals/skygazer.xml",
    "data/entities/animals/spitmonster.xml",
    "data/entities/animals/crystal_physics.xml",
    "data/entities/animals/bloodcrystal_physics.xml",
    "data/entities/animals/skycrystal_physics.xml",
    "data/entities/animals/chest_mimic.xml",
    "data/entities/animals/chest_leggy.xml",
    "data/entities/animals/miner_hell.xml",
    "data/entities/animals/shotgunner_hell.xml",
    "data/entities/animals/sniper_hell.xml",
    "data/entities/animals/illusions/dark_alchemist.xml",
    "data/entities/animals/illusions/shaman_wind.xml",
    "data/entities/animals/necromancer_shop.xml",
    "data/entities/animals/necromancer_super.xml",
    "data/entities/animals/boss_dragon.xml",
    "data/entities/animals/boss_limbs/boss_limbs.xml",
    "data/entities/animals/boss_meat/boss_meat.xml",
    "data/entities/animals/boss_alchemist/boss_alchemist.xml",
    "data/entities/animals/parallel/alchemist/parallel_alchemist.xml",
    "data/entities/animals/boss_ghost/boss_ghost.xml",
    "data/entities/animals/boss_ghost/boss_ghost_polyp.xml",
    "data/entities/animals/boss_spirit/islandspirit.xml",
    "data/entities/animals/boss_pit/boss_pit.xml",
    "data/entities/animals/boss_robot/boss_robot.xml",
    "data/entities/animals/boss_fish/fish_giga.xml",
    "data/entities/animals/maggot_tiny/maggot_tiny.xml",
    "data/entities/animals/parallel/tentacles/parallel_tentacles.xml",
    "data/entities/animals/special/minipit.xml",
    "data/entities/animals/boss_gate/gate_monster_a.xml",
    "data/entities/animals/boss_gate/gate_monster_b.xml",
    "data/entities/animals/boss_gate/gate_monster_c.xml",
    "data/entities/animals/boss_gate/gate_monster_d.xml",
    "data/entities/animals/boss_wizard/boss_wizard.xml",
    "data/entities/animals/boss_centipede/boss_centipede.xml",
    "data/entities/animals/ultimate_killer.xml",
    "data/entities/animals/friend.xml"
];
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
        return new NoitaEntity(doc,url);
    }))).map(e => e.compile());
    const result = Object.create(null);
    for (let i = 0; i < r.length; i++) {
        // console.log(i, all[i]);

        /** @type {String} */
        const path = minPath(all[i]);
        const _namespaces = path.split("/");

        const id = _namespaces.pop();
        let target = result;
        for (const _ of _namespaces) target = target[_] ??= Object.create(null);
        target[id] = r[i];
    }
    console.log(result);
    console.log(`(()=>[${JSON5.stringify(result)},${JSON5.stringify(NoitaEntity.tags)}])()`);
})();
