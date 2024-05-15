// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getValuesToDisplayInCell} from './utils';

const nullValue = {value: null, isInherited: null};

const inheritedValues = [
    {value: 'inherited_value_1', isInherited: true},
    {value: 'inherited_value_2', isInherited: true}
];

const overrideValues = [
    {value: 'override_value_1', isInherited: false},
    {value: 'override_value_2', isInherited: false}
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
