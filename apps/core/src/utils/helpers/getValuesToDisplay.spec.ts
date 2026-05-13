import {getValuesToDisplay} from './getValuesToDisplay';

const nullValue = {payload: null, isInherited: null};

const inheritedValues = [
    {payload: 'inherited_value_1', isInherited: true},
    {payload: 'inherited_value_2', isInherited: true},
];

const overrideValues = [
    {payload: 'override_value_1', isInherited: false},
    {payload: 'override_value_2', isInherited: false},
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
