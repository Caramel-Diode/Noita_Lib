/**
 * 获取注释文本
 */
const getCommentText = data => `/*
 * Generated by parseTools.spell
 * ${new Date().toLocaleString()}
 * form "data/scripts/gun/gun_actions.lua"
 * ${data}
 */
//prettier-ignore`;

const zh_cn = langData.getZH_CN;
const blank = Symbol("");
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

const extraEntities = new Set();
const gameEffectEntities = new Set();

class Spell {
    /** @type {Map<String,Symbol>} */
    static spawnRequiresFlagMap = new Map();
    //prettier-ignore
    static modifierPropAbbrMap = {
//      修正属性                    简写
        fire_rate_wait           :"frw",
        speed_multiplier         :"spm",
        explosion_radius         :"exr",
        spread_degrees           :"spd",
        pattern_degrees          :"pad",
        
        damage_melee_add         :"dmM",
        damage_projectile_add    :"dmP",
        damage_electricity_add   :"dmL",
        damage_fire_add          :"dmF",
        damage_explosion_add     :"dmE",
        damage_ice_add           :"dmI",
        damage_slice_add         :"dmS",
        damage_healing_add       :"dmH",
        damage_curse_add         :"dmC",
        damage_drill_add         :"dmD",
        damage_overeating_add    :"dmV", // 不存在
        damage_physics_hit_add   :"dmY", // 不存在
        damage_poison_add        :"dmN", // 不存在
        damage_radioactive_add   :"dmR", // 不存在
        damage_holy_add          :"dmO", // 不存在
        damage_critical_chance   :"dcc",
        knockback_force          :"kbf",
        material                 :"mel",
        material_amount          :"mea",
        trail_material           :"tme",
        trail_material_amount    :"tma",
        bounces                  :"boc",
        friendly_fire            :"fyf",
        lifetime_add             :"lft",
        extra_entities           :"exe",
        game_effect_entities     :"gee",
        
        current_reload_time      :"rlt",
        
        recoil_knockback         :"rkb",
    }
    static typeEmojis = ["⚫", "🔴", "🟠", "🔵", "⚪", "🟢", "🟡", "🟣", "🟤"];
    id;
    name;
    alias;
    desc;
    type;
    maxUse; // 负数代表无法无限化 0代表无限制
    mana;
    price;
    passive = "";
    spawnProbs = {};
    spawnRequiresFlag = "";
    draw;
    projectiles;
    action = "";
    nameKey;
    descKey;
    /** @type {CSVData} 别名表 */
    static _aliasCSV;
    /** @type {CSVData} 解锁描述表 */
    static _unlockDescCSV;
    /** @type {CSVData} 被动效果描述表 */
    static _passiveDescCSV;
    /** @type {CSVData} (额外)提供投射物表 */
    static _projectileCSV;
    /** @param {SpellBaseData} data */
    constructor(data) {
        if (data.name.startsWith("$")) {
            this.nameKey = data.name.slice(1);
            this.name = zh_cn(this.nameKey) ?? this.nameKey;
        } else {
            this.nameKey = data.name;
            this.name = data.name;
        }
        if (data.desc.startsWith("$")) {
            this.descKey = data.desc.slice(1);
            this.desc = zh_cn(this.descKey) ?? this.descKey;
        } else {
            this.descKey = data.desc;
            this.desc = data.desc;
        }
        this.alias = Spell._aliasCSV.get(this.name, 1) ?? "";
        if (data.spawnRequiresFlag) {
            const unlockDesc = Spell._unlockDescCSV.get(data.id, 2);
            if (unlockDesc) {
                if (Spell.spawnRequiresFlagMap.has(unlockDesc)) this.spawnRequiresFlag = Spell.spawnRequiresFlagMap.get(unlockDesc);
                else {
                    Spell.spawnRequiresFlagMap.set(unlockDesc, Symbol("$" + (Spell.spawnRequiresFlagMap.size + 1)));
                    this.spawnRequiresFlag = Spell.spawnRequiresFlagMap.get(unlockDesc);
                }
            } else {
                this.spawnRequiresFlag = data.spawnRequiresFlag;
                console.warn(`解锁条件描述缺失 ${data.id}:${data.name}`);
            }
        }
        if (data.passive) {
            const passiveDesc = Spell._passiveDescCSV.get(data.id, 2);
            if (passiveDesc) this.passive = passiveDesc;
            else {
                this.passive = "";
                console.warn(`被动效果描述缺失 ${data.id}:${data.name}`);
            }
        }

        // 提供投射物 转为表达式
        // 格式: 投射物实体ID:数量H碰撞触发抽取数D失效触发抽取数T定时触发抽取数!定时触发延迟时间#提供类型
        const projectilesCache = [];

        /** 关联投射物xml */
        const relatedProjectileName = data.relatedProjectiles?.[0];
        const relatedProjectileAmount = data.relatedProjectiles?.[1] ?? 1;
        let relatedProjectileHasBeenAdded = false; // 防止重复被添加
        for (let i = 0; i < data.projectiles.length; i++) {
            const p = data.projectiles[i];
            // const id = p.id.match(/[\w]+(?=.xml)/)[0].toUpperCase();
            const id = minPath(p.id);
            if (id === blank) continue;
            const cache = [id];

            if (p.min + p.draw_hit + p.draw_death + p.draw_time_count > 1) {
                cache.push(":");
                if (p.min > 1) cache.push(p.min);
                if (p.draw_hit) cache.push("H", p.draw_hit);
                if (p.draw_death) cache.push("D", p.draw_death);
                if (p.draw_time_count) cache.push("T", p.draw_time_count, "!", p.draw_time_delay);
            }
            // 与关联投射物xml不相同或者数量不同时单独声明关联投射物 (蠕虫雨, 召唤虫子系列, 侵扰)
            if (p.id !== relatedProjectileName || p.min !== relatedProjectileAmount) {
                if (!cache.includes(":")) cache.push(":");
                cache.push(`#2`); //提供类型为仅施法块
                projectilesCache.push(cache.join(""));
            } else projectilesCache.push(cache.join(""));

            /* 关联投射物必须存在 */
            if (relatedProjectileName && relatedProjectileName === p.id) {
                relatedProjectileHasBeenAdded = true;
                // 关联投射物数量与施法块投射物数量不一致时(召唤虫子系列, 侵扰)
                if (p.min !== relatedProjectileAmount) {
                    if (relatedProjectileAmount > 1) projectilesCache.push(`${id}:${relatedProjectileAmount}#1`);
                    else projectilesCache.push(`${id}:#1`);
                }
            }
        }
        if (!relatedProjectileHasBeenAdded && relatedProjectileName) {
            const id = minPath(relatedProjectileName);
            if (relatedProjectileAmount > 1) projectilesCache.push(`${id}:${relatedProjectileAmount}#1`);
            else projectilesCache.push(`${id}:#1`);
        }

        // 如果存在人工维护的投射物数据则丢弃解析数据
        {
            const projectiles = Spell._projectileCSV.get(data.id, 2);
            if (projectiles) {
                projectilesCache.length = 0;
                projectilesCache.push(projectiles);
            }
        }
        
        this.projectiles = projectilesCache.join(" ").trimEnd();

        this.damageMod = Object.assign(new DamageData(""), data.damageMod).toString();
        if (data.gameEffectEntities) this.gameEffectEntities = minPath(data.gameEffectEntities);
        if (data.extraEntities) this.extraEntities = minPath(data.extraEntities);
        this.id = data.id;
        this.type = data.type;
        this.maxUse = data.maxUse ?? 0;
        this.mana = data.mana ?? 10; // 蓝耗默认为10
        this.price = data.price;
        const spwanLevels = data.spwanLevel.split(",").map(Number);
        const spawnProbs = data.spawnProb.split(",").map(Number);
        for (let i = 0; i < spawnProbs.length; i++) this.spawnProbs[spwanLevels[i]] = spawnProbs[i];
        this.draw = data.draw;
        // this.modifierAction = data.modifierAction;
        const modifierAction = data.modifierAction;

        const cache = [];
        // 使用'#'表示抽取的位置 以此划分前/后置修正属性
        let flag_separator = 0;
        for (const e of modifierAction) {
            if (e.pos === "after") {
                if (flag_separator !== 1) {
                    if (cache.at(-1)) cache.pop(); //取消不必要的';'
                    cache.push("#");
                    flag_separator = 1;
                }
            } else if (e.pos === "before") flag_separator = -1;

            const prop = Spell.modifierPropAbbrMap[e.prop];
            if (["gee", "exe"].includes(prop)) {
                console.log(prop);

                if (prop === "gee") gameEffectEntities.add(e.value);
                if (prop === "exe") extraEntities.add(e.value);
                e.value = minPath(e.value);
                if (e.value.endsWith(",")) e.value = e.value.slice(0, -1);
                if (!e.value) continue;
            }
            if (typeof e.value === "boolean") e.value = Number(e.value);
            if (prop) cache.push(prop, e.type, e.value, ";");
        }
        if (cache.at(-1)) cache.pop(); //取消不必要的';'
        if (flag_separator < 0) cache.push("#");
        this.modifierAction = cache.join("");
    }

