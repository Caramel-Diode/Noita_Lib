/**
 * `lua` 生成的法术数据
 * [lua file](generate_js_code.lua)
 */
type SpellBaseData = {
    id: String;
    name: String;
    desc: String;
    type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    maxUse: Number;
    neverUnlimited: 0 | 1;
    mana: Number;
    spwanLevel: String;
    spawnProb: String;
    spawnRequiresFlag: String;
    price: Number;
    passiveEffect: String;
    relatedProjectiles: [String, Number?];
    projectiles: Array<{ min: Number; max: Number; id: String; draw_death: Number; draw_hit: Number; draw_time_count: Number; draw_time_delay: Number }>;
    damageMod: {
        projectile: Number;
        explosion: Number;
        ice: Number;
        electricity: Number;
        melee: Number;
        fire: Number;
        slice: Number;
        healing: Number;
        curse: Number;
        drill: Number;
        holy: Number;
    };

    reloadTime: Number;
    fireRateWait: Number;

    draw: Number;
    extraEntities: String;
    gameEffectEntities: String;
    goreParticles: Number;
    lifetime: Number;
    spreadDegrees: Number;
    patternDegrees: Number;
    screenshake: Number;
    damageCriticalChance: Number;
    speedMultiplier: Number;
    childSpeedMultiplier: Number;
    explosionRadius: Number;
    gravity: Number;
    bounces: Number;
    knockbackForce: Number;
    lightningCount: Number;
    ragdollFx: Number;
    material: String;
    materialAmount: Number;
    trailMaterial: String;
    trailMaterialAmount: Number;
    friendlyFire: 0 | 1;

    recoilKnockback: Number;

    icon: String;
};

declare const spellBaseDatas: Array<SpellBaseData>;
