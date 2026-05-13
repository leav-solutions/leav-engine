import React from 'react';

export interface ILangContext {
    lang: string[];
    availableLangs: string[];
    defaultLang: string;
    setLang: (lang: string) => void;
}

const LangContext = React.createContext<ILangContext | null>(null);

export default LangContext;
