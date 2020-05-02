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
