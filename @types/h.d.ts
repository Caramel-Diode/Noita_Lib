type $onEvents = {
    [K in keyof GlobalEventHandlersEventMap as `on${K}`]: (event: GlobalEventHandlersEventMap[K]) => void;
};

type ElementBaseInitOption = {
    id: string;
    class: string | Array<string>;
    style:
        | string
        | {
              [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K : never]: string;
          };
    dataset: { [key: string]: string };
    part: string;
    hidden: boolean;
    tabindex: number;
    Event: {
        [K in keyof GlobalEventHandlersEventMap]: (event: GlobalEventHandlersEventMap[K]) => void;
    };
    shadowRoot: Array<Node>;
    HTML: string | Array<string>;
    $: Object;
};

type ElementInitOption = ElementBaseInitOption & $onEvents;

type H_BaseType = {
    [K in keyof HTMLElementTagNameMap as K extends keyof H_BaseType_special ? never : K]: {
        (option: ElementInitOption, ...nodes: Array<Node | string>): HTMLElementTagNameMap[K];
        (...nodes: Array<Node | string>): HTMLElementTagNameMap[K];
        [key: string]: {
            (option: ElementInitOption, ...nodes: Array<Node | string>): HTMLElementTagNameMap[K];
            (...nodes: Array<Node | string>): HTMLElementTagNameMap[K];
        };
    };
};

