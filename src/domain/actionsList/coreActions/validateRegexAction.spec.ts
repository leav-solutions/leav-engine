import ValidationError from '../../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {IActionsListDomain} from '../actionsListDomain';
import validateRegexAction from './validateRegexAction';

describe('validateRegexAction', () => {
    const mockActionListDomain: Mockify<IActionsListDomain> = {
        handleJoiError: jest.fn().mockReturnValue({
            test_attr: 'error'
        })
    };

    const action = validateRegexAction(mockActionListDomain as IActionsListDomain).action;
    const attrText = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('validateRegex', async () => {
        expect(action('test', {regex: '^test$'}, ctx)).toBe('test');
        expect(() => action('test', {regex: '^toto$'}, ctx)).toThrow(ValidationError);
    });
});
