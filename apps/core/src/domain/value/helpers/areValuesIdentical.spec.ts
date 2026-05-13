import {type ISaveValue, type IValue} from '../../../_types/value';

import {mockAttrSimple} from '../../../__tests__/mocks/attribute';
import areValuesIdentical from './areValuesIdentical';

describe('AreValuesIdentical', () => {
    describe('simple attribute', () => {
        test('should return true if values and metadata are identical', () => {
            const value1: IValue = {payload: 'hello', metadata: {foo: 'bar'}};
            const value2: ISaveValue = {payload: 'hello', metadata: {foo: 'bar'}};
            expect(areValuesIdentical(mockAttrSimple, value1, value2)).toBe(true);

            const value3: IValue = {payload: 'hello'};
            const value4: ISaveValue = {payload: 'hello'};
            expect(areValuesIdentical(mockAttrSimple, value3, value4)).toBe(true);
        });

        test('should return false if values are different', () => {
            const value1: IValue = {payload: 'hello', metadata: {foo: 'bar'}};
            const value2: ISaveValue = {payload: 'world', metadata: {foo: 'bar'}};
            expect(areValuesIdentical(mockAttrSimple, value1, value2)).toBe(false);
        });

        test('should return false if metadata is different', () => {
            const value1: IValue = {payload: 'hello', metadata: {foo: 'bar'}};
            const value2: ISaveValue = {payload: 'hello', metadata: {bar: 'baz'}};
            expect(areValuesIdentical(mockAttrSimple, value1, value2)).toBe(false);

            const value3: IValue = {payload: 'hello'};
            const value4: ISaveValue = {payload: 'hello', metadata: {bar: 'baz'}};
            expect(areValuesIdentical(mockAttrSimple, value3, value4)).toBe(false);
        });

        test('should return true if metadata are falsy on both values', () => {
            const value1: IValue = {payload: 'hello'};
            const value2: ISaveValue = {payload: 'hello'};
            expect(areValuesIdentical(mockAttrSimple, value1, value2)).toBe(true);

            const value3: IValue = {payload: 'hello', metadata: null};
            const value4: ISaveValue = {payload: 'hello', metadata: null};
            expect(areValuesIdentical(mockAttrSimple, value3, value4)).toBe(true);

            const value5: IValue = {payload: 'hello', metadata: undefined};
            const value6: ISaveValue = {payload: 'hello', metadata: undefined};
            expect(areValuesIdentical(mockAttrSimple, value5, value6)).toBe(true);

            const value7: IValue = {payload: 'hello', metadata: {}};
            const value8: ISaveValue = {payload: 'hello', metadata: null};
            expect(areValuesIdentical(mockAttrSimple, value7, value8)).toBe(true);

            const value9: IValue = {payload: 'hello'};
            const value10: ISaveValue = {payload: 'hello', metadata: null};
            expect(areValuesIdentical(mockAttrSimple, value9, value10)).toBe(true);
        });

        test('should return false if both values and metadata are different', () => {
            const value1: IValue = {payload: 'hello', metadata: {foo: 'bar'}};
            const value2: ISaveValue = {payload: 'world', metadata: {bar: 'baz'}};
            expect(areValuesIdentical(mockAttrSimple, value1, value2)).toBe(false);
        });

        test('should return false if one of the values is null or undefined', () => {
            const value1: IValue = {payload: 'hello', metadata: {foo: 'bar'}};
            const value2: ISaveValue = {payload: null, metadata: {foo: 'bar'}};
            expect(areValuesIdentical(mockAttrSimple, value1, value2)).toBe(false);

            const value3: IValue = {payload: 'hello', metadata: {foo: 'bar'}};
            const value4: ISaveValue = {payload: undefined, metadata: {foo: 'bar'}};
            expect(areValuesIdentical(mockAttrSimple, value3, value4)).toBe(false);

            const value5: IValue = {payload: null, metadata: {foo: 'bar'}};
            const value6: ISaveValue = {payload: undefined, metadata: {foo: 'bar'}};
            expect(areValuesIdentical(mockAttrSimple, value5, value6)).toBe(false);
        });
    });
});
