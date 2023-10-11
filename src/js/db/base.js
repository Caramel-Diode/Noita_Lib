DB.base = class {

    static panelAttrInfo = class {
        static panelAttrIcons = utilities.base64ToImg("panelAttrIcon.png");
        /** @type {Number} */
        #iconIndex;
        /** @type {String} */
        name;
        /**
         * 面板属性信息构造器
         * @param {Number} iconIndex 图标索引
         * @param {String} name 属性名称
         */
        constructor(iconIndex, name) {
            this.#iconIndex = iconIndex;
            this.name = name;
        };
        static datas = new Map([
            ["type", new this(1, "法术类型")],
            ["shuffle", new this(2, "乱序")],
            ["draw", new this(3, "抽取数")],
            ["capacity", new this(4, "容量")],
            ["staticSpells", new this(5, "始终施放")],
            ["manaMax", new this(6, "法力上限")],
            ["manaChargeSpeed", new this(7, "法力恢复速度")],
            ["manaDrain", new this(8, "法力消耗")],
            ["maxUse", new this(9, "最大使用次数")],
            ["remainingUse", new this(9, "剩余使用次数")],
            ["fireRateWait", new this(10, "施放延迟")],
            ["reloadTime", new this(11, "充能时间")],
            ["spreadDegrees", new this(12, "散射")],
            ["projectileDamage", new this(13, "投射物伤害")],
            ["projectileDamageMultiplier", new this(13, "投射物承伤")],
            ["fireDamage", new this(14, "火焰伤害")],
            ["fireDamageMultiplier", new this(14, "火焰承伤")],
            ["iceDamage", new this(15, "冰冻伤害")],
            ["iceDamageMultiplier", new this(15, "冰冻承伤")],
            ["explosionDamage", new this(16, "爆炸伤害")],
            ["explosionDamageMultiplier", new this(16, "爆炸承伤")],
            ["sliceDamage", new this(17, "切割伤害")],
            ["sliceDamageMultiplier", new this(17, "切割承伤")],
            ["drillDamage", new this(18, "穿凿伤害")],
            ["drillDamageMultiplier", new this(18, "穿凿承伤")],
            ["electricityDamage", new this(19, "雷电伤害")],
            ["electricityDamageMultiplier", new this(19, "雷电承伤")],
            ["healingDamage", new this(20, "治疗伤害")],
            ["healingDamageMultiplier", new this(20, "治疗承伤")],
            ["meleeDamage", new this(21, "近战伤害")],
            ["meleeDamageMultiplier", new this(21, "近战承伤")],
            ["curseDamage", new this(22, "诅咒伤害")],
            ["curseDamageMultiplier", new this(22, "诅咒承伤")],
            ["holyDamage", new this(23, "神圣伤害")],
            ["holyDamageMultiplier", new this(23, "神圣承伤")],
            ["overeatingDamage", new this(24, "吃撑伤害")],
            ["overeatingMultiplier", new this(24, "吃撑伤害")],
            ["physicsHitDamage", new this(25, "物理伤害")],
            ["physicsHitDamageMultiplier", new this(25, "物理承伤")],
            ["poisonDamage", new this(26, "剧毒伤害")],
            ["poisonDamageMultiplier", new this(26, "剧毒承伤")],
            ["radioactiveDamage", new this(27, "辐射伤害")],
            ["radioactiveDamageMultiplier", new this(27, "辐射承伤")],
            ["damageCriticalChance", new this(28, "暴击率")],
            ["speed", new this(29, "投射速度")],
            ["speedMultiplier", new this(29, "投射速度倍数")],
            ["explosionRadius", new this(30, "爆炸半径")],
            ["bounces", new this(31, "弹跳次数")],
            ["knockbackForce", new this(32, "击退")],
            ["lifetime", new this(33, "存在时间")],
            ["projectilesProvided", new this(34, "提供投射物")],
            ["projectilesUsed", new this(34, "使用投射物")],
            ["passiveEffect", new this(35, "被动效果")],
            ["bloodMaterial", new this(36, "血液材料")],
            ["maxHp", new this(37, "生命值")],
            ["immunity", new this(38, "免疫能力")],
            // ( 39, "承伤系数"),
            ["recoilKnockback", new this(40, "后座力")],
            ["draw_common", new this(41, "抽取|普通")],
            ["draw_hit", new this(42, "抽取|碰撞触发")],
            ["draw_timer", new this(43, "抽取|定时触发")],
            ["draw_death", new this(44, "抽取|失效触发")],
            // neverUnlimited: new this(45, "?"),
            ["infinite", new this(46, "无限")],
            ["maxStack", new this(47, "堆叠极限")],
            ["maxInPool", new this(48, "池最大含量")],
            ["airInLungsMax", new this(49, "肺容量")],
            ["patternDegrees", new this(50, "阵型分布")],
            ["trailMaterial", new this(51, "提供轨迹")],
            ["trailMaterialAmount", new this(52, "轨迹浓度")],
            ["material", new this(53, "提供材料")],
            ["materialAmount", new this(54, "材料浓度")],
        ]);

        async getIcon() {
            const canvas = document.createElement("canvas");
            canvas.setAttribute("aria-label", `面板属性图标:${this.name}`);// 无障碍标注
            canvas.title = this.name;
            canvas.width = 7;
            canvas.height = 7;
            canvas.getContext("2d").drawImage(await this.constructor.panelAttrIcons, (this.#iconIndex - 1) * 7, 0, 7, 7, 0, 0, 7, 7);
            return canvas;
        }
    };
};