type H_BaseType_special = {
    inputButton: {
        (option: ElementInitOption): HTMLInputElement & { type: "button" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "button" };
    };
    inputCheckbox: {
        (option: ElementInitOption): HTMLInputElement & { type: "checkbox" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "checkbox" };
    };
    inputColor: {
        (option: ElementInitOption): HTMLInputElement & { type: "color" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "color" };
    };
    inputDate: {
        (option: ElementInitOption): HTMLInputElement & { type: "date" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "date" };
    };
    inputEmail: {
        (option: ElementInitOption): HTMLInputElement & { type: "email" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "email" };
    };
    inputFile: {
        (option: ElementInitOption): HTMLInputElement & { type: "file" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "file" };
    };
    inputHidden: {
        (option: ElementInitOption): HTMLInputElement & { type: "hidden" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "hidden" };
    };
    inputImage: {
        (option: ElementInitOption): HTMLInputElement & { type: "image" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "image" };
    };
    inputMonth: {
        (option: ElementInitOption): HTMLInputElement & { type: "month" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "month" };
    };
    inputnumber: {
        (option: ElementInitOption): HTMLInputElement & { type: "number" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "number" };
    };
    inputPassword: {
        (option: ElementInitOption): HTMLInputElement & { type: "password" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "password" };
    };
    inputRadio: {
        (option: ElementInitOption): HTMLInputElement & { type: "radio" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "radio" };
    };
    inputRange: {
        (option: ElementInitOption): HTMLInputElement & { type: "range" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "range" };
    };
    inputReset: {
        (option: ElementInitOption): HTMLInputElement & { type: "reset" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "reset" };
    };
    inputSearch: {
        (option: ElementInitOption): HTMLInputElement & { type: "search" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "search" };
    };
    inputSubmit: {
        (option: ElementInitOption): HTMLInputElement & { type: "submit" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "submit" };
    };
    inputTel: {
        (option: ElementInitOption): HTMLInputElement & { type: "tel" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "tel" };
    };
    inputText: {
        (option: ElementInitOption): HTMLInputElement & { type: "text" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "text" };
    };
    inputTime: {
        (option: ElementInitOption): HTMLInputElement & { type: "time" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "time" };
    };
    inputUrl: {
        (option: ElementInitOption): HTMLInputElement & { type: "url" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "url" };
    };
    inputWeek: {
        (option: ElementInitOption): HTMLInputElement & { type: "week" };
        [key: string]: (option: ElementInitOption) => HTMLInputElement & { type: "week" };
    };
    area: {
        (option: ElementInitOption): HTMLAreaElement;
        [key: string]: (option: ElementInitOption) => HTMLAreaElement;
    };
    base: {
        (option: ElementInitOption): HTMLBaseElement;
        [key: string]: (option: ElementInitOption) => HTMLBaseElement;
    };
    br: {
        (option: ElementInitOption): HTMLBRElement;
        [key: string]: (option: ElementInitOption) => HTMLBRElement;
    };
    col: {
        (option: ElementInitOption): HTMLTableColElement;
        [key: string]: (option: ElementInitOption) => HTMLTableColElement;
    };
    embed: {
        (option: ElementInitOption): HTMLEmbedElement;
        [key: string]: (option: ElementInitOption) => HTMLEmbedElement;
    };
    hr: {
        (option: ElementInitOption): HTMLHRElement;
        [key: string]: (option: ElementInitOption) => HTMLHRElement;
    };
    img: {
        (option: ElementInitOption & { width: number; height: number; src:string }): HTMLImageElement;
        [key: string]: (option: ElementInitOption) => HTMLImageElement;
    };
    input: {
        (option: ElementInitOption & { type: "button" | "checkbox" | "color" | "date" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" }): HTMLInputElement;
        [key: string]: (option: ElementInitOption & { type: "button" | "checkbox" | "color" | "date" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" }) => HTMLInputElement;
    };
    link: {
        (option: ElementInitOption): HTMLLinkElement;
        [key: string]: (option: ElementInitOption) => HTMLLinkElement;
    };
    meta: {
        (option: ElementInitOption): HTMLMetaElement;
        [key: string]: (option: ElementInitOption) => HTMLMetaElement;
    };
    source: {
        (option: ElementInitOption): HTMLSourceElement;
        [key: string]: (option: ElementInitOption) => HTMLSourceElement;
    };
    track: {
        (option: ElementInitOption): HTMLTrackElement;
        [key: string]: (option: ElementInitOption) => HTMLTrackElement;
    };
    wbr: {
        (option: ElementInitOption): HTMLElement;
        [key: string]: (option: ElementInitOption) => HTMLElement;
    };
    canvas: {
        (option: ElementInitOption & { width: number; height: number }, ...nodes: Array<Node>): HTMLCanvasElement;
        (...nodes: Array<Node>): HTMLCanvasElement;
        [key: string]: {
            (option: ElementInitOption & { width: number; height: number }, ...nodes: Array<Node>): HTMLCanvasElement;
            (...nodes: Array<Node>): HTMLCanvasElement;
        };
    };
    option: {
        (option: ElementInitOption & { value: string; label: string; selected: boolean }, textContent: string): HTMLOptionElement;
        (textContent: string): HTMLOptionElement;
        [key: string]: {
            (option: ElementInitOption & { value: string; label: string; selected: boolean }, textContent: string): HTMLOptionElement;
            (textContent: string): HTMLOptionElement;
        };
    };
    script: {
        (option: ElementInitOption & { src: string; type: string }, textContent: string): HTMLScriptElement;
        (textContent: string): HTMLScriptElement;
        [key: string]: {
            (option: ElementInitOption, textContent: string): HTMLScriptElement;
            (textContent: string): HTMLScriptElement;
        };
    };
    style: {
        (option: ElementInitOption & { media: string }, textContent: string): HTMLStyleElement;
        (textContent: string): HTMLStyleElement;
        [key: string]: {
            (option: ElementInitOption & { media: string }, textContent: string): HTMLStyleElement;
            (textContent: string): HTMLStyleElement;
        };
    };
    title: {
        (option: ElementInitOption, textContent: string): HTMLTitleElement;
        (textContent: string): HTMLTitleElement;
        [key: string]: {
            (option: ElementInitOption, textContent: string): HTMLTitleElement;
            (textContent: string): HTMLTitleElement;
        };
    };
};

export type H = {
    new (...nodes: Array<Node | string>): () => DocumentFragment;
    (...nodes: Array<Node | string>): DocumentFragment;
    (template: { raw: readonly string[] | ArrayLike<string> }, ...substitutions: any[]): {
        (option: ElementInitOption, ...nodes: Array<Node | string>): HTMLElement;
        (...nodes: Array<Node | string>): HTMLElement;
        [key: string]: {
            (option: ElementInitOption, ...nodes: Array<Node | string>): HTMLElement;
            (...nodes: Array<Node | string>): HTMLElement;
        };
    };
    $(element: HTMLElement): HTMLElement;
    $comment(content: Array<string>): Comment;
} & H_BaseType &
    H_BaseType_special & { [Tag in Uppercase<keyof HTMLElementTagNameMap>]: HTMLElementTagNameMap[Lowercase<Tag>] };
