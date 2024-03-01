// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext} from 'react';
import {CreateRecordMutation} from '../../../_gqlTypes';
export interface ICreationErrorByField {
    [attributeId: string]: CreateRecordMutation['createRecord']['valuesErrors'];
}

const CreationErrorContext = createContext<ICreationErrorByField>({});

export default CreationErrorContext;
