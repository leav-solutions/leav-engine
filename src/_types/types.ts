export interface ILabel {
    fr: string;
    en: string;
    [x: string]: string;
}

export interface ILibrary {
    id: string;
    label: ILabel;
    gqlNames: {
        query: string;
    };
}

export interface IPreview {
    small: string;
    medium: string;
    big: string;
}

export interface IItems {
    id: string;
    whoAmI: {
        id: string;
        label: string;
        preview: IPreview;
    };
}
