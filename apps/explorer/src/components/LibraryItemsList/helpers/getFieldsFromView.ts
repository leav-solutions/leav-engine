// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {viewSettingsField} from 'constants/constants';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {IField, ILang, IView} from '_types/types';
import extractAttributesFromLibrary from './extractAttributesFromLibrary';
import getFieldFromKey from './getFieldFromKey';

export default (view: IView, library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list, lang: ILang): IField[] => {
    const defaultAttributes = extractAttributesFromLibrary(library);

    return !!view.settings?.find(s => s.name === viewSettingsField)
        ? view.settings
              .find(s => s.name === viewSettingsField)
              .value.reduce((acc, fieldKey) => {
                  const field = getFieldFromKey(fieldKey, library, defaultAttributes, lang);
                  return field ? [...acc, field] : acc;
              }, [])
        : [];
};
