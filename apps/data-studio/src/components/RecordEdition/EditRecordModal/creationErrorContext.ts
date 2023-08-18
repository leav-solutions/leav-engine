// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext} from 'react';
import {CREATE_RECORD_createRecord_valuesErrors} from '_gqlTypes/CREATE_RECORD';
export interface ICreationErrorByField {
    [attributeId: string]: CREATE_RECORD_createRecord_valuesErrors[];
}

const CreationErrorContext = createContext<ICreationErrorByField>({});

export default CreationErrorContext;
