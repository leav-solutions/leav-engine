// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getInheritedValues} from './getInheritedValues';

const nullValues = [{value: null, isInherited: null}];

const inheritedValues = [
    {value: 'inherited_value_1', isInherited: true},
    {value: 'inherited_value_2', isInherited: true}
];

const overrideValues = [
    {value: 'override_value_1', isInherited: false},
    {value: 'override_value_2', isInherited: false}
];

describe('utils getInheritedValues', () => {
    it('should return inherited values', () => {
        const values = [...inheritedValues, ...nullValues];

        expect(getInheritedValues(values)).toEqual(inheritedValues);
    });

    it('should return override values', () => {
        const values = [...inheritedValues, ...overrideValues];

        expect(getInheritedValues(values)).toEqual(overrideValues);
    });

    it('should return input values if it not inherited or override', () => {
        expect(getInheritedValues(nullValues)).toEqual(nullValues);
    });
});
