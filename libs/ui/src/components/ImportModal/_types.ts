// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributesByLibAttributeFragment,
    AttributesByLibAttributeLinkAttributeFragment,
    AttributesByLibAttributeTreeAttributeFragment,
    ImportMode,
    ImportType
} from '_ui/_gqlTypes';

export interface ISheet {
    name: string;
    columns: string[];
    data: Array<{[col: string]: string}>;
    attributes: AttributesByLibAttributeFragment[];
    mapping: Array<string | null>;
    type?: ImportType;
    mode?: ImportMode;
    library?: string;
    linkAttribute?: string;
    linkAttributeProps?: AttributesByLibAttributeLinkAttributeFragment | AttributesByLibAttributeTreeAttributeFragment;
    keyColumnIndex?: number;
    keyToAttributes?: AttributesByLibAttributeFragment[];
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
