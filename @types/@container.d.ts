/** `🔤 容器类型` */
export type ContainerType = "common" | "conical" | "jar" | "bag";

export type Class = {
    new (): HTMLElement & {
        contentUpdate: () => never;
    };
};
