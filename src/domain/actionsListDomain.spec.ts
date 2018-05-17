import actionListDomain from './actionsListDomain';
import ValidationError from '../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../_types/attribute';
import * as Joi from 'joi';

describe('handleJoiError', () => {
    test('handleJoiError', async () => {
        const domain = actionListDomain();
        const mockError = {
            details: [
                {
                    message: 'boom'
                }
            ]
        };

        const res = domain.handleJoiError({id: 'test', type: AttributeTypes.SIMPLE}, mockError as Joi.ValidationError);
        expect(res).toMatchObject({test: 'boom'});
    });
});
