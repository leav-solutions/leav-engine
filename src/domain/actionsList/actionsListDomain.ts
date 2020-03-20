import * as Joi from '@hapi/joi';
import {AwilixContainer} from 'awilix';
import {partialRight} from 'lodash';
import {IUtils} from '../../utils/utils';
import {IActionsListFunction, IActionsListParams, IActionsListSavedAction} from '../../_types/actionsList';
import {IAttribute} from '../../_types/attribute';
import {ErrorFieldDetail} from '../../_types/errors';
import {IRecord} from '../../_types/record';
import {IValue} from '../../_types/value';

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
    handleJoiError(attribute: IAttribute, error: Joi.ValidationError): ErrorFieldDetail<IRecord>;

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

interface IDeps {
    'core.depsManager'?: AwilixContainer;
    'core.utils'?: IUtils;
}

export default function({
    'core.depsManager': depsManager = null,
    'core.utils': utils = null
}: IDeps = {}): IActionsListDomain {
    return {
        getAvailableActions(): IActionsListFunction[] {
            const actions = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(/^core\.domain\.actions\./))
                .map(modName => depsManager.cradle[modName]);

            return actions;
        },
        handleJoiError(attribute: IAttribute, error: Joi.ValidationError): ErrorFieldDetail<IRecord> {
            return {[attribute.id]: error.details.map(er => er.message).join('\n')};
        },
        async runActionsList(actions: IActionsListSavedAction[], value: IValue, ctx: any): Promise<IValue> {
            const availActions: IActionsListFunction[] = this.getAvailableActions();

            // Retrieve actual function to execute from saved actions list
            // For each function, we apply params and ctx parameters.
            const actionsToExec = actions.map(action => {
                const actionFunc = availActions.find(a => {
                    const availableActionId = a.id ? a.id : a.name;
                    const actionId = action.id ? action.id : action.name;
                    return availableActionId === actionId;
                }).action;

                // Convert params from an array of object with name and value properties
                // to an object {name: value}
                const params: IActionsListParams = !!action.params
                    ? action.params.reduce((all, p) => {
                          all[p.name] = p.value;
                          return all;
                      }, {})
                    : {};

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
