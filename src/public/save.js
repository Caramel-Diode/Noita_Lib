const save = {
    data: {
        /** 真理魔球 */
        orb: {
            /* 主世界 */
            M0/* 岩浆之海/☆火花弹:0 */: false,
            M1/* 地震:1 */: false,
            M2/* 召唤触手:2 */: false,
            M3/* 核弹:3 */: false,
            M4/* 死灵术:4 */: false,
            M5/* 神圣炸弹:5 */: false,
            M6/* 螺旋魔弹:6 */: false,
            M7/* 雷云:7 */: false,
            M8/* 烟花:8 */: false,
            M9/* 爆炸鹿:9 */: false,
            M10/* 水泥:10 */: false,
            M11/* ☆大宝箱:11 */: false,
            M13/* ★毁灭:13 */: false,
            /* 左平行世界 */
            L0/* 128 */: false,
            L1/* 129 */: false,
            L2/* 130 */: false,
            L3/* 131 */: false,
            L4/* 132 */: false,
            L5/* 133 */: false,
            L6/* 134 */: false,
            L7/* 135 */: false,
            L8/* 136 */: false,
            L9/* 137 */: false,
            L10/* 138 */: false,
            L11/* 139 */: false,
            L13/* 141 */: false,
            /* 右平行世界 */
            R0/* 256 */: false,
            R1/* 257 */: false,
            R2/* 258 */: false,
            R3/* 259 */: false,
            R4/* 260 */: false,
            R5/* 261 */: false,
            R6/* 262 */: false,
            R7/* 263 */: false,
            R8/* 264 */: false,
            R9/* 265 */: false,
            R10/* 266 */: false,
            R11/* 267 */: false,
            R13/* 269 */: false,
        }
    },
    async load() {
        if (showDirectoryPicker) {
            /** @type {FileSystemDirectoryHandle} */
            const fsdh = await showDirectoryPicker();
            const fsdh_save00 = await fsdh.getDirectoryHandle("save00");
            /** @type {Generator} */
            const i_fsdh_save00 = fsdh_save00.values();
            for (let e = await i_fsdh_save00.next(); !e.done; e = await await i_fsdh_save00.next()) {
                /** @type {FileSystemDirectoryHandle|FileSystemFileHandle} */
                const value = e.value;
                switch (value.name) {
                    case "persistent":/* 记录 */ {
                        console.log(value);
                        /** @type {Generator} */
                        const i_fsdh_persistent = value.values();
                        for (let e_ = await i_fsdh_persistent.next(); !e_.done; e_ = await i_fsdh_persistent.next()) {
                            const value_ = e_.value;
                            switch (value_.name) {
                                case "bones"/* 古迷图斯法杖 */: {
                                    break;
                                }
                                case "bones_new"/* 古迷图斯法杖 */: {
                                    break;
                                }
                                case "flags":/* 法术图鉴 天赋图鉴 魔球解锁进度 地图秘密 */{
                                    break;
                                }
                                case "orbs_new"/* 魔球 */: {
                                    /** @type {Generator} */
                                    const i_fsdh_orbs_new = value_.values();
                                    const orb = this.data.orb;
                                    for (let e__ = await i_fsdh_orbs_new.next(); !e__.done; e__ = await i_fsdh_orbs_new.next()) {
                                        const value__ = e__.value;
                                        switch (value__.name) {
                                            case "0": orb.M0 = true; break;
                                            case "1": orb.M1 = true; break;
                                            case "2": orb.M2 = true; break;
                                            case "3": orb.M3 = true; break;
                                            case "4": orb.M4 = true; break;
                                            case "5": orb.M5 = true; break;
                                            case "6": orb.M6 = true; break;
                                            case "7": orb.M7 = true; break;
                                            case "8": orb.M8 = true; break;
                                            case "9": orb.M9 = true; break;
                                            case "10": orb.M10 = true; break;
                                            case "11": orb.M11 = true; break;
                                            case "13": orb.M13 = true; break;
                                            case "128": orb.L0 = true; break;
                                            case "129": orb.L1 = true; break;
                                            case "130": orb.L2 = true; break;
                                            case "131": orb.L3 = true; break;
                                            case "132": orb.L4 = true; break;
                                            case "133": orb.L5 = true; break;
                                            case "134": orb.L6 = true; break;
                                            case "135": orb.L7 = true; break;
                                            case "136": orb.L8 = true; break;
                                            case "137": orb.L9 = true; break;
                                            case "138": orb.L10 = true; break;
                                            case "139": orb.L11 = true; break;
                                            case "141": orb.L13 = true; break;
                                            case "256": orb.R0 = true; break;
                                            case "257": orb.R1 = true; break;
                                            case "258": orb.R2 = true; break;
                                            case "259": orb.R3 = true; break;
                                            case "260": orb.R4 = true; break;
                                            case "261": orb.R5 = true; break;
                                            case "262": orb.R6 = true; break;
                                            case "263": orb.R7 = true; break;
                                            case "264": orb.R8 = true; break;
                                            case "265": orb.R9 = true; break;
                                            case "266": orb.R10 = true; break;
                                            case "267": orb.R11 = true; break;
                                            case "269": orb.R13 = true; break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    case "stats"/* 怪物数据统计 */: {
                        break;
                    }
                    case "world"/* 地图数据 */: {
                        break;
                    }
                    case "magic_numbers.salakieli": {
                        break;
                    }
                    case "mod_config.xml": {
                        break;
                    }
                    case "mod_settings.bin": {
                        break;
                    }
                    case "player.xml"/* 玩家实体数据 */: {
                        break;
                    }
                    case "session_numbers.salakieli": {
                        break;
                    }
                    case "world_state.xml"/* 世界数据 */: {
                        break;
                    }
                }
            }
        } else {
            console.warn("浏览器暂不支持此API");
        }
    }
};