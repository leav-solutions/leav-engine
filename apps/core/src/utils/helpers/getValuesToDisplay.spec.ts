// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getValuesToDisplay} from './getValuesToDisplay';

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
    describe('getValuesToDisplay', () => {
        it('should return inherited values', () => {
            const values = [...inheritedValues, nullValue];

            expect(getValuesToDisplay(values)).toEqual(inheritedValues);
        });

        it('should return override values', () => {
            const values = [...inheritedValues, ...overrideValues];

            expect(getValuesToDisplay(values)).toEqual(overrideValues);
        });
    });
});
