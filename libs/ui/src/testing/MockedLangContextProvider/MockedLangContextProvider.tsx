// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILangContext, LangContext} from '../../contexts/LangContext';

function MockedLangContextProvider({children}) {
    const mockLangs: ILangContext = {
        lang: ['fr'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        setLang: jest.fn()
    };

    return <LangContext.Provider value={mockLangs}>{children}</LangContext.Provider>;
}

export default MockedLangContextProvider;
