// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {getValuesToDisplayInCell} from './utils';

const nullValue = {value: null, isInherited: null, attribute: mockAttributeSimple};

const inheritedValues = [
    {value: 'inherited_value_1', isInherited: true, attribute: mockAttributeSimple},
    {value: 'inherited_value_2', isInherited: true, attribute: mockAttributeSimple}
];

const overrideValues = [
    {value: 'override_value_1', isInherited: false, attribute: mockAttributeSimple},
    {value: 'override_value_2', isInherited: false, attribute: mockAttributeSimple}
];

describe('utils', () => {
    describe('getValuesToDisplayInCell', () => {
        it('should return inherited values', () => {
            const values = [...inheritedValues, nullValue];

            expect(getValuesToDisplayInCell(values)).toEqual(inheritedValues);
        });

        it('should return override values', () => {
            const values = [...inheritedValues, ...overrideValues];

            expect(getValuesToDisplayInCell(values)).toEqual(overrideValues);
        });
    });
});