    toString(spread = false) {
        // console.error(this.name, this);

        const alias = this.alias ? this.alias : blank;
        const maxUse = this.maxUse === 0 ? blank : this.maxUse;
        const passive = this.passive ? this.passive : blank;
        const spawnRequiresFlag = this.spawnRequiresFlag ? this.spawnRequiresFlag : blank;
        const draw = this.draw === 0 ? blank : this.draw;
        const projectiles = this.projectiles ? this.projectiles : blank;
        const modifierAction = this.modifierAction ? this.modifierAction : blank;
        const str = JSON5.stringify([
            //===============================[构造器数据索引]
            this.id, //======================[0] id
            this.name, //====================[1] 名称
            alias, //========================[2] 别名
            this.desc, //====================[3] 描述
            this.type, //====================[4] 类型
            maxUse, //=======================[5] 最大使用次数
            this.mana, //====================[6] 蓝耗
            this.price, //===================[7] 售价
            passive, //======================[8] 被动效果
            this.spawnProbs, //==============[9] 生成概率
            spawnRequiresFlag, //============[10] 生成条件
            draw, //=========================[11] 抽取数
            projectiles, //==================[12] 提供投射物
            modifierAction, //===============[13] 修正行为
            this.action, //==================[14] 法术行为
            this.nameKey, //=================[15] 名称键 用于csv翻译映射
            this.descKey //==================[16] 描述键 用于csv翻译映射
        ]);
        if (spread) return str.slice(1, -1);
        return str;
    }
}

