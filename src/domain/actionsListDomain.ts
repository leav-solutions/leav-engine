import {AwilixContainer} from 'awilix';
import * as Joi from 'joi';
import {IActionsListFunction} from '../_types/actionsList';
import {IAttribute} from '../_types/attribute';
import {IValidationErrorFieldDetail} from '../errors/ValidationError';

export interface IActionsListDomain {
    getAvailableActions(): IActionsListFunction[];
    handleJoiError(attribute: IAttribute, error: Joi.ValidationError): IValidationErrorFieldDetail;
}

export default function(depsManager: AwilixContainer | null = null): IActionsListDomain {
    return {
        getAvailableActions(): IActionsListFunction[] {
            const actions = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(/Action$/))
                .map(modName => depsManager.cradle[modName]);

            return actions;
        },
        handleJoiError(attribute: IAttribute, error: Joi.ValidationError): IValidationErrorFieldDetail {
            return {[attribute.id]: error.details.map(er => er.message).join('\n')};
        }
    };
}
