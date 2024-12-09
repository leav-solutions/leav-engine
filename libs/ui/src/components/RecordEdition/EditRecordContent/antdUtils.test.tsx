// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getAntdFormInitialValues, getEmptyInitialValue} from '_ui/components/RecordEdition/EditRecordContent/antdUtils';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

jest.mock('dayjs', () => ({
    unix: jest.fn(t => t)
}));

describe('getAntdFormInitialValues', () => {
    test('Should return empty object on empty elements', async () => {
        const recordForm = {elements: []};

        const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

        expect(antdFormInitialValues).toEqual({});
    });

    test('Should skip if attribute is undefined', async () => {
        const elementWithoutAttribute = {values: []};
        const recordForm = {elements: [elementWithoutAttribute]};

        const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

        expect(antdFormInitialValues).toEqual({});
    });

    describe.each([{type: AttributeType.simple_link}, {type: AttributeType.advanced_link, multiple_values: false}])(
        'Simple link and Advanced link without multiple values',
        attributeProperties => {
            test('Should initialize antd form with given value for links (advanced and simple)', async () => {
                const elementFormId = 'elementFormId';
                const linkAttributeId = 'linkAttributeId';
                const linkElement = {
                    attribute: {...attributeProperties, id: linkAttributeId},
                    values: [{linkValue: {id: elementFormId}}]
                };
                const recordForm = {elements: [linkElement]};

                const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

                expect(antdFormInitialValues).toEqual({
                    [linkAttributeId]: elementFormId
                });
            });

            test('Should initialize antd form with undefined for links (advanced and simple) when linkValue is not set', async () => {
                const linkAttributeId = 'linkAttributeId';
                const linkElement = {
                    attribute: {...attributeProperties, id: linkAttributeId},
                    values: [{}]
                };
                const recordForm = {elements: [linkElement]};

                const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

                expect(antdFormInitialValues).toEqual({
                    [linkAttributeId]: undefined
                });
            });
        }
    );

    describe('Advanced link with multiple values', () => {
        test('Should initialize antd form with given value for links', async () => {
            const elementFormId = 'elementFormId';
            const yetAnotherElementFormId = 'yetAnotherElementFormId';
            const linkAttributeId = 'linkAttributeId';
            const linkElement = {
                attribute: {type: AttributeType.advanced_link, multiple_values: true, id: linkAttributeId},
                values: [{linkValue: {id: elementFormId}}, {linkValue: {id: yetAnotherElementFormId}}]
            };
            const recordForm = {elements: [linkElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [linkAttributeId]: [elementFormId, yetAnotherElementFormId]
            });
        });

        test('Should initialize antd form with empty array for links when linkValue is not set', async () => {
            const linkAttributeId = 'linkAttributeId';
            const linkElement = {
                attribute: {type: AttributeType.advanced_link, multiple_values: true, id: linkAttributeId},
                values: [{}]
            };
            const recordForm = {elements: [linkElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [linkAttributeId]: []
            });
        });
    });

    describe('Advanced standard field with multiple values', () => {
        test('Should initialize antd form with given value', async () => {
            const elementFormId = 'elementFormId';
            const yetAnotherElementFormId = 'yetAnotherElementFormId';
            const standardAttributeId = 'standardAttributeId';
            const standardElement = {
                attribute: {
                    type: AttributeType.advanced,
                    format: AttributeFormat.text,
                    multiple_values: true,
                    id: standardAttributeId
                },
                values: [
                    {raw_payload: elementFormId, id_value: '12'},
                    {raw_payload: yetAnotherElementFormId, id_value: '13'}
                ]
            };
            const recordForm = {elements: [standardElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [standardAttributeId]: [elementFormId, yetAnotherElementFormId]
            });
        });

        test('Should initialize antd form with array containing null for standard field when value is not set', async () => {
            const standardAttributeId = 'standardAttributeId';
            const standardElement = {
                attribute: {
                    type: AttributeType.advanced,
                    format: AttributeFormat.text,
                    multiple_values: true,
                    id: standardAttributeId
                },
                values: []
            };
            const recordForm = {elements: [standardElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [standardAttributeId]: ['']
            });
        });
    });

    describe('AttributeFormat.text', () => {
        test('Should initialize antd form with given value for text attribute', async () => {
            const rawValue = 'rawValue';
            const textAttributeId = 'textAttributeId';
            const textElement = {
                attribute: {format: AttributeFormat.text, id: textAttributeId},
                values: [{raw_payload: rawValue}]
            };
            const recordForm = {elements: [textElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [textAttributeId]: rawValue
            });
        });

        test('Should initialize antd form with given empty string for text when raw_value is not set', async () => {
            const textAttributeId = 'textAttributeId';
            const textElement = {
                attribute: {format: AttributeFormat.text, id: textAttributeId},
                values: [{}]
            };
            const recordForm = {elements: [textElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [textAttributeId]: ''
            });
        });
    });

    describe('AttributeFormat.date_range', () => {
        test('Should skip when raw_value is not set', async () => {
            const dateRangeElementWithoutRawValue = {
                attribute: {format: AttributeFormat.date_range},
                values: [{}]
            };
            const recordForm = {elements: [dateRangeElementWithoutRawValue]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({});
        });

        test('Should initialize antd form with dayjs formatted value for date_range attribute', async () => {
            const from = '1000';
            const to = '2000';
            const dateRangeAttributeId = 'dateRangeAttributeId';
            const strcturedDateRangeElement = {
                attribute: {format: AttributeFormat.date_range, id: dateRangeAttributeId},
                values: [{raw_payload: {from, to}}]
            };
            const recordForm = {elements: [strcturedDateRangeElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [dateRangeAttributeId]: [Number(from), Number(to)]
            });
        });

        test('Should initialize antd form with dayjs formatted value for stringified date_range attribute', async () => {
            const from = '1000';
            const to = '2000';
            const dateRangeAttributeId = 'dateRangeAttributeId';
            const strcturedDateRangeElement = {
                attribute: {format: AttributeFormat.date_range, id: dateRangeAttributeId},
                values: [{raw_payload: JSON.stringify({from, to})}]
            };
            const recordForm = {elements: [strcturedDateRangeElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [dateRangeAttributeId]: [Number(from), Number(to)]
            });
        });
    });

    describe('AttributeFormat.color', () => {
        test('Should skip when raw_value is not set', async () => {
            const colorElementWithoutRawValue = {
                attribute: {format: AttributeFormat.color},
                values: [{}]
            };
            const recordForm = {elements: [colorElementWithoutRawValue]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({});
        });

        test('Should initialize antd form with given value for color attribute', async () => {
            const rawValue = 'rawValue';
            const colorAttributeId = 'colorAttributeId';
            const colorElement = {
                attribute: {format: AttributeFormat.color, id: colorAttributeId},
                values: [{raw_payload: rawValue}]
            };
            const recordForm = {elements: [colorElement]};

            const antdFormInitialValues = getAntdFormInitialValues(recordForm as any);

            expect(antdFormInitialValues).toEqual({
                [colorAttributeId]: rawValue
            });
        });
    });
});

describe('getEmptyInitialValue', () => {
    test('Should return undefined for date_range and color attributes', async () => {
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.date_range})).toBeUndefined();
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.color})).toBeUndefined();
    });

    test('Should return empty string for other attributes', async () => {
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.text})).toBe('');
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.rich_text})).toBe('');
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.boolean})).toBe('');
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.date})).toBe('');
        expect(getEmptyInitialValue({...mockFormAttribute, format: AttributeFormat.extended})).toBe('');
    });
});
