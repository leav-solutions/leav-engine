// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AwilixContainer} from 'awilix';
import Joi from 'joi';
import isEmpty from 'lodash/isEmpty';
import {IActionsListFunction, IActionsListParams, IActionsListSavedAction} from '../../_types/actionsList';
import {IAttribute} from '../../_types/attribute';
import {ErrorFieldDetail, Errors} from '../../_types/errors';
import {IRecord} from '../../_types/record';
import {IValue} from '../../_types/value';
import ValidationError from '../../errors/ValidationError';
import i18next, {i18n} from 'i18next';

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
    handleJoiError(attribute: IAttribute, error: Joi.ValidationError): ErrorFieldDetail<IRecord>;

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
    translator?: i18n;
}

export default function ({'core.depsManager': depsManager = null, translator = null}: IDeps = {}): IActionsListDomain {
    let _pluginActions = [];
    return {
        getAvailableActions(): IActionsListFunction[] {
            const actions = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(/^core\.domain\.actions\./))
                .map(modName => depsManager.cradle[modName]);
            return [...actions, ..._pluginActions];
        },
        handleJoiError(attribute: IAttribute, error: Joi.ValidationError): ErrorFieldDetail<IRecord> {
            return {
                [attribute.id]: {
                    msg: Errors.FORMAT_ERROR,
                    vars: {details: error.details.map(er => er.message).join('\n')}
                }
            };
        },
        registerActions(actions: IActionsListFunction[]): void {
            _pluginActions = [..._pluginActions, ...actions];
        },
        async runActionsList(actions: IActionsListSavedAction[], value: IValue, ctx: any): Promise<IValue> {
            const availActions: IActionsListFunction[] = this.getAvailableActions();

            let resultAction = value.value;
            for (const action of actions) {
                const params: IActionsListParams = !!action.params
                    ? action.params.reduce((all, p) => {
                          all[p.name] = p.value;
                          return all;
                      }, {})
                    : {};
                const actionFunc = availActions.find(a => {
                    const availableActionId = a.id ? a.id : a.name;
                    const actionId = action.id ? action.id : action.name;
                    return availableActionId === actionId;
                }).action;
                try {
                    // run each actions separately to catch the context of the error.
                    resultAction = await actionFunc(resultAction, params, ctx);
                } catch (error) {
                    //check if there is a custom message added by a user
                    const customMessage =
                        action.error_message && action.error_message[ctx.lang] ? action.error_message[ctx.lang] : '';

                    //check if there is a message system or a joy error message
                    const systemMessage = error.fields[ctx.attribute.id]?.vars?.details
                        ? error.fields[ctx.attribute.id].vars.details
                        : translator.t(('errors.' + error.fields[ctx.attribute.id]) as string, {
                              lng: ctx.lang
                          });
                    //throw the validation error with a custom message
                    throw new ValidationError(
                        {[ctx.attribute.id]: ''},
                        !isEmpty(customMessage) ? customMessage : systemMessage
                    );
                }
            }
            return {...value, value: resultAction};
        }
    };
}
