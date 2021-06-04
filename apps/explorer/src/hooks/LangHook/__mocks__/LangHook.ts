// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetLangAll} from 'graphQL/queries/cache/lang/getLangQuery';

export const useLang = (): [IGetLangAll, (langInfo: Partial<IGetLangAll>) => void] => {
    return [{lang: ['fr', 'FR'], availableLangs: ['fr', 'en'], defaultLang: 'fr'}, jest.fn()];
};
