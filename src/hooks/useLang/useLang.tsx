import {useContext} from 'react';
import LangContext, {ILangContext} from '../../components/shared/LangContext/LangContext';

function useLang(): ILangContext {
    const lang = useContext(LangContext);

    if (!lang) {
        throw new Error('useLang must be used inside a <useLang.Provider />');
    }

    return lang;
}

export default useLang;
