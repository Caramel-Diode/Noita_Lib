class DamageData {
    /** @type {['projectile', 'melee', 'electricity', 'fire', 'explosion', 'ice', 'slice', 'healing', 'curse', 'drill', 'holy', 'overeating', 'physicsHit', 'poison', 'radioactive']} */
    static types = Object.freeze(Object.keys(new this("")));
    /** @type {"multipliers"|"values"} 数值类型 */ #type;
    //#region 成员...
    /**
     * ![](data:image/webp;base64,UklGRmoAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCAAAAABDzD/ERFCURsp0Eji+C5gfc3hIaL/4fMhRNMOx3HEA1ZQOCAkAAAAMAEAnQEqDgAOAAEAHCWkAANwAP73nf//o3X/+jPf//0bsAAA) [`投射物`](https://noita.wiki.gg/zh/wiki/伤害类型#投射物伤害)
     * @type {Number}
     */
    projectile;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyu7dlwyR/4SsnABcEBHR/2hOW6BZqSbakRZFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`近战`](https://noita.wiki.gg/zh/wiki/伤害类型#近战伤害)
     * @type {Number}
     */
    melee;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERHCTNs2kQKgVMb/KqQCGJCI/gdirWN8PrWOcRwAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`雷电`](https://noita.wiki.gg/zh/wiki/伤害类型#雷电伤害)
     * @type {Number}
     */
    electricity;
    /**
     * ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCTNs2lQJgVMIfVQH0HoaI/ocxImPsvlIAAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`火焰`](https://noita.wiki.gg/zh/wiki/伤害类型#火焰伤害)
     * @type {Number}
     */
    fire;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERGCSAAiqMZ4YLxqjAduRPQ/oqgsh+G+h6EsowgAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`爆炸`](https://noita.wiki.gg/zh/wiki/伤害类型#爆炸伤害)
     * @type {Number}
     */
    explosion;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCUSNJysKXDMH598QgIqL/sdpq3bvH42B58AMAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`冰冻`](https://noita.wiki.gg/zh/wiki/伤害类型#冰冻伤害)
     * @type {Number}
     */
    ice;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCIRtJEMKoHMAmA39an0ZE/+PraxxjJETkedoWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`切割`](https://noita.wiki.gg/zh/wiki/伤害类型#切割伤害)
     * @type {Number}
     */
    slice;
    /**
     * ![](data:image/webp;base64,UklGRloAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSBsAAAABDzD/ERFCQSQb1EMw/du8Bv4yRPQ/aDv8o20AVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`治疗`](https://noita.wiki.gg/zh/wiki/伤害类型#治疗伤害)
     * @type {Number}
     */
    healing;
    /**
     * ![](data:image/webp;base64,UklGRmYAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCcAAAABDzD/ERFCSSRJzgWarJyDFf/0xJyAhS8iov9xfs5mv/kBgM3e2AAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`诅咒` ](https://noita.wiki.gg/zh/wiki/伤害类型#诅咒伤害)
     * @type {Number}
     */
    curse;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCMSNJ0BiMyh7f9tdqjYj+RwilOI7vO04pIQAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`穿凿`](https://noita.wiki.gg/zh/wiki/伤害类型#穿凿伤害)
     * @type {Number}
     */
    drill;
    /**
     * ![](data:image/webp;base64,UklGRlwAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB4AAAABDzD/ERFCIcBE0ADuEQo+gLCCiOh/mNbrjclkTANWUDggGAAAADABAJ0BKg4ADgABABwlpAADcAD+/cCAAA==) [`神圣`](https://noita.wiki.gg/zh/wiki/伤害类型#神圣)
     * @type {Number}
     */
    holy;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCcdo2UCDfgPffMgP0WCOi/yFEKUkyDM/zflsWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`过饱和`](https://noita.wiki.gg/zh/wiki/伤害类型#暴食伤害)
     * @type {Number}
     */
    overeating;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyiT7JUlrfQSsmBPAICKi/7Hy9PgJovQ0OQQBAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`物理`](https://noita.wiki.gg/zh/wiki/伤害类型#物理伤害)
     * @type {Number}
     */
    physicsHit;
    /**
     * ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCVCQb7z0B9G8j0gXwaWSI6H+MLkVtfxQFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`紫毒`](https://noita.wiki.gg/zh/wiki/伤害类型#紫毒伤害)
     * @type {Number}
     */
    poison;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCYAAAABDzD/ERFCQds2TKUCCJUBeOBHaAAGJKL/kSQzMyS5sSFJ5/PzAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`放射/绿毒`](https://noita.wiki.gg/zh/wiki/伤害类型#绿毒伤害)
     * @type {Number}
     */
    radioactive;

    //#endregion

    /**
     * @param {String} exp 伤害数据表达式
     * @param {Number} [defaultValue] 默认值
     * @param {"multipliers"|"values"} [type]
     */
    constructor(exp, defaultValue = 0, type = "values") {
        this.#type = type;
        const P = [],
            M = [],
            L = [],
            F = [],
            E = [],
            I = [],
            S = [],
            H = [],
            C = [],
            D = [],
            V = [],
            Y = [],
            N = [],
            R = [],
            O = [];
        let target = P;
        const targets = { P, M, L, F, E, I, S, H, C, D, V, Y, N, R, O };
        for (let i = 0; i < exp.length; i++) {
            const char = exp[i];
            if ("PMLFEISHCDVYNRO".includes(char)) target = targets[char];
            else target.push(char);
        }
        const toNumber = data => (data.length ? +data.join("") : defaultValue);
        this.projectile = toNumber(P);
        this.melee = toNumber(M);
        this.electricity = toNumber(L);
        this.fire = toNumber(F);
        this.explosion = toNumber(E);
        this.ice = toNumber(I);
        this.slice = toNumber(S);
        this.healing = toNumber(H);
        this.curse = toNumber(C);
        this.drill = toNumber(D);
        this.overeating = toNumber(V);
        this.physicsHit = toNumber(Y);
        this.poison = toNumber(N);
        this.radioactive = toNumber(R);
        this.holy = toNumber(O);
    }

    get #_XML() {
        let tag = "";
        if (this.#type === "multipliers") tag = "damage_multipliers";
        else tag = "damage_by_type";
        const cache = [];
        cache.push(`projectile="`, this.projectile, `" `);
        cache.push(`melee="`, this.melee, `" `);
        cache.push(`electricity="`, this.electricity, `" `);
        cache.push(`fire="`, this.fire, `" `);
        cache.push(`explosion="`, this.explosion, `"`);
        cache.push(`ice="`, this.ice, `" `);
        cache.push(`slice="`, this.slice, `" `);
        cache.push(`healing="`, this.healing, `" `);
        cache.push(`curse="`, this.curse, `" `);
        cache.push(`drill="`, this.drill, `" `);
        cache.push(`overeating="`, this.overeating, `" `);
        cache.push(`physics_hit="`, this.physicsHit, `" `);
        cache.push(`poison="`, this.poison, `" `);
        cache.push(`radioactive="`, this.radioactive, `" `);
        cache.push(`holy="`, this.holy, `" `);
        return `<${tag} ${cache.join("")}><${tag}/>`;
    }

    get #_exp() {
        const cache = [];
        if (this.#type === "multipliers") {
            if (1 !== this.projectile) cache.push("P", this.projectile);
            if (1 !== this.melee) cache.push("M", this.melee);
            if (1 !== this.electricity) cache.push("L", this.electricity);
            if (1 !== this.fire) cache.push("F", this.fire);
            if (1 !== this.explosion) cache.push("E", this.explosion);
            if (1 !== this.ice) cache.push("I", this.ice);
            if (1 !== this.slice) cache.push("S", this.slice);
            if (1 !== this.healing) cache.push("H", this.healing);
            if (1 !== this.curse) cache.push("C", this.curse);
            if (1 !== this.drill) cache.push("D", this.drill);
            if (1 !== this.overeating) cache.push("V", this.overeating);
            if (1 !== this.physicsHit) cache.push("Y", this.physicsHit);
            if (1 !== this.poison) cache.push("N", this.poison);
            if (1 !== this.radioactive) cache.push("R", this.radioactive);
            if (1 !== this.holy) cache.push("O", this.holy);
        } else {
            if (this.projectile) cache.push("P", this.projectile);
            if (this.melee) cache.push("M", this.melee);
            if (this.electricity) cache.push("L", this.electricity);
            if (this.fire) cache.push("F", this.fire);
            if (this.explosion) cache.push("E", this.explosion);
            if (this.ice) cache.push("I", this.ice);
            if (this.slice) cache.push("S", this.slice);
            if (this.healing) cache.push("H", this.healing);
            if (this.curse) cache.push("C", this.curse);
            if (this.drill) cache.push("D", this.drill);
            if (this.overeating) cache.push("V", this.overeating);
            if (this.physicsHit) cache.push("Y", this.physicsHit);
            if (this.poison) cache.push("N", this.poison);
            if (this.radioactive) cache.push("R", this.radioactive);
            if (this.holy) cache.push("O", this.holy);
        }
        return cache.join("");
    }

    /**
     * 转为字符串
     * @param {"XML"|"exp"} [format] 转换格式
     */
    toString(format = "exp") {
        if (format === "exp") return this.#_exp;
        else return this.#_XML;
    }
}
