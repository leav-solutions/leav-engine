// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListConfig, IActionsListFunction} from '../../_types/actionsList';

/*** Available Actions ***/
const mockActionBase: IActionsListFunction = {
    id: 'myAction',
    name: 'MyAction',
    description: 'My action',
    input_types: Object.values(ActionsListIOTypes),
    output_types: Object.values(ActionsListIOTypes),
    action: jest.fn()
};

export const mockActionStringOutput = {
    ...mockActionBase,
    id: 'toString',
    name: 'toString',
    output_types: [ActionsListIOTypes.STRING]
};

export const mockActionNumberOutput = {
    ...mockActionBase,
    id: 'toNumber',
    name: 'toNumber',
    output_types: [ActionsListIOTypes.NUMBER]
};

export const mockActionBooleanOutput = {
    ...mockActionBase,
    id: 'toBoolean',
    name: 'toBoolean',
    output_types: [ActionsListIOTypes.BOOLEAN]
};

export const mockActionObjectOutput = {
    ...mockActionBase,
    id: 'toObject',
    name: 'toObject',
    output_types: [ActionsListIOTypes.OBJECT]
};

export const mockActionAllOutput = {
    ...mockActionBase,
    id: 'toAnyType',
    name: 'toAnyType'
};

export const mockAvailActions: IActionsListFunction[] = [
    mockActionStringOutput,
    mockActionNumberOutput,
    mockActionBooleanOutput,
    mockActionObjectOutput,
    mockActionAllOutput
];

/*** Actions list conf ***/
const mockConfBase: IActionsListConfig = {
    saveValue: [],
    deleteValue: [],
    getValue: []
};

export const mockActionsListConfGetString: IActionsListConfig = {
    ...mockConfBase,
    getValue: [
        {
            id: 'toString',
            name: 'toString'
        }
    ]
};

export const mockActionsListConfGetBoolean: IActionsListConfig = {
    ...mockConfBase,
    getValue: [
        {
            id: 'toBoolean',
            name: 'toBoolean'
        }
    ]
};

export const mockActionsListConfGetObject: IActionsListConfig = {
    ...mockConfBase,
    getValue: [
        {
            id: 'toObject',
            name: 'toObject'
        }
    ]
};

export const mockActionsListConfGetNumber: IActionsListConfig = {
    ...mockConfBase,
    getValue: [
        {
            id: 'toNumber',
            name: 'toNumber'
        }
    ]
};

export const mockActionsListConfGetAll: IActionsListConfig = {
    ...mockConfBase,
    getValue: [
        {
            id: 'toAnyType',
            name: 'toAnyType'
        }
    ]
};
