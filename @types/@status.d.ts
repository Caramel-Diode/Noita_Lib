import { HTMLNoitaElement } from "./@panel";
/** `🔤 状态类型` */
type StatusType = "WET" | "OILED" | "BLOODY" | "SLIMY" | "RADIOACTIVE" | "ALCOHOLIC" | "POISONED" | "TELEPORTATION" | "UNSTABLE_TELEPORTATION" | "HP_REGENERATION" | "POLYMORPH" | "POLYMORPH_RANDOM" | "POLYMORPH_UNSTABLE" | "POLYMORPH_CESSATION" | "BERSERK" | "CHARM" | "INVISIBILITY" | "ON_FIRE" | "CONFUSION" | "MOVEMENT_FASTER_2X" | "FASTER_LEVITATION" | "WORM_ATTRACTOR" | "PROTECTION_ALL" | "MANA_REGENERATION" | "JARATE" | "HYDRATED" | "INGESTION_DRUNK" | "TRIP" | "NIGHTVISION" | "FOOD_POISONING" | "INGESTION_MOVEMENT_SLOWER" | "INGESTION_DAMAGE" | "INGESTION_EXPLODING" | "INGESTION_FREEZING" | "FARTS" | "RAINBOW_FARTS" | "INGESTION_ON_FIRE" | "CURSE_CLOUD" | "PROTECTION_POLYMORPH" | "WEAKNESS" | "MAMMI_EATER";

export type StatusData = {
    id: StatusType;
    name: string;
    desc: string;
    entity: string;
    threshold: number;
};

type HTMLNoitaStatusElement = HTMLNoitaElement & {
    statusData: StatusData;
    displayMode: "icon";
    statusId: StatusType;
    statusThreshold: `${number}`;
};

export type Class = {
    /**
     * @param id 状态类型
     * @param threshold 状态阶段
     */
    new (id?: StatusType, threshold?: number): HTMLNoitaStatusElement;
};
