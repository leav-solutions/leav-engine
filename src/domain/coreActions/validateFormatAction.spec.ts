import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateFormatAction from './validateFormatAction';
import {IActionsListDomain} from '../actionsListDomain';

describe('validateFormatAction', () => {
    const mockActionListDomain: Mockify<IActionsListDomain> = {
        handleJoiError: jest.fn().mockRejectedValue({
            test_attr: 'error'
        })
    };

    const action = validateFormatAction(mockActionListDomain as IActionsListDomain).action;

    const mockAttr = {id: 'test_attr', type: AttributeTypes.SIMPLE};
    const attrText = {...mockAttr, format: AttributeFormats.TEXT};
    const attrNumeric = {...mockAttr, format: AttributeFormats.NUMERIC};
    const attrDate = {...mockAttr, format: AttributeFormats.DATE};
    const attrBoolean = {...mockAttr, format: AttributeFormats.BOOLEAN};
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
    const ctx = {attribute: attrText};
    test('validateFormat', async () => {
        // Extended
        const extValue = {street: 'test', city: {zipcode: 38000, name: 'Grenoble'}};
        const badExtValue = {street: 'test', city: {zipcode: 'aaa', name: 'Grenoble'}};
        expect(action(extValue, {}, {attribute: attrExt})).toMatchObject(extValue);
        expect(() => action(badExtValue, {}, {attribute: attrExt})).toThrow(ValidationError);
    });
});
