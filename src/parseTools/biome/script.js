document.body;
/**
 * 解析图像为 `{点 => 颜色}` 的映射表
 * @param {string|HTMLCanvasElement} urlOrCanvas
 * @param {{top:number,left:number,bottom:number,right:number}?} padding
 */
const parseImage = async (urlOrCanvas, padding = { top: 0, left: 0, bottom: 0, right: 0 }) => {
    padding.top ??= 0;
    padding.left ??= 0;
    padding.bottom ??= 0;
    padding.right ??= 0;
    /** @type {HTMLImageElement} */
    let img;
    if (typeof urlOrCanvas === "string") {
        img = await PNG.removeGAMA(urlOrCanvas);
        // img = h.img({ src: urlOrCanvas });
        // await img.decode();
    } else img = urlOrCanvas;
    const { width, height } = img;
    const canvas = new OffscreenCanvas(width - padding.left - padding.right, height - padding.top - padding.bottom);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, padding.left, padding.top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    /** @type {Map<DOMPoint,`#${string}`>} */
    const result = new Map();
    let x = 0,
        y = 0;
    for (let i = 0; i < data.length; ) {
        const r = data[i++].toString(16).padStart(2, 0);
        const g = data[i++].toString(16).padStart(2, 0);
        const b = data[i++].toString(16).padStart(2, 0);
        const a = data[i++].toString(16).padStart(2, 0);
        if (a !== "ff") console.warn("alpha!");
        result.set(new DOMPoint(x, y), `#${r}${g}${b}`);
        x++;
        if (x === canvas.width) {
            x = 0;
            y++;
        }
    }
    return Object.assign(result, { canvas: canvas });
};

