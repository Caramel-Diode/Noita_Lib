import { HTMLNoitaElement } from "./@panel";
/** `🔤 容器类型` */
export type ContainerType = "common" | "conical" | "jar" | "bag";

export type Class = {
    new (): HTMLNoitaElement & {
        displayMode: "icon";
        containerType: "common" | "conical" | "jar" | "bag";
        containerContent: string;
    };
};
