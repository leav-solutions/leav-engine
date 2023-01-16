import { jsx as _jsx } from "react/jsx-runtime";
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { LangContext } from '../../contexts/LangContext';
function MockedLangContextProvider({ children }) {
    const mockLangs = {
        lang: ['fr'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        setLang: jest.fn()
    };
    return _jsx(LangContext.Provider, Object.assign({ value: mockLangs }, { children: children }));
}
export default MockedLangContextProvider;
//# sourceMappingURL=MockedLangContextProvider.js.map