/** 切割瓷砖 */
const splitWangTiles = (() => {
    /**
     * @param {string} url
     */
    const trimWangTiles = async url => {
        const colors = await parseImage(url);
        /** @type {Array<Array<DOMPoint>>} */
        const rows = [];
        /** @type {Array<Array<DOMPoint>>} */
        const cols = [];
        for (const [point] of colors) {
            rows[point.x] ??= [];
            rows[point.x][point.y] = point;
            cols[point.y] ??= [];
            cols[point.y][point.x] = point;
        }
        // 行检测
        {
            const length = rows.length;
            for (let i = 0; i < length; i++) {
                const row = rows.at(i);
                let isBlank = true;
                for (const point of row) {
                    if (colors.get(point) === "#ffffff") continue;
                    isBlank = false;
                    break;
                }
                if (isBlank) row.length = 0;
            }
            for (let i = 0; i < length; i++) {
                const row = rows.at(-i);
                let isBlank = true;
                for (const point of row) {
                    if (colors.get(point) === "#ffffff") continue;
                    isBlank = false;
                    break;
                }
                if (isBlank) row.length = 0;
            }
        }
        // 列检测
        {
            const length = cols.length;
            for (let i = 0; i < length; i++) {
                const col = cols.at(i);
                let isBlank = true;
                for (const point of col) {
                    if (colors.get(point) === "#ffffff") continue;
                    isBlank = false;
                    break;
                }
                if (isBlank) col.length = 0;
            }
            for (let i = 0; i < length; i++) {
                const col = cols.at(-i);
                let isBlank = true;
                for (const point of col) {
                    if (colors.get(point) === "#ffffff") continue;
                    isBlank = false;
                    break;
                }
                if (isBlank) col.length = 0;
            }
        }

        /**
         * 有效像素点
         * @type {Set<DOMPoint>}
         */
        const points = new Set([...rows.flat(), ...cols.flat()]);

        let width = 1;
        let height = 1;
        for (const { x, y } of points) {
            if (x > width) width = x;
            if (y > height) height = y;
        }
        width++;
        height++;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        for (const point of points) {
            const color = colors.get(point);
            ctx.fillStyle = color;
            ctx.fillRect(point.x, point.y, 1, 1);
        }
        return canvas;
    };
    /**
     * @param {string} url
     */
    const splitWangTilesCommon = async url => {
        const colors = await parseImage(url);
        /** @type {Array<number>} */
        const blankRows = [];
        /** @type {Array<number>} */
        const blankCols = [];
        {
            /** @type {Array<Array<DOMPoint>>} */
            const rows = [];
            /** @type {Array<Array<DOMPoint>>} */
            const cols = [];
            for (const [point] of colors) {
                rows[point.y] ??= [];
                rows[point.y][point.x] = point;
                cols[point.x] ??= [];
                cols[point.x][point.y] = point;
            }

            for (const row of rows) {
                let isBlankRow = true;
                for (const point of row) {
                    if (colors.get(point) === "#ffffff") continue;
                    isBlankRow = false;
                    break;
                }
                if (isBlankRow) blankRows.push(rows.indexOf(row));
            }
            for (const col of cols) {
                let isBlankCol = true;
                for (const point of col) {
                    if (colors.get(point) === "#ffffff") continue;
                    isBlankCol = false;
                    break;
                }
                if (isBlankCol) blankCols.push(cols.indexOf(col));
            }
        }
        // split
        {
            /** @type {Array<DOMRect>} */
            const rects = [];
            blankRows.push(colors.canvas.height);
            blankCols.push(colors.canvas.width);
            let startY = 0;
            for (const y of blankRows) {
                const height = y - startY;
                if (!height) {
                    if (startY) break;
                    else continue;
                }
                let startX = 0;
                for (const x of blankCols) {
                    const width = x - startX;
                    if (!width) break;
                    rects.push(new DOMRect(startX, startY, width, height));
                    startX = x + 1;
                }
                startY = y + 1;
            }
            /** @type {Array<HTMLCanvasElement>} */
            const result = [];
            for (const { x, y, width, height } of rects) {
                const canvas = h.canvas({ width: width - 2, height: height - 2 });
                const ctx = canvas.getContext("2d");
                ctx.drawImage(colors.canvas, x + 1, y + 1, width - 2, height - 2, 0, 0, width - 2, height - 2);
                result.push(canvas);
            }
            return result;
        }
    };

    return async url => {
        const colors = await parseImage(url, { top: 2, right: 1, bottom: 1 });
        /** @type {Array<Array<DOMPoint>>} */
        const rows = [];
        for (const [point] of colors) {
            rows[point.y] ??= [];
            rows[point.y][point.x] = point;
        }
        /** @type {Array<number>} */
        const blankRows = [];
        for (const row of rows) {
            let isBlankRow = true;
            for (const point of row) {
                if (colors.get(point) === "#ffffff") continue;
                isBlankRow = false;
                break;
            }
            if (isBlankRow) blankRows.push(rows.indexOf(row));
        }
        let splity1, splity2;

        for (let i = 0; i < blankRows.length - 2; i++) {
            const r1 = blankRows[i];
            const r2 = blankRows[i + 1];
            const r3 = blankRows[i + 2];
            // 连续三行空白判断
            if (r1 + 1 === r2 && r2 + 1 === r3) {
                splity1 = r1;
                splity2 = r3;
            }
        }
        const result = {
            /** @type {Array<HTMLCanvasElement>} */
            horizontal: null,
            /** @type {Array<HTMLCanvasElement>} */
            vertical: null,
            /** @type {Array<HTMLCanvasElement>} */
            single: null
        };
        if (splity1 === void 0 || splity2 === void 0) {
            // throw new Error("图像无法分割:" + url);
            // 这代表不是瓷砖拼图
            result.single = await splitWangTilesCommon(url);
            return result;
        }
        // 横向瓷砖
        {
            const { width, height } = colors.canvas;
            const canvas = new OffscreenCanvas(width, splity1);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(colors.canvas, 0, 0, width, splity1, 0, 0, width, splity1);
            const newURL = URL.createObjectURL(await canvas.convertToBlob());
            result.horizontal = await splitWangTilesCommon(newURL);
        }
        // 纵向瓷砖
        {
            const { width, height } = colors.canvas;
            const canvas = new OffscreenCanvas(width, height - splity2 - 1);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(colors.canvas, 0, splity2 + 1, width, canvas.height, 0, 0, width, canvas.height);
            const newURL = URL.createObjectURL(await canvas.convertToBlob());
            result.vertical = await splitWangTilesCommon(newURL);
        }
        return result;
    };
})();