(async () => {
    await langData.ready;
    Spell._aliasCSV = await parseCSVFromUrl("alias.csv");
    Spell._unlockDescCSV = await parseCSVFromUrl("unlockDesc.csv");
    Spell._passiveDescCSV = await parseCSVFromUrl("passiveDesc.csv");
    Spell._projectileCSV = await parseCSVFromUrl("projectile.csv");

    const imgs = await Promise.all(spellBaseDatas.map(e => PNG.removeGAMA(`/${e.icon}`)));

    const canvas = await createSprite(imgs, { size: 16 });
    document.querySelector("#canvas-viewport").append(canvas);

    document.body.append(
        h.button(
            {
                async onclick() {
                    const data = spellBaseDatas.map(e => new Spell(e).toString(true));
                    // console.log(data);

                    const params_str = [...Spell.spawnRequiresFlagMap].map(([data, $var]) => `${$var.description}=${JSON.stringify(data)}`).join(",\n    ");
                    const spells_str = data.join(",\n    ");
                    const comment = getCommentText(`共${data.length}条法术数据`);
                    const fileContent = `${comment}\n((\n    ${params_str}\n)=>[\n    ${spells_str}\n])()`;
                    console.log(fileContent);

                    download(fileContent, "spell.data.js");
                    // const cache = [];
                    // for (let i = 0; i < data.length; i++) {
                    //     const d = data[i];
                    //     const base64 = await urlToBase64(imgs[i], 2);
                    //     let alias = "";

                    //     if (d.alias)
                    //         alias = `${d.alias
                    //             .split(" ")
                    //             .map(e => `\`${e}\``)
                    //             .join(",")}`;
                    //     cache.push(`{"name":"${d.id}","description":"**\`${Spell.typeEmojis[d.type]}${d.name}\`**  \\n![](${base64})  \\n${alias}"}`);
                    // }
                    // console.log(cache.join(",\n"));
                }
            },
            "生成法术数据"
        ),
        h.button(
            {
                onclick() {
                    const set = new Set(
                        spellBaseDatas
                            .map(e => {
                                const array = [...e.projectiles.map(e => e.id)];
                                if (e.relatedProjectiles) array.push(e.relatedProjectiles[0]);
                                return array;
                            })
                            .flat(2)
                    );
                    const fileContent = `"${[...set].filter(e => Boolean(e)).join(`",\n"`)}"`;
                    download(fileContent, "projectileList.txt");
                }
            },
            "生成法术引用实体(投射物)列表"
        ),
        h.button(
            {
                onclick() {
                    download(
                        '"' +
                            [...gameEffectEntities, ...extraEntities]
                                .filter(e => !e.startsWith("particles/"))
                                .map(e => e.slice(0, -1))
                                .join(`",\n"`) +
                            '"',
                        "otherEntities.txt"
                    );
                }
            },
            "生成法术引用实体(额外实体,游戏效果实体)列表"
        )
    );
    console.log(gameEffectEntities, extraEntities);
})();
