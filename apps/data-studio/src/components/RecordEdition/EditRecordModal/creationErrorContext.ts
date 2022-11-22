// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext} from 'react';
import {SAVE_VALUE_BATCH_saveValueBatch_errors} from '_gqlTypes/SAVE_VALUE_BATCH';
export interface ICreationErrorByField {
    [attributeId: string]: SAVE_VALUE_BATCH_saveValueBatch_errors;
}

const CreationErrorContext = createContext<ICreationErrorByField>({});

export default CreationErrorContext;