const getMaterials = (() => {
    const dataMap = {
        "#000042": "air",
        "#ff6060": "fire",
        "#ff6061": "fire_blue",
        "#ff6024": "spark",
        "#96ff46": "spark_green",
        "#96ff47": "spark_green_bright",
        "#82dcff": "spark_blue",
        "#205bfe": "spark_blue_dark",
        "#ff2813": "spark_red",
        "#ff2814": "spark_red_bright",
        "#fefeff": "spark_white",
        "#fefefd": "spark_white_bright",
        "#fff028": "spark_yellow",
        "#b43c1f": "spark_purple",
        "#b4323f": "spark_purple_bright",
        "#fff029": "spark_player",
        "#a41c1f": "spark_teal",
        "#27b4f6": "spark_electric",
        "#ce0f0f": "flame",
        "#524f2d": "sand_static",
        "#524f00": "sand_static_rainforest",
        "#261f26": "sand_static_rainforest_dark",
        "#523f03": "bone_static",
        "#ee8f49": "rust_static",
        "#ef8f49": "sand_static_bright",
        "#9a5149": "meat_static",
        "#ff8f47": "sand_static_red",
        "#a83e29": "nest_static",
        "#435495": "bluefungi_static",
        "#353923": "rock_static",
        "#0a3344": "rock_static_intro",
        "#0abba4": "rock_static_trip_secret",
        "#0baab4": "rock_static_trip_secret2",
        "#3f4d3e": "rock_static_cursed",
        "#272224": "rock_static_purple",
        "#2f554d": "water_static",
        "#8bff80": "endslime_static",
        "#e8bd5c": "slime_static",
        "#e8bdcb": "spore_pod_stalk",
        "#003344": "rock_hard",
        "#00a244": "rock_static_fungal",
        "#005345": "wood_tree",
        "#003345": "rock_static_noedge",
        "#104344": "rock_hard_border",
        "#ab3347": "rock_magic_gate",
        "#abb346": "rock_magic_bottom",
        "#afb146": "rock_eroding",
        "#003349": "rock_vault",
        "#124444": "coal_static",
        "#1244a4": "rock_static_grey",
        "#00f344": "rock_static_radioactive",
        "#659244": "rock_static_cursed_green",
        "#00fa44": "rock_static_poison",
        "#00a344": "skullrock",
        "#103344": "rock_static_wet",
        "#5f2621": "lavarock_static",
        "#d7d684": "static_magic_material",
        "#1d1010": "meteorite_static",
        "#6f5439": "templerock_static",
        "#786c42": "templebrick_static",
        "#9e8438": "templebrick_static_broken",
        "#af9f6a": "templebrick_static_soft",
        "#786c44": "templebrick_noedge_static",
        "#6a54a9": "templerock_soft",
        "#646c58": "templebrick_thick_static",
        "#606c5a": "templebrick_thick_static_noedge",
        "#947059": "templeslab_static",
        "#846049": "templeslab_crumbling_static",
        "#5b5047": "templebrickdark_static",
        "#4c4356": "wizardstone",
        "#b07e13": "templebrick_golden_static",
        "#5e9ab5": "templebrick_diamond_static",
        "#78cace": "templebrick_static_ruined",
        "#aaf06e": "glowstone",
        "#ffc931": "glowstone_altar",
        "#ffc932": "glowstone_altar_hdr",
        "#a3f06e": "glowstone_potion",
        "#78ac42": "templebrick_red",
        "#786c45": "templebrick_moss_static",
        "#026c05": "the_end",
        "#404041": "steel_static",
        "#787a55": "steelmoss_static",
        "#904f3a": "steel_rusted_no_holes",
        "#9b4a3f": "steel_grey_static",
        "#787b34": "steelfrost_static",
        "#787a85": "steelmoss_slanted",
        "#646455": "steelsmoke_static",
        "#64c455": "steelpipe_static",
        "#404a41": "steel_static_strong",
        "#404f50": "steel_static_unmeltable",
        "#145014": "rock_static_glow",
        "#ebebec": "snow_static",
        "#cff7c8": "ice_static",
        "#0a3355": "rock_static_intro_breakable",
        "#cb7070": "ice_blood_static",
        "#cba270": "ice_slime_static",
        "#cfffc8": "ice_acid_static",
        "#afffc8": "ice_cold_static",
        "#bfffc8": "ice_radioactive_static",
        "#ba2de0": "ice_poison_static",
        "#cf1fc8": "ice_meteor_static",
        "#cff7c5": "tubematerial",
        "#a16065": "glass_static",
        "#1a43f4": "waterrock",
        "#aedde3": "ice_glass",
        "#413f42": "tube_physics",
        "#41ff42": "ice_acid_glass",
        "#a1ff42": "ice_cold_glass",
        "#b1ff42": "ice_radioactive_glass",
        "#bc3ae0": "ice_poison_glass",
        "#bc40e2": "ice_blood_glass",
        "#bc10e2": "ice_slime_glass",
        "#aedde5": "ice_glass_b2",
        "#aeddd3": "glass_brittle",
        "#dbdbdc": "snowrock_static",
        "#767677": "concrete_static",
        "#413f24": "wood_static",
        "#f3cd67": "cheese_static",
        "#413f41": "wood_static_wet",
        "#412d41": "root_growth",
        "#413f43": "wood_burns_forever",
        "#41af41": "creepy_liquid_emitter",
        "#4aaf41": "gold_static",
        "#4aaf45": "gold_static_radioactive",
        "#4acf41": "gold_static_dark",
        "#413f3a": "wood_static_vertical",
        "#414f41": "wood_static_gas",
        "#7d0067": "corruption_static",
        "#848485": "smoke",
        "#afafbf": "cloud",
        "#afafe5": "cloud_lighter",
        "#c1e5ff": "smoke_magic",
        "#848486": "smoke_explosion",
        "#c5c5ff": "steam",
        "#c6c5ff": "steam_trailer",
        "#4eb815": "acid_gas",
        "#4eb817": "acid_gas_static",
        "#848487": "smoke_static",
        "#b42cff": "poison_gas",
        "#ea1caf": "fungal_gas",
        "#724f43": "poo_gas",
        "#5c98cd": "blood_cold_vapour",
        "#6e8c3b": "sand_herb_vapour",
        "#43b815": "radioactive_gas",
        "#43b818": "radioactive_gas_static",
        "#a1f18c": "magic_gas_hp_regeneration",
        "#dfdc08": "magic_gas_midas",
        "#c6cf24": "magic_gas_worm_blood",
        "#f2e604": "rainbow_gas",
        "#f17beb": "magic_gas_polymorph",
        "#26c523": "magic_gas_weakness",
        "#7fceed": "magic_gas_teleport",
        "#3bbb36": "magic_gas_fungus",
        "#2f554c": "water",
        "#2f354c": "water_fading",
        "#2f754c": "water_salt",
        "#a2332a": "void_liquid",
        "#a2332b": "mimic_liquid",
        "#b2332b": "just_death",
        "#2f554f": "water_temp",
        "#2f557f": "water_ice",
        "#2f552c": "water_swamp",
        "#3b3b3c": "oil",
        "#3b3b3d": "liquid_fire",
        "#3b3b4d": "liquid_fire_weak",
        "#d0ffe8": "alcohol",
        "#d0ffe6": "beer",
        "#d0ffe5": "milk",
        "#d0ffe4": "molut",
        "#d0ffe9": "sima",
        "#d0ffe7": "juhannussima",
        "#01fd13": "alcohol_gas",
        "#243cff": "midas_precursor",
        "#efa101": "midas",
        "#fffea2": "magic_liquid",
        "#ff0204": "material_confusion",
        "#563e66": "material_darkness",
        "#695642": "pus",
        "#ffa2cd": "material_rainbow",
        "#26c528": "magic_liquid_weakness",
        "#c1dba4": "magic_liquid_movement_faster",
        "#f6ffdc": "magic_liquid_faster_levitation",
        "#c7f865": "magic_liquid_faster_levitation_and_movement",
        "#687478": "magic_liquid_worm_attractor",
        "#df9828": "magic_liquid_protection_all",
        "#0bffe5": "magic_liquid_mana_regeneration",
        "#00bee4": "magic_liquid_unstable_teleportation",
        "#7fceea": "magic_liquid_teleportation",
        "#a1f18b": "magic_liquid_hp_regeneration",
        "#a1f18c": "magic_liquid_hp_regeneration_unstable",
        "#f18beb": "magic_liquid_polymorph",
        "#91448d": "magic_liquid_random_polymorph",
        "#a3569f": "magic_liquid_unstable_polymorph",
        "#f86868": "magic_liquid_berserk",
        "#c23055": "magic_liquid_charm",
        "#306cc0": "magic_liquid_invisibility",
        "#01ff34": "cloud_radioactive",
        "#01fd34": "cloud_blood",
        "#01fc34": "cloud_slime",
        "#2f2f0a": "swamp",
        "#363e21": "mud",
        "#830000": "blood",
        "#830002": "blood_fading",
        "#f13c23": "blood_fading_slow",
        "#830001": "blood_fungi",
        "#c8bc00": "blood_worm",
        "#d7cfae": "porridge",
        "#830023": "blood_cold",
        "#00ff33": "radioactive_liquid",
        "#b43cff": "poison",
        "#369244": "cursed_liquid",
        "#b4ff10": "radioactive_liquid_yellow",
        "#00ff34": "radioactive_liquid_fading",
        "#34bfff": "plasma_fading",
        "#36cdff": "plasma_fading_bright",
        "#78f050": "plasma_fading_green",
        "#ff50f0": "plasma_fading_pink",
        "#ebcd04": "gold_molten",
        "#404042": "steel_static_molten",
        "#404043": "steelmoss_slanted_molten",
        "#404044": "steelmoss_static_molten",
        "#404045": "steelsmoke_static_molten",
        "#4b4045": "metal_sand_molten",
        "#404046": "metal_molten",
        "#404047": "metal_rust_molten",
        "#404048": "metal_nohit_molten",
        "#404049": "aluminium_molten",
        "#404050": "aluminium_robot_molten",
        "#404051": "metal_prop_molten",
        "#404052": "steel_rust_molten",
        "#404053": "aluminium_oxide_molten",
        "#eaacab": "wax_molten",
        "#4e5263": "silver_molten",
        "#4e5264": "copper_molten",
        "#4e5285": "brass_molten",
        "#4e5266": "glass_molten",
        "#4e5237": "glass_broken_molten",
        "#ebcd08": "steel_molten",
        "#381774": "creepy_liquid",
        "#808081": "cement",
        "#808082": "concrete_sand",
        "#ebcd00": "sand",
        "#008240": "sand_blue",
        "#009242": "sand_surface",
        "#0a8240": "lavasand",
        "#433454": "sand_petrify",
        "#e6e6ff": "bone",
        "#36311e": "soil",
        "#008040": "soil_lush",
        "#40323d": "soil_lush_dark",
        "#708040": "soil_dead",
        "#af8040": "soil_dark",
        "#90fe40": "sandstone",
        "#90fe4a": "sandstone_surface",
        "#36312e": "fungisoil",
        "#e8bd5a": "honey",
        "#f6fce3": "glue",
        "#e8bd5a": "slime",
        "#b5ceff": "slush",
        "#80ff80": "slime_green",
        "#9cb32b": "slime_yellow",
        "#80ff82": "pea_soup",
        "#e8bd5b": "vomit",
        "#8aff80": "endslime",
        "#8cff80": "endslime_blood",
        "#36311f": "explosion_dirt",
        "#526f40": "vine",
        "#2a724a": "root",
        "#f4f4f3": "snow",
        "#eeeeed": "snow_sticky",
        "#ebcdd0": "rotten_meat",
        "#ed4c4c": "meat_slime_sand",
        "#ed4d4c": "meat_slime_green",
        "#feaf2c": "meat_slime_orange",
        "#00ff53": "rotten_meat_radioactive",
        "#ebcda1": "meat_worm",
        "#e3c3a2": "meat_helpless",
        "#e2c2a4": "meat_trippy",
        "#e2c2a5": "meat_frog",
        "#e3c1a1": "meat_cursed",
        "#e3c1a4": "meat_cursed_dry",
        "#e2cbb0": "meat_slime_cursed",
        "#bbc1a1": "meat_teleport",
        "#bbf111": "meat_fast",
        "#b3a181": "meat_polymorph",
        "#b4a282": "meat_polymorph_protection",
        "#b3a070": "meat_confusion",
        "#cfcff0": "ice",
        "#8300a0": "sand_herb",
        "#eaaaab": "wax",
        "#ebcd01": "gold",
        "#fbf451": "gold_radioactive",
        "#4e5262": "silver",
        "#ebf4a1": "steel_sand",
        "#e4f4b0": "metal_sand",
        "#4e5265": "copper",
        "#4e5267": "brass",
        "#82dbe2": "diamond",
        "#505052": "coal",
        "#141415": "sulphur",
        "#e1e1e2": "salt",
        "#410f24": "sodium",
        "#b6d5d8": "purifying_powder",
        "#a10f24": "burning_powder",
        "#411f24": "sodium_unstable",
        "#232324": "gunpowder",
        "#f7bb43": "gunpowder_explosive",
        "#f7bf43": "gunpowder_tnt",
        "#232373": "gunpowder_unstable",
        "#230f73": "gunpowder_unstable_big",
        "#200073": "monster_powder_test",
        "#be4dff": "rat_powder",
        "#becafe": "fungus_powder",
        "#cacafe": "fungus_powder_bad",
        "#acacfe": "shock_powder",
        "#f7f3ee": "orb_powder",
        "#80c850": "gunpowder_unstable_boss_limbs",
        "#900000": "plastic_red",
        "#707271": "plastic_grey",
        "#9000ab": "plastic_red_molten",
        "#707273": "plastic_grey_molten",
        "#ff00ab": "plastic_molten",
        "#bb00ab": "plastic_prop_molten",
        "#3abb30": "grass",
        "#3abb40": "grass_holy",
        "#3abb41": "grass_darker",
        "#3abb31": "grass_ice",
        "#3abb35": "grass_dry",
        "#3abb32": "fungi",
        "#45ff45": "fungi_green",
        "#bec639": "fungi_yellow",
        "#7f506d": "grass_dark",
        "#46ff65": "fungi_creeping",
        "#461ff5": "fungi_creeping_secret",
        "#3abb33": "spore",
        "#45aa45": "peat",
        "#45f145": "moss_rust",
        "#33b828": "moss",
        "#33b838": "plant_material",
        "#aa2818": "plant_material_red",
        "#33b839": "plant_material_dark",
        "#33b848": "ceiling_plant_material",
        "#b89f6c": "mushroom_seed",
        "#bc9b58": "plant_seed",
        "#b89f7c": "mushroom",
        "#d9d9cd": "mushroom_giant_red",
        "#d9d9cc": "mushroom_giant_blue",
        "#d9d9cb": "glowshroom",
        "#4d5d44": "bush_seed",
        "#00ff12": "acid",
        "#ff6000": "lava",
        "#613e03": "wood_player",
        "#613e02": "wood_player_b2",
        "#a13f02": "wood_player_b2_vertical",
        "#613e00": "wood",
        "#eaaaac": "wax_b2",
        "#eaaaad": "fuse",
        "#ea151e": "fuse_bright",
        "#eaaaae": "fuse_tnt",
        "#eaabae": "fuse_holy",
        "#644620": "templebrick_box2d",
        "#a44620": "wood_trailer",
        "#644600": "wood_wall",
        "#64f640": "cactus",
        "#64e64a": "grass_loose",
        "#64ab40": "fungus_loose",
        "#64ab2c": "fungus_loose_green",
        "#64ab41": "fungus_loose_trippy",
        "#966400": "wood_prop",
        "#966401": "wood_prop_noplayerhit",
        "#937f52": "cloth_box2d",
        "#966410": "wood_prop_durable",
        "#3b8d4b": "nest_box2d",
        "#3b3e3b": "nest_firebug_box2d",
        "#3f8d4b": "cocoon_box2d",
        "#613e01": "wood_loose",
        "#937d58": "rock_loose",
        "#3b93ba": "ice_ceiling",
        "#b80900": "brick",
        "#b80901": "concrete_collapsed",
        "#ab5e4f": "tnt",
        "#c1ffee": "tnt_static",
        "#c0ffe1": "trailer_text",
        "#1d1012": "meteorite",
        "#c9c169": "sulphur_box2d",
        "#1d1013": "meteorite_test",
        "#a86c42": "meteorite_crackable",
        "#4e5244": "meteorite_green",
        "#3b5d4b": "steel",
        "#73727e": "steel_rust",
        "#73a27e": "metal_rust_rust",
        "#73a27f": "metal_rust_barrel_rust",
        "#3b5d3b": "plastic",
        "#3b6d4b": "plastic_prop",
        "#3b5d3c": "aluminium",
        "#3c2d3c": "aluminium_robot",
        "#968800": "metal_prop",
        "#9a8f00": "metal_prop_low_restitution",
        "#9677a0": "metal_prop_loose",
        "#3d2d3c": "metal",
        "#3df03c": "metal_hard",
        "#2d2dac": "rock_box2d",
        "#2ffda4": "templebrick_box2d_edgetiles",
        "#2d6dbc": "rock_box2d_hard",
        "#a38431": "poop_box2d_hard",
        "#2d2dbc": "rock_box2d_nohit",
        "#2d2dbd": "rock_box2d_nohit_heavy",
        "#2d4dbc": "rock_box2d_nohit_hard",
        "#2d2dff": "rock_static_box2d",
        "#2e2dff": "rock_box2d",
        "#fe2dac": "item_box2d",
        "#fe2dab": "item_box2d_glass",
        "#fe11a1": "item_box2d_meat",
        "#fd2dac": "gem_box2d",
        "#fd2dab": "potion_glass_box2d",
        "#fd4dab": "glass_box2d",
        "#ff9919": "gem_box2d_yellow_sun",
        "#fd2d7d": "gem_box2d_red_float",
        "#af9019": "gem_box2d_yellow_sun_gravity",
        "#1e4866": "gem_box2d_darksun",
        "#fd2dad": "gem_box2d_pink",
        "#fd2d9d": "gem_box2d_red",
        "#14ffd7": "gem_box2d_turquoise",
        "#52dd60": "gem_box2d_opal",
        "#ebeaef": "gem_box2d_white",
        "#fd2dae": "gem_box2d_green",
        "#f98227": "gem_box2d_orange",
        "#f98228": "gold_box2d",
        "#f92828": "bloodgold_box2d",
        "#ad2dac": "metal_nohit",
        "#ad2dad": "metal_chain_nohit",
        "#ad2dae": "metal_wire_nohit",
        "#4d2d3c": "metal_rust",
        "#4d2d3d": "metal_rust_barrel",
        "#1c2d2c": "bone_box2d",
        "#3b5d2e": "crystal",
        "#3b5d43": "magic_crystal",
        "#b2d740": "magic_crystal_green",
        "#fefae4": "gold_b2",
        "#a53d77": "crystal_purple",
        "#a5ad11": "crystal_solid",
        "#3b5d2f": "crystal_magic",
        "#3b5d4d": "aluminium_oxide",
        "#f2ddb2": "meat",
        "#a50e77": "meat_fruit",
        "#ff531b": "meat_pumpkin",
        "#5b5246": "meat_warm",
        "#5c5246": "meat_hot",
        "#5d5246": "meat_done",
        "#5e5246": "meat_burned",
        "#f2ddb3": "meat_slime",
        "#ffee00": "urine",
        "#36315f": "poo",
        "#232612": "mammi",
        "#dee1fe": "physics_throw_material_part2",
        "#fffffe": "rocket_particles",
        "#dee1aa": "ice_melting_perf_killer",
        "#dee1ec": "ice_b2",
        "#dee1fa": "glass_liquidcave",
        "#aeddee": "glass",
        "#aeddef": "glass_broken",
        "#aedde6": "neon_tube_purple",
        "#aedde7": "neon_tube_cyan",
        "#aedde8": "neon_tube_blood_red",
        "#ff7674": "blood_thick",
        "#b80902": "snow_b2",
        "#c1dba5": "fungal_shift_particle_fx"
    };
    /** @param {HTMLCanvasElement} canvas */
    return async canvas => {
        const colors = await parseImage(canvas);
        /** @type {Set<string>} */
        const result = new Set();
        for (const [point, color] of colors) {
            if (dataMap[color]) result.add(dataMap[color]);
        }
        console.log(result);

        return result;
    };
})();

