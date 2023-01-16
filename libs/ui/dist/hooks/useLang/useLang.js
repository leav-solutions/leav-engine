// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { useContext } from 'react';
import { LangContext } from '../../contexts/LangContext';
function useLang() {
    const lang = useContext(LangContext);
    if (!lang) {
        throw new Error('useLang must be used inside a <LangContext.Provider />');
    }
    return lang;
}
export default useLang;
//# sourceMappingURL=useLang.js.map