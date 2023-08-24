// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AwilixContainer} from 'awilix';
import Joi from 'joi';
import {partialRight} from 'lodash';
import {IUtils} from '../../utils/utils';
import {IActionsListFunction, IActionsListParams, IActionsListSavedAction} from '../../_types/actionsList';
import {IAttribute} from '../../_types/attribute';
import {ErrorFieldDetail, Errors} from '../../_types/errors';
import {IRecord} from '../../_types/record';
import {IValue} from '../../_types/value';

export interface IActionsListDomain {
    /**
     * Retrieve all available functions to define actions lists
     * To be available, a function must be defined in a module with name ending by "Action", and export an object
     * of type IActionsListFunction
     */
    getAvailableActions(): IActionsListFunction[];

    /**
     * Allow to recorn a new action to the list of actions available
     *
     * @param actions
     */
    registerActions(actions: IActionsListFunction[]): void;

    /**
     * Format an error sent by Joi to match our ValidationError
     *
     * @param attribute
     * @param error
     */
    handleJoiError(
        attribute: IAttribute,
        error: Joi.ValidationError,
        customMessage?: string
    ): ErrorFieldDetail<IRecord>;

    /**
     * Execute a list of actions.
     * They're run in the order defined in the actions array.
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
    let _pluginActions = [];
    return {
        getAvailableActions(): IActionsListFunction[] {
            const actions = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(/^core\.domain\.actions\./))
                .map(modName => depsManager.cradle[modName]);

            return [...actions, ..._pluginActions];
        },
        handleJoiError(
            attribute: IAttribute,
            error: Joi.ValidationError,
            customMessage?: string
        ): ErrorFieldDetail<IRecord> {
            return {
                [attribute.id]: {
                    msg: Errors.FORMAT_ERROR,
                    vars: customMessage
                        ? {details: customMessage}
                        : {details: error.details.map(er => er.message).join('\n')}
                }
            };
        },
        registerActions(actions: IActionsListFunction[]): void {
            _pluginActions = [..._pluginActions, ...actions];
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

                //Add custom error message if it has been define
                params.customMessage = action.error_message ? action.error_message[ctx.lang] : '';

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
