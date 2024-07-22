/** 魔球ID */
export type OrbId = "common" | "red" | "discovered" | "evil" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
/** 魔球数据 */
export type OrbData = {
    id: OrbId;
    name: "真理魔球" | "腐化魔球" | "空";
    spellIcon: HTMLImageElement;
};

export type Class = {
    new (id: OrbId | undefined): HTMLElement & { orbData: OrbData };
};
