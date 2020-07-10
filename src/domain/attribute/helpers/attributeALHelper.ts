import {IUtils} from 'utils/utils';
import {ActionsListEvents, ActionsListIOTypes, IActionsListConfig} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute, IOAllowedTypes} from '../../../_types/attribute';

export const getDefaultActionsList = (attribute: IAttribute): IActionsListConfig => {
    if (attribute.type !== AttributeTypes.SIMPLE && attribute.type !== AttributeTypes.ADVANCED) {
        return {};
    }

    let defaultActions = {};
    switch (attribute.format) {
        case AttributeFormats.DATE:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'toNumber',
                        name: 'To Number',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        id: 'formatDate',
                        name: 'Format Date',
                        is_system: false
                    }
                ]
            };
            break;
        case AttributeFormats.BOOLEAN:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'toBoolean',
                        name: 'To Boolean',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ]
            };
            break;
        case AttributeFormats.ENCRYPTED:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    },
                    {
                        id: 'encrypt',
                        name: 'Encrypt',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        id: 'toBoolean',
                        name: 'To Boolean',
                        is_system: true
                    }
                ]
            };
            break;
        case AttributeFormats.EXTENDED:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'parseJSON',
                        name: 'Parse JSON',
                        is_system: true
                    },
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [
                    {
                        id: 'toJSON',
                        name: 'To JSON',
                        is_system: true
                    }
                ]
            };
            break;
        default:
            defaultActions = {
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'validateFormat',
                        name: 'Validate Format',
                        is_system: true
                    }
                ]
            };
            break;
    }

    return {
        [ActionsListEvents.GET_VALUE]: [],
        [ActionsListEvents.SAVE_VALUE]: [],
        [ActionsListEvents.DELETE_VALUE]: [],
        ...defaultActions
    };
};

export const getAllowedInputTypes = (attribute: IAttribute): IOAllowedTypes => {
    let inputTypes;
    switch (attribute.format) {
        case AttributeFormats.NUMERIC:
        case AttributeFormats.DATE:
            inputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            };
            break;
        case AttributeFormats.BOOLEAN:
            inputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            };
            break;
        default:
            inputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            };
            break;
    }

    return inputTypes;
};

export const getAllowedOutputTypes = (attribute: IAttribute): IOAllowedTypes => {
    let outputTypes;
    switch (attribute.format) {
        case AttributeFormats.NUMERIC:
        case AttributeFormats.DATE:
            outputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            };
            break;
        case AttributeFormats.BOOLEAN:
            outputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            };
            break;
        case AttributeFormats.EXTENDED:
            outputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.OBJECT],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.OBJECT]
            };
            break;
        default:
            outputTypes = {
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            };
            break;
    }
    outputTypes[ActionsListEvents.GET_VALUE] = Object.values(ActionsListIOTypes);

    return outputTypes;
};

export const getActionsListToSave = (
    attrDataToSave: IAttribute,
    existingAttrData: IAttribute,
    newAttr: boolean,
    utils: IUtils
): IActionsListConfig => {
    let alToSave = null;
    if (!newAttr) {
        if (attrDataToSave.actions_list) {
            // We need to merge actions list to save with existing actions list to make sure we keep
            // the is_system flag to true on system actions
            const existingAL = existingAttrData.actions_list || {
                [ActionsListEvents.SAVE_VALUE]: [],
                [ActionsListEvents.GET_VALUE]: [],
                [ActionsListEvents.DELETE_VALUE]: []
            };

            alToSave = Object.values(ActionsListEvents).reduce((allALs, evName): IActionsListConfig => {
                // Merge each action with existing system action. If there's no matching system action, we force
                // the flag to false
                allALs[evName] = attrDataToSave.actions_list[evName]
                    ? attrDataToSave.actions_list[evName].map(actionToSave => {
                          const sysActionIndex = existingAL[evName].findIndex(
                              al => al.name === actionToSave.name && al.is_system
                          );
                          return {
                              ...{is_system: false},
                              ...existingAL[evName][sysActionIndex],
                              ...actionToSave
                          };
                      })
                    : [];

                return allALs;
            }, {});
        }
    } else {
        alToSave = utils.mergeConcat(getDefaultActionsList(attrDataToSave), attrDataToSave.actions_list);
    }

    return alToSave;
};
