import {useContext} from 'react';
import {type ILangContext, LangContext} from '../../contexts/LangContext';

const useLang = (): ILangContext => {
    const lang = useContext(LangContext);

    if (!lang) {
        throw new Error('useLang must be used inside a <LangContext.Provider />');
    }

    return lang;
};

export default useLang;
