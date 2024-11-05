// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateFormatAction from './validateFormatAction';

describe('validateFormatAction', () => {
    const action = validateFormatAction().action;

    const mockAttr = {id: 'test_attr', type: AttributeTypes.SIMPLE};
    const attrText = {...mockAttr, format: AttributeFormats.TEXT};
    const attrColor = {...mockAttr, format: AttributeFormats.COLOR};
    const attrExt = {
        ...mockAttr,
        format: AttributeFormats.EXTENDED,
        embedded_fields: [
            {
                format: AttributeFormats.TEXT,
                id: 'street'
            },
            {
                format: AttributeFormats.EXTENDED,
                id: 'city',
                embedded_fields: [
                    {
                        format: AttributeFormats.NUMERIC,
                        id: 'zipcode'
                    },
                    {
                        format: AttributeFormats.TEXT,
                        id: 'name'
                    }
                ]
            }
        ]
    };
    const ctxAttrExt = {attribute: attrExt, userId: 'test'};
    const ctxAttrColor = {attribute: attrColor, userId: 'test'};
    const ctxAttrText = {attribute: attrText, userId: 'test'};

    test('validateFormat', async () => {
        // Extended
        const extValue = [{payload: {street: 'test', city: {zipcode: 38000, name: 'Grenoble'}}}];
        expect((await action(extValue, {}, ctxAttrExt)).values[0]).toBe(extValue[0]);
    });

    test('Throw if invalid format', async () => {
        // Extended
        const badExtValue = [{payload: {street: 'test', city: {zipcode: 'aaa', name: 'Grenoble'}}}];
        const res = await action(badExtValue, {}, ctxAttrExt);
        expect(res.errors.length).toBe(1);
    });

    test('validateFormat COLOR', async () => {
        const colorValue = [{payload: 'FFFFFF'}];
        expect((await action(colorValue, {}, ctxAttrColor)).values[0]).toBe(colorValue[0]);
    });

    test('Throw if invalid format COLOR', async () => {
        const badColorValue = [{payload: 'AZERTY'}];
        const res = await action(badColorValue, {}, ctxAttrColor);
        expect(res.errors.length).toBe(1);
    });

    test('Throw if invalid format COLOR, to be less or equal to 6 characters ', async () => {
        const badColorValue = [{payload: 'FFFFFFFFFFFFFFFFFFF'}];
        const res = await action(badColorValue, {}, ctxAttrColor);
        expect(res.errors.length).toBe(1);
    });

    test('validateFormat RICH TEXT', async () => {
        const RichTextValue = [{payload: '<p>salut</p>'}];
        expect((await action(RichTextValue, {}, ctxAttrText)).values[0]).toBe(RichTextValue[0]);
    });

    test('validateFormat RICH TEXT', async () => {
        const RichTextValue = [{payload: false}];
        const res = await action(RichTextValue, {}, ctxAttrText);
        expect(res.errors.length).toBe(1);
    });
});
