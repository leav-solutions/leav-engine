// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AwilixContainer} from 'awilix';
import Joi from 'joi';
import isEmpty from 'lodash/isEmpty';
import ValidationError from '../../errors/ValidationError';
import {
    IActionsListFunction,
    IActionsListParams,
    IActionsListSavedAction,
    IRunActionsListCtx
} from '../../_types/actionsList';
import {IAttribute} from '../../_types/attribute';
import {ErrorFieldDetail, Errors} from '../../_types/errors';
import {IRecord} from '../../_types/record';
import {IValue} from '../../_types/value';
import {i18n} from 'i18next';

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
     * @param values Array of values to pass to the actions
     * @param ctx     Context transmitted to the function when executed
     */
    runActionsList(actions: IActionsListSavedAction[], values: IValue[], ctx: IRunActionsListCtx): Promise<IValue[]>;
}

interface IDeps {
    'core.depsManager'?: AwilixContainer;
    translator?: i18n;
}

export default function({'core.depsManager': depsManager = null, translator = null}: IDeps = {}): IActionsListDomain {
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
        async runActionsList(actions, values, ctx) {
            const availActions: IActionsListFunction[] = this.getAvailableActions();
            let resultAction = values;
            for (const action of actions) {
                const params: IActionsListParams = !!action.params
                    ? action.params.reduce((all, p) => {
                          all[p.name] = p.value;
                          return all;
                      }, {})
                    : {};
                const actionFunc = availActions.find(availableAction => availableAction.id === action.id).action;

                // run each actions separately to catch the context of the error.
                const {values: actionFuncValues, errors} = await actionFunc(resultAction, params, ctx);
                resultAction = actionFuncValues;

                if (errors.length > 0) {
                    //check if there is a custom message added by a user (also check the default lng message)
                    let customMessage = !isEmpty(action?.error_message?.[ctx.lang]?.trim())
                        ? action.error_message[ctx.lang]
                        : !isEmpty(action?.error_message?.[ctx.defaultLang]?.trim())
                        ? action.error_message[ctx.defaultLang]
                        : '';
                    if (customMessage) {
                        customMessage += ': ' + errors.map(error => error.attributeValue.value).join(', ');
                        throw new ValidationError({[ctx.attribute.id]: customMessage}, customMessage, true);
                    } else {
                        const errorsByType = errors.reduce<
                            Record<Errors, {attributeValues: IValue[]; message: string}> | {}
                        >((acc, actionError) => {
                            if (!acc[actionError.errorType]) {
                                acc[actionError.errorType] = {attributeValues: [], message: actionError.message};
                            }
                            acc[actionError.errorType].attributeValues.push(actionError.attributeValue);
                            return acc;
                        }, {});

                        const errorMessage = Object.entries(errorsByType).reduce(
                            (message, [errorType, {attributeValues, message: optionalMessage}]) => {
                                const messageText = optionalMessage ?? translator.t(`error.${errorType}`);
                                message.push(
                                    `${messageText}: ${(attributeValues ?? []).map(value => value.value).join(', ')}`
                                );
                                return message;
                            },
                            []
                        );

                        const formattedErrorMessage = errorMessage.join('\n');

                        throw new ValidationError({[ctx.attribute.id]: formattedErrorMessage}, formattedErrorMessage);
                    }
                }
            }
            return resultAction;
        }
    };
}