const biomeMap = h.div({ id: "biome-map" });

const biomeDoc = await parseXMLFromUrl("/data/biome/_biomes_all.xml");
const biomeXmlObject = biomeDoc.xmlObject;
const biomesToLoad = biomeXmlObject.BiomesToLoad[0];
const biomeMapImage = h.img({ src: "/" + biomesToLoad("attr").biome_image_map });
{
    const { promise, resolve } = Promise.withResolvers();
    biomeMapImage.addEventListener("load", resolve);
    await promise;
    biomeMap.style.height = 24 * biomeMapImage.height + "px";
    biomeMap.style.width = 24 * biomeMapImage.width + "px";
    biomeMap.style.setProperty("--rows", biomeMapImage.height);
    biomeMap.style.setProperty("--cols", biomeMapImage.width);
}
/** @type {{[key:`#${string}`:{biome_filename:string,height_index:number}]}} */
const colorMap = {};
{
    const biomes = biomesToLoad.Biome;
    for (const biome of biomes) {
        let { color, biome_filename, height_index } = biome("attr");
        color = "#" + color.slice(2).toLowerCase();
        colorMap[color] = { biome_filename, height_index: +height_index };
    }
}

{
    console.groupCollapsed("像素信息");

    for (const [{ x, y }, color] of await parseImage(biomeMapImage.src)) {
        const data = colorMap[color];
        if (!data) throw new ReferenceError("颜色索引失败，不存在对应Biome");
        console.log(`%c${color}%c\t(${x},${y})`, `background:${color};padding:3px;fontfamily:mono`, `background:none;padding:3px;`, data);
        const block = h.div({ style: { background: color }, title: data.biome_filename + "\n" + `(${x},${y})` });

        if (data.biome_filename.startsWith("data/biome/gold")) block.append("金");
        else if (data.biome_filename.startsWith("data/biome/orbrooms")) block.append("魔");
        else if (data.biome_filename.startsWith("data/biome/essenceroom")) block.append("精");
        else if (data.biome_filename.startsWith("data/biome/temple_altar")) block.append("圣");

        biomeMap.append(block);
    }

    console.groupEnd();
}

