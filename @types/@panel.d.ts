export type HTMLNoitaElement = HTMLElement & {
    loadPanelContent: (templates: Array<HTMLTemplateElement>) => void;
    contentUpdate: () => void;
    connectedCallback: () => void;
    disconnectedCallback: () => void;
    attributeChangedCallback: () => void;
    /** 当前聚焦的面板 (多选选项卡时) */
    focusedPanel: HTMLElement;
    /** 忽略的面板属性 */
    ignoredPanelAttrs: Array<string>;
};
