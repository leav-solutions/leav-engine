import {cloneDeep} from 'lodash';
import {GET_ACTIONS_LIST_QUERY_attributes_list_actions_list} from '../../../../_gqlTypes/GET_ACTIONS_LIST_QUERY';
import {IAction, IActionConfig, IReserveAction} from '../interfaces/interfaces';
import {getColorsRangeFrom} from '../utils/getColorRange';

//////////////////// FUNCTIONS TO INITIATE THE STATE

export enum actionListNames {
    saveValue = 'saveValue',
    getValue = 'getValue',
    deleteValue = 'deleteValue'
}

export const getCurrentList = (
    sourceConfigs: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list,
    availableActions: IReserveAction[] | null
) => {
    const currentList: any = {saveValue: {higherId: 0}, getValue: {higherId: 0}, deleteValue: {higherId: 0}};

    if (sourceConfigs && Object.keys(sourceConfigs).length > 0) {
        Object.keys(actionListNames).forEach(actionListName => {
            const sourceConfig = sourceConfigs[actionListName];
            const config = {higherId: 0};
            if (availableActions) {
                if (sourceConfig && sourceConfig.length) {
                    sourceConfig.forEach((configAct, i) => {
                        const action = getActionFromConfig(configAct, availableActions, i);
                        config[action.id] = action;
                        config.higherId = i;
                    });
                }
            }
            currentList[actionListName] = config;
        });
    }
    return currentList;
};

export const getActionFromConfig = (configAct: IActionConfig, availableActions: IReserveAction[], id: number) => {
    const action: IAction = cloneDeep(availableActions.filter(act => act.name === configAct.name)[0]);
    action.id = id;
    action.isSystem = configAct.is_system;

    if (action.params && action.params.length) {
        action.params.forEach(param => {
            if (param) {
                if (configAct.params && configAct.params.length) {
                    const [configParam] = configAct.params.filter(
                        (uniqueConfigParam: any) => param.name === uniqueConfigParam.name
                    );

                    if (configParam) {
                        param.value = configParam.value;
                    }
                }
            }
        });
    }
    return action;
};

export const getCurrentListOrder = (currentConfig: GET_ACTIONS_LIST_QUERY_attributes_list_actions_list) => {
    const currentListOrder = {saveValue: [], getValue: [], deleteValue: []};
    Object.keys(actionListNames).forEach(actionListName => {
        const returnArr: number[] = [];
        if (currentConfig[actionListName] && currentConfig[actionListName].length) {
            currentConfig[actionListName].forEach((act, i) => {
                returnArr.push(i);
            });
        }
        currentListOrder[actionListName] = returnArr;
    });
    return currentListOrder;
};

export const getColorDictionnary = (availableActions: IReserveAction[] | null) => {
    const types = new Set<string>();
    if (availableActions) {
        availableActions.forEach((act: IReserveAction) => {
            act.input_types.forEach(t => types.add(t));
            act.output_types.forEach(t => types.add(t));
        });
    }
    const colors = getColorsRangeFrom(types.size);
    const typesArr = Array.from(types);
    return typesArr.reduce((obj, currentValue, currentIndex) => {
        obj[currentValue] = colors[currentIndex];
        return obj;
    }, {});
};
