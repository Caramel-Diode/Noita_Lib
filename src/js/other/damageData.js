class DamageData { // mark : 伤害数据类
    static #reg_letter = /[A-Z]/;
    static #reg_number = /[0-9\.\-]/;
    //#region 成员...
    /**
     * ![](data:image/webp;base64,UklGRmoAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCAAAAABDzD/ERFCURsp0Eji+C5gfc3hIaL/4fMhRNMOx3HEA1ZQOCAkAAAAMAEAnQEqDgAOAAEAHCWkAANwAP73nf//o3X/+jPf//0bsAAA) [`投射物`](https://noita.wiki.gg/zh/wiki/伤害类型#投射物伤害)
     * @type {Number}
     */
    projectile = 0;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyu7dlwyR/4SsnABcEBHR/2hOW6BZqSbakRZFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`近战`](https://noita.wiki.gg/zh/wiki/伤害类型#近战伤害) 
     * @type {Number}
     */
    melee = 0;
    /** 
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERHCTNs2kQKgVMb/KqQCGJCI/gdirWN8PrWOcRwAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`雷电`](https://noita.wiki.gg/zh/wiki/伤害类型#雷电伤害)
     * @type {Number}
     */
    electricity = 0;
    /**
     * ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCTNs2lQJgVMIfVQH0HoaI/ocxImPsvlIAAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`火焰`](https://noita.wiki.gg/zh/wiki/伤害类型#火焰伤害)
     * @type {Number}
     */
    fire = 0;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERGCSAAiqMZ4YLxqjAduRPQ/oqgsh+G+h6EsowgAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`爆炸`](https://noita.wiki.gg/zh/wiki/伤害类型#爆炸伤害)
     * @type {Number}
     */
    explosion = 0;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCUSNJysKXDMH598QgIqL/sdpq3bvH42B58AMAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`冰冻`](https://noita.wiki.gg/zh/wiki/伤害类型#冰冻伤害)
     * @type {Number}
     */
    ice = 0;
    /** 
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCIRtJEMKoHMAmA39an0ZE/+PraxxjJETkedoWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`切割`](https://noita.wiki.gg/zh/wiki/伤害类型#切割伤害)
     * @type {Number}
     */
    slice = 0;
    /**
     * ![](data:image/webp;base64,UklGRloAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSBsAAAABDzD/ERFCQSQb1EMw/du8Bv4yRPQ/aDv8o20AVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`治疗`](https://noita.wiki.gg/zh/wiki/伤害类型#治疗伤害)
     * @type {Number}
     */
    healing = 0;
    /** 
     * ![](data:image/webp;base64,UklGRmYAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCcAAAABDzD/ERFCSSRJzgWarJyDFf/0xJyAhS8iov9xfs5mv/kBgM3e2AAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`诅咒` ](https://noita.wiki.gg/zh/wiki/伤害类型#诅咒伤害)
     * @type {Number}
     */
    curse = 0;
    /**
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCEAAAABDzD/ERFCMSNJ0BiMyh7f9tdqjYj+RwilOI7vO04pIQAAVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`穿凿`](https://noita.wiki.gg/zh/wiki/伤害类型#穿凿伤害)
     * @type {Number}
     */
    drill = 0;
    /**
     * ![](data:image/webp;base64,UklGRlwAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB4AAAABDzD/ERFCIcBE0ADuEQo+gLCCiOh/mNbrjclkTANWUDggGAAAADABAJ0BKg4ADgABABwlpAADcAD+/cCAAA==) [`神圣`](https://noita.wiki.gg/zh/wiki/伤害类型#神圣)
     * @type {Number}
     */
    holy = 0;
    /** 
     * ![](data:image/webp;base64,UklGRmAAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCIAAAABDzD/ERFCcdo2UCDfgPffMgP0WCOi/yFEKUkyDM/zflsWVlA4IBgAAAAwAQCdASoOAA4AAQAcJaQAA3AA/v3AgAA=) [`过饱和`](https://noita.wiki.gg/zh/wiki/伤害类型#暴食伤害)
     * @type {Number}
     */
    overeating = 0;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCUAAAABDzD/ERFCUSNJyiT7JUlrfQSsmBPAICKi/7Hy9PgJovQ0OQQBAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`物理`](https://noita.wiki.gg/zh/wiki/伤害类型#物理伤害)
     * @type {Number}
     */
    physicsHit = 0;
    /**
     * ![](data:image/webp;base64,UklGRl4AAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSB8AAAABDzD/ERHCVCQb7z0B9G8j0gXwaWSI6H+MLkVtfxQFAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`紫毒`](https://noita.wiki.gg/zh/wiki/伤害类型#紫毒伤害)
     * @type {Number}
     */
    poison = 0;
    /**
     * ![](data:image/webp;base64,UklGRmQAAABXRUJQVlA4WAoAAAAQAAAADQAADQAAQUxQSCYAAAABDzD/ERFCQds2TKUCCJUBeOBHaAAGJKL/kSQzMyS5sSFJ5/PzAFZQOCAYAAAAMAEAnQEqDgAOAAEAHCWkAANwAP79wIAA) [`放射/绿毒`](https://noita.wiki.gg/zh/wiki/伤害类型#绿毒伤害)
     * @type {Number}
     */
    radioactive = 0;

    //#endregion

    constructor(str) {
        let dataChars = [];
        const
            P = [],
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
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            switch (char) {
                case "P": target = P; break;
                case "M": target = M; break;
                case "L": target = L; break;
                case "F": target = F; break;
                case "E": target = E; break;
                case "I": target = I; break;
                case "S": target = S; break;
                case "H": target = H; break;
                case "C": target = C; break;
                case "D": target = D; break;
                case "V": target = O; break;
                case "Y": target = Y; break;
                case "N": target = N; break;
                case "R": target = R; break;
                case "O": target = O; break;
                default: target.push(char);
            }
        }
        if (P.length > 0) this.projectile = Number(P.join(""));
        if (M.length > 0) this.melee = Number(M.join(""));
        if (L.length > 0) this.electricity = Number(L.join(""));
        if (F.length > 0) this.fire = Number(F.join(""));
        if (E.length > 0) this.explosion = Number(E.join(""));
        if (I.length > 0) this.ice = Number(I.join(""));
        if (S.length > 0) this.slice = Number(S.join(""));
        if (H.length > 0) this.healing = Number(H.join(""));
        if (C.length > 0) this.curse = Number(C.join(""));
        if (D.length > 0) this.drill = Number(D.join(""));
        if (V.length > 0) this.overeating = Number(O.join(""));
        if (Y.length > 0) this.physicsHit = Number(Y.join(""));
        if (N.length > 0) this.poison = Number(N.join(""));
        if (R.length > 0) this.radioactive = Number(R.join(""));
        if (O.length > 0) this.holy = Number(O.join(""));
    }
}