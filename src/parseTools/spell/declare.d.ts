/**
 * `lua` 生成的法术数据
 * [lua file](generate_js_code.lua)
 */
type SpellBaseData = {
    id: string;
    name: string;
    desc: string;
    type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    maxUse: number;
    neverUnlimited: boolean;
    mana: number;
    spwanLevel: string;
    spawnProb: string;
    spawnRequiresFlag: string;
    price: number;
    passiveEffect: string;
    relatedProjectiles: [string, number?];
    projectiles: Array<{ min: number; max: number; id: string; draw_death: number; draw_hit: number; draw_time_count: number; draw_time_delay: number }>;
    damageMod: {
        projectile: number;
        explosion: number;
        ice: number;
        electricity: number;
        melee: number;
        fire: number;
        slice: number;
        healing: number;
        curse: number;
        drill: number;
        holy: number;
    };

    reloadTime: number;
    fireRateWait: number;

    draw: number;
    extraEntities: string;
    gameEffectEntities: string;
    goreParticles: number;
    lifetime: number;
    spreadDegrees: number;
    patternDegrees: number;
    screenshake: number;
    damageCriticalChance: number;
    speedMultiplier: number;
    childSpeedMultiplier: number;
    explosionRadius: number;
    gravity: number;
    bounces: number;
    knockbackForce: number;
    lightningCount: number;
    ragdollFx: number;
    material: string;
    materialAmount: number;
    trailMaterial: string;
    trailMaterialAmount: number;
    friendlyFire: 0 | 1;

    recoilKnockback: number;

    icon: string;
    
    recursive: boolean;
    aiNeverUses: boolean;
    spawnManualUnlock: boolean;
};

declare const spellBaseDatas: Array<SpellBaseData>;
