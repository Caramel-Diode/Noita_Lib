/**
 * 将伤害数据转为简短的字符串
 * @param {DamageData} data
 */
export const damageToString = (data) => {
    const cache = [];
    if (data.projectile) cache.push("P", data.projectile);
    if (data.melee) cache.push("M", data.melee);
    if (data.electricity) cache.push("L", data.electricity);
    if (data.fire) cache.push("F", data.fire);
    if (data.explosion) cache.push("E", data.explosion);
    if (data.ice) cache.push("I", data.ice);
    if (data.slice) cache.push("S", data.slice);
    if (data.healing) cache.push("H", data.healing);
    if (data.curse) cache.push("C", data.curse);
    if (data.drill) cache.push("D", data.drill);
    if (data.holy) cache.push("V", data.holy);
    if (data.overeating) cache.push("Y", data.overeating);
    if (data.physicsHit) cache.push("N", data.physicsHit);
    if (data.poison) cache.push("R", data.poison);
    if (data.radioactive) cache.push("O", data.radioactive);
    return cache.join("");
};
