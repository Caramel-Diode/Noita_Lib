let flags = [
    [
        ["misc_chest_rain", "crain"],
        ["misc_util_rain", "urain"],
        ["misc_worm_rain", "wrain"],
        ["misc_greed_rain", "grain"],
        ["misc_altar_tablet", "train"],
        ["misc_mimic_potion_rain", "mrain"],
        ["misc_monk_bots", "mbots"],
        ["misc_sun_effect", "seffect"],
        ["misc_darksun_effect", "dseffect"],
        ["secret_tower", "secrett"],
        ["player_status_ghostly", "pghost"],
        ["player_status_ratty", "prat"],
        ["player_status_funky", "pfungi"],
        ["player_status_lukky", "plukki"],
        ["player_status_halo", "phalo"]
    ],
    [
        ["essence_fire", "essencef"],
        ["essence_water", "essencew"],
        ["essence_laser", "essencee"],
        ["essence_air", "essencea"],
        ["essence_alcohol", "essenceal"],
        ["secret_moon", "moon"],
        ["secret_moon2", "moona"],
        ["special_mood", "moong"],
        ["secret_dmoon", "dmoon"],
        ["dead_mood", "dmoong"],
        ["secret_sun_collision", "sunmoon"],
        ["secret_darksun_collision", "dsunmoon"]
    ],
    [
        ["progress_ending0", "end0"],
        ["progress_ending1_toxic", "endt"],
        ["progress_ending1_gold", "endb"],
        ["progress_ending2", "endg"],
        ["progress_newgameplusplus3", "endp"],
        ["progress_nightmare", "endn"]
    ],
    [
        ["miniboss_dragon", "minid"],
        ["miniboss_limbs", "minil"],
        ["miniboss_meat", "meat"],
        ["miniboss_ghost", "minigh"],
        ["miniboss_pit", "minip"],
        ["miniboss_alchemist", "minia"],
        ["miniboss_robot", "minir"],
        ["miniboss_wizard", "meme"],
        ["miniboss_maggot", "maggot"],
        ["miniboss_fish", "fish"],
        ["miniboss_islandspirit", "elk"],
        ["miniboss_threelk", "threelk"],
        ["miniboss_gate_monsters", "minigm"],
        ["final_secret_orb3", "yeah3"],
        ["miniboss_sky", "minisky"],
        ["boss_centipede", "boss"]
    ],
    [
        ["progress_orb_1", "orbf"],
        ["progress_orb_evil", "orbe"],
        ["progress_orb_all", "orba"],
        ["progress_pacifist", "pacifist"],
        ["progress_nogold", "nogold"],
        ["progress_clock", "clock"],
        ["progress_minit", "minit"],
        ["progress_nohit", "nohit"],
        ["progress_sun", "sun"],
        ["progress_darksun", "dsun"],
        ["progress_sunkill", "sunkill"],
        ["secret_supernova", "col"]
    ],
    [
        ["secret_greed", "secretg"],
        ["final_secret_orb", "yeah"],
        ["final_secret_orb2", "yeah2"],
        ["secret_chest_dark", "secretcd"],
        ["secret_chest_light", "secretcl"],
        ["card_unlocked_everything", "secretall"],
        ["card_unlocked_divide", "secretten"],
        ["secret_fruit", "secretf"],
        ["secret_allessences", "secretae"],
        ["secret_meditation", "secretme"],
        ["secret_buried_eye", "secretbe"],
        ["secret_hourglass", "secrethg"],
        ["progress_hut_a", "huta"],
        ["progress_hut_b", "hutb"],
        ["secret_null", "null"]
    ]
];
const table = h.table(h.tr(h.th(`石柱图像`), h.th(`persistent/flags/下对应文件`)));
for (const group of flags) {
    for (const [name, pngNamePart] of group) {
        const path = `/data/biome_impl/pillars/pillar_part_${pngNamePart}.png`;
        const tr = h.tr(h.td({ style: { paddingBottom: "10px" } }, h.img({ src: path })), h.td({ style: { fontSize: "20px", textAlign: "center" } }, name));
        table.append(tr);
    }
}
addEventListener("DOMContentLoaded", () => document.body.append(table));
