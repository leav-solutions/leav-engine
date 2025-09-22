// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILang} from '_ui/types/misc';
import {type IField} from '_ui/types/search';
import {type IView} from '_ui/types/views';
import {type ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import extractAttributesFromLibrary from './extractAttributesFromLibrary';
import getFieldFromKey from './getFieldFromKey';

export default (view: IView, library: ILibraryDetailExtended, lang: ILang): IField[] => {
    const defaultAttributes = extractAttributesFromLibrary(library);

    return (view.attributes ?? []).reduce((acc, fieldKey) => {
        const field = getFieldFromKey(fieldKey, library, defaultAttributes, lang);
        return field ? [...acc, field] : acc;
    }, []);
};
