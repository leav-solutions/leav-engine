// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateFormatAction from './validateFormatAction';
import {IActionsListFunctionResult} from '_types/actionsList';
import e from 'express';

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
    test('validateFormat', async () => {
        // Extended
        const extValue = [{value: {street: 'test', city: {zipcode: 38000, name: 'Grenoble'}}}];
        expect((action(extValue, {}, {attribute: attrExt}) as IActionsListFunctionResult).values[0]).toBe(extValue[0]);
    });

    test('Throw if invalid format', async () => {
        // Extended
        const badExtValue = [{value: {street: 'test', city: {zipcode: 'aaa', name: 'Grenoble'}}}];
        const res = action(badExtValue, {}, {attribute: attrExt}) as IActionsListFunctionResult;
        expect(res.errors.length).toBe(1);
    });

    test('validateFormat COLOR', async () => {
        const colorValue = [{value: 'FFFFFF'}];
        expect((action(colorValue, {}, {attribute: attrColor}) as IActionsListFunctionResult).values[0]).toBe(
            colorValue[0]
        );
    });

    test('Throw if invalid format COLOR', async () => {
        const badColorValue = [{value: 'AZERTY'}];
        const res = action(badColorValue, {}, {attribute: attrColor}) as IActionsListFunctionResult;
        expect(res.errors.length).toBe(1);
    });

    test('Throw if invalid format COLOR, to be less or equal to 6 characters ', async () => {
        const badColorValue = [{value: 'FFFFFFFFFFFFFFFFFFF'}];
        const res = action(badColorValue, {}, {attribute: attrColor}) as IActionsListFunctionResult;
        expect(res.errors.length).toBe(1);
    });

    test('validateFormat RICH TEXT', async () => {
        const RichTextValue = [{value: '<p>salut</p>'}];
        expect((action(RichTextValue, {}, {attribute: attrText}) as IActionsListFunctionResult).values[0]).toBe(
            RichTextValue[0]
        );
    });

    test('validateFormat RICH TEXT', async () => {
        const RichTextValue = [{value: false}];
        const res = action(RichTextValue, {}, {attribute: attrText}) as IActionsListFunctionResult;
        expect(res.errors.length).toBe(1);
    });
});
