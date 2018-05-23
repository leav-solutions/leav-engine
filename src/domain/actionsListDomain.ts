import {AwilixContainer} from 'awilix';
import * as Joi from 'joi';
import {IActionsListFunction, IActionsListSavedAction, IActionsListParams} from '../_types/actionsList';
import {IAttribute} from '../_types/attribute';
import {IValidationErrorFieldDetail} from '../errors/ValidationError';
import {IValue} from '_types/value';
import {IUtils} from 'utils/utils';
import {partialRight} from 'lodash';

export interface IActionsListDomain {
    /**
     * Retrieve all available functions to define actions lists
     * To be available, a function must be define in a module with name ending by "Action", and export an object
     * of type IActionsListFunction
     */
    getAvailableActions(): IActionsListFunction[];

    /**
     * Format an error sent by Joi to match our ValidationError
     *
     * @param attribute
     * @param error
     */
    handleJoiError(attribute: IAttribute, error: Joi.ValidationError): IValidationErrorFieldDetail;

    /**
     * Execute a list of actions.
     * They're ran in the order define in the actions array.
     *
     * @param actions List of actions to execute
     * @param value
     * @param ctx     Context transmitted to the function when executed
     */
    runActionsList(actions: IActionsListSavedAction[], value: IValue, ctx: any): Promise<IValue>;
}

export default function(depsManager: AwilixContainer = null, utils: IUtils = null): IActionsListDomain {
    return {
        getAvailableActions(): IActionsListFunction[] {
            const actions = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(/Action$/))
                .map(modName => depsManager.cradle[modName]);

            return actions;
        },
        handleJoiError(attribute: IAttribute, error: Joi.ValidationError): IValidationErrorFieldDetail {
            return {[attribute.id]: error.details.map(er => er.message).join('\n')};
        },
        async runActionsList(actions: IActionsListSavedAction[], value: IValue, ctx: any): Promise<IValue> {
            const availActions: IActionsListFunction[] = this.getAvailableActions();

            // Retrieve actual function to execute from saved actions list
            // For each function, we apply params and ctx parameters.
            const actionsToExec = actions.map(action => {
                const actionFunc = availActions.find(a => a.name === action.name).action;

                /* tslint:disable:ter-indent */
                // Convert params from an array of object with name and value properties
                // to an object {name: value}
                const params: IActionsListParams =
                    typeof action.params !== 'undefined'
                        ? action.params.reduce((all, p) => {
                              all[p.name] = p.value;
                              return all;
                          }, {})
                        : {};
                /* tslint:enable:ter-indent */

                // Create a new function with params and ctx applied to it
                // This new function only takes value has an argument
                return partialRight(actionFunc, params, ctx);
            });

            // Execute functions
            const pipeRes = actionsToExec.length ? await utils.pipe(...actionsToExec)(value.value) : value.value;

            return {...value, value: pipeRes};
        }
    };
}
