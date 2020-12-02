// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import validateRegexAction from './validateRegexAction';

describe('validateRegexAction', () => {
    const mockActionListDomain: Mockify<IActionsListDomain> = {
        handleJoiError: jest.fn().mockReturnValue({
            test_attr: 'error'
        })
    };

    const action = validateRegexAction({'core.domain.actionsList': mockActionListDomain as IActionsListDomain}).action;
    const attrText = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('validateRegex', async () => {
        expect(action('test', {regex: '^test$'}, ctx)).toBe('test');
        expect(() => action('test', {regex: '^toto$'}, ctx)).toThrow(ValidationError);
    });
});
