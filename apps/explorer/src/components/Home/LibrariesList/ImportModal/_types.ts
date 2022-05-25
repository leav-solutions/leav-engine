// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute
} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {ImportMode, ImportType} from '_gqlTypes/globalTypes';

export interface ISheet {
    name: string;
    columns: string[];
    data: Array<{[col: string]: string}>;
    attributes: GET_ATTRIBUTES_BY_LIB_attributes_list[];
    mapping: Array<string | null>;
    type?: ImportType;
    mode?: ImportMode;
    library?: string;
    linkAttribute?: string;
    linkAttributeProps?:
        | GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
        | GET_ATTRIBUTES_BY_LIB_attributes_list_TreeAttribute;
    keyColumnIndex?: number;
    keyToAttributes?: GET_ATTRIBUTES_BY_LIB_attributes_list[];
    keyToColumnIndex?: number;
    treeLinkLibrary?: string;
}

export enum ImportSteps {
    SELECT_FILE = 0,
    CONFIG = 1,
    PROCESSING = 2,
    DONE = 3
}

export enum SheetSettingsError {
    TYPE = 'TYPE',
    MODE = 'MODE',
    LIBRARY = 'LIBRARY',
    MAPPING = 'MAPPING',
    LINK_ATTRIBUTE = 'LINK_ATTRIBUTE',
    KEY_TO = 'KEY_TO',
    KEY = 'KEY'
}
