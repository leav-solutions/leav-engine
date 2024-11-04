// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
