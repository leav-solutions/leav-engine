export interface ILangContext {
    lang: string[];
    availableLangs: string[];
    defaultLang: string;
    setLang: (lang: string) => void;
}