{
    /** @type {Set<string>} */
    const set = new Set();
    for (const color in colorMap) {
        const data = colorMap[color];
        const { biome_filename, height_index } = data;
        parseXMLFromUrl("/" + biome_filename).then(async doc => {
            const xmlData = doc.xmlObject.Biome[0];
            data.data = xmlData;

            const { wang_template_file, lua_script } = xmlData.Topology[0]("attr");
            console.group(biome_filename);
            console.log("wang_template", wang_template_file);
            console.log("script", lua_script);
            console.log("<Material>", xmlData.Materials[0]("attr"));

            console.groupEnd();
            if (wang_template_file) {
                if (set.has(wang_template_file)) return;
                set.add(wang_template_file);
                const tiles = await splitWangTiles("/" + wang_template_file);
                const colorInfo = h.code({ style: { color: "#000", background: color, borderRadius: "3px", padding: "3px" } }, color);
                const summary = h.summary(colorInfo, " ", biome_filename);
                const tilesInfo = h.p(wang_template_file);
                const details = h.details({ open: true, style: { "--color": color } }, summary, tilesInfo);
                if (tiles.single) {
                    tilesInfo.append(h.br(), h.code(`单片瓷砖`));
                    details.append(...tiles.single);
                } else {
                    const detailsH = h.details({ open: true }, h.summary(`横向瓷砖 ${tiles.horizontal.length}`), tiles.horizontal);
                    const detailsV = h.details({ open: true }, h.summary(`纵向瓷砖 ${tiles.vertical.length}`), tiles.vertical);
                    const allMaterials = new Set();
                    for (const tile of [...tiles.horizontal, ...tiles.vertical]) {
                        for (const m of await getMaterials(tile)) {
                            allMaterials.add(m);
                        }
                    }
                    details.append(detailsH, detailsV, h.div("材料:", [...allMaterials].join(" ")));
                }
                document.body.append(details);
            }
        });
    }
}

console.log(colorMap);

document.body.append(biomeMap);
