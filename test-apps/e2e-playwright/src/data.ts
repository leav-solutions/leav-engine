// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const testLib1 = 'test_library1';
export const attribute1 = 'simple_text_attribute_1';
export const attribute2 = 'simple_text_attribute_2';

export const actions = {
    ADD: 'add',
};

export const initialData = {
    elements: [
        {
            library: testLib1,
            matches: [
                {
                    attribute: attribute1,
                    value: 'test_value_1',
                },
            ],
            data: [
                {
                    attribute: attribute1,
                    values: [{payload: 'random texte 1'}],
                    action: actions.ADD,
                },

                {
                    attribute: attribute2,
                    values: [{payload: 'autre random 1'}],
                    action: actions.ADD,
                },
            ],
        },
        {
            library: testLib1,
            matches: [
                {
                    attribute: attribute1,
                    value: 'test_value_2',
                },
            ],
            data: [
                {
                    attribute: attribute1,
                    values: [{payload: 'random texte 2'}],
                    action: actions.ADD,
                },

                {
                    attribute: attribute2,
                    values: [{payload: 'autre random 2'}],
                    action: actions.ADD,
                },
            ],
        },
    ],
    trees: [],
};
