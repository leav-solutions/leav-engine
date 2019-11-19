import React, {useState, useEffect} from 'react';
import BinDragLayer from '../DragDrop/BinDragLayer';
import {DndProvider} from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import ALCList from '../ALCList';
import ALCReserve from '../ALCReserve';
import {useQuery, useMutation} from '@apollo/react-hooks';
import Loading from '../../../shared/Loading';
import {cloneDeep} from 'lodash';

import {getActionListQuery} from '../../../../queries/attributes/getActionListQuery';
import {saveAttributeActionsListMutation} from '../../../../queries/attributes/saveAttributeActionsListMutation';
import {GET_ACTIONS_LIST_QUERY} from '../../../../_gqlTypes/GET_ACTIONS_LIST_QUERY';

import {actionListNames, getCurrentList, getCurrentListOrder, getColorDictionnary} from '../utils/actionsManipulations';
import {ExternalContainer, ReserveContainer, ListsContainer} from '../stylesComps';

import {
    IAction,
    IActionConfig,
    IParamConfig,
    IReserveAction,
    ICurrActionListOrder,
    IParam,
    IColorDic,
    IParamInput,
    IAllActionLists
} from '../interfaces/interfaces';

//////////////////// INTERFACES

interface IALCContainerProps extends WithNamespaces {
    availableActions: IReserveAction[] | null;
    attribute: any;
    inType: Array<string | null>;
    outType: Array<string | null>;
}

//////////////////// COMPONENT

function ALCContainer({availableActions = [], attribute, inType, outType, i18n, t}: IALCContainerProps): JSX.Element {
    // {saveValue: {higherId: 0}, getValue: {higherId: 0}, deleteValue: {higherId: 0}}
    const [currentActionListName, setCurrentActionListName] = useState('saveValue');

    const [currentActionList, setCurrentList] = useState<IAllActionLists>({
        saveValue: {higherId: 0},
        getValue: {higherId: 0},
        deleteValue: {higherId: 0}
    });
    const [currentActionListOrder, setcurrentActionListOrder] = useState<ICurrActionListOrder>({
        saveValue: [],
        getValue: [],
        deleteValue: []
    });
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [colorTypeDictionnary, setColorTypeDictionnary] = useState<IColorDic>({});
    const {loading, data} = useQuery<GET_ACTIONS_LIST_QUERY>(getActionListQuery, {
        variables: {attId: attribute ? attribute.id : undefined}
    });

    const [saveAttributeActionsList, {loading: loadingSave, error: errorSave}] = useMutation(
        saveAttributeActionsListMutation
    );

    useEffect(() => {
        const currentConfig =
            data && data.attributes && data.attributes.list[0] && data.attributes.list[0].actions_list
                ? data.attributes.list[0].actions_list
                : {[actionListNames.saveValue]: [], [actionListNames.getValue]: [], [actionListNames.deleteValue]: []};
        setCurrentList(getCurrentList(currentConfig, availableActions));
        setcurrentActionListOrder(getCurrentListOrder(currentConfig));
        setColorTypeDictionnary(getColorDictionnary(availableActions));
    }, [data, availableActions]);

    //////////////////// INDEX AND OBJECT MANIPULATIONS

    const getNewId = () => {
        return currentActionList ? currentActionList[currentActionListName].higherId + 1 : 0;
    };

    const getActionFromName = (name: string, id: number = currentActionList[currentActionListName].higherId + 1) => {
        if (!availableActions) {
            return {id: -1};
        } else {
            const act: IAction = cloneDeep(availableActions.filter(action => action.name === name)[0]);
            act.id = id;
            act.isSystem = false;
            return act;
        }
    };

    //////////////////// CARDS (ACTIONS) MANIPULATION

    const moveCard = (id: string, isOver: boolean, atIndex: number) => {
        if (isOver) {
            return;
        }
        let index = -1;
        let cardOrderCopy: ICurrActionListOrder;
        if (currentActionListOrder) {
            cardOrderCopy = {...currentActionListOrder};
            index = currentActionListOrder[currentActionListName].indexOf(Number(id));
            cardOrderCopy[currentActionListName][index] = currentActionListOrder[currentActionListName][atIndex];
            cardOrderCopy[currentActionListName][atIndex] = Number(id);
            setcurrentActionListOrder(cardOrderCopy);
        }
    };

    const findCard = (id: string) => {
        if (currentActionListOrder) {
            return currentActionListOrder[currentActionListName].indexOf(Number(id));
        }
        return -1;
    };

    const addActionToList = (actionName: string, atIndex?: number) => {
        const action = getActionFromName(actionName);

        const currentActionListCopy = cloneDeep(currentActionList);

        currentActionListCopy[currentActionListName].higherId = action.id;
        currentActionListCopy[currentActionListName][action.id] = action;
        const index = atIndex === undefined || atIndex === -1 ? action.id : atIndex;
        setCurrentList(currentActionListCopy);

        if (currentActionListOrder) {
            const currentActionListOrderCopy = {...currentActionListOrder};
            currentActionListOrderCopy[currentActionListName].splice(index, 0, action.id);
            setcurrentActionListOrder(currentActionListOrderCopy);
        }
    };

    const removeActionFromList = (id: string) => {
        const currentActionListCopy = cloneDeep(currentActionList);
        delete currentActionListCopy[currentActionListName][id];

        const currentActionListOrderCopy = {...currentActionListOrder};

        let listOrderCopy: number[] = [];
        if (currentActionListOrder) {
            listOrderCopy = currentActionListOrder[currentActionListName].filter(
                actionId => Number(actionId) !== Number(id)
            );
            currentActionListOrderCopy[currentActionListName] = listOrderCopy;
        }

        setCurrentList(currentActionListCopy);
        setcurrentActionListOrder(currentActionListOrderCopy);
    };

    const changeParam = ({actionId, paramName, value}: IParamInput) => {
        if (currentActionList && currentActionListName) {
            const act = currentActionList[currentActionListName][actionId];
            if (act && act.params) {
                const actParam = act.params.filter((param: IParam | null) => param && param.name === paramName);
                if (actParam[0]) {
                    actParam[0].value = value;
                }
            }
        }
    };

    // const canDropItem = (dragObj) => {
    //     return false;
    // };

    /////////////// SAVE CONFIG FUNCTIONS

    const extractParamConfig = (param: IParam): IParamConfig => {
        return {
            name: param.name,
            value: param.value ? param.value : param.default_value
        };
    };

    const getConfigActionFromAction = act => {
        const params = act.params && act.params.length ? act.params.map(param => extractParamConfig(param)) : null;
        return {
            name: act.name,
            params
        };
    };

    const onSave = () => {
        const exportableConfig = {saveValue: [], getValue: [], deleteValue: []};

        const actionListsNames = Object.keys(currentActionList);

        actionListsNames.forEach(actionListName => {
            const actions: IActionConfig[] = [];
            currentActionListOrder[actionListName].forEach(actId => {
                const action = getConfigActionFromAction(currentActionList[actionListName][actId]);
                actions.push(action);
            });
            exportableConfig[actionListName] = actions;
        });

        if (exportableConfig.saveValue || exportableConfig.getValue || exportableConfig.deleteValue) {
            saveAttributeActionsList({
                variables: {
                    att: {
                        id: attribute.id,
                        type: attribute.type,
                        actions_list: {
                            saveValue: exportableConfig.saveValue ? exportableConfig.saveValue : null,
                            getValue: exportableConfig.getValue ? exportableConfig.getValue : null,
                            deleteValue: exportableConfig.deleteValue ? exportableConfig.deleteValue : null
                        }
                    }
                }
            });
        }
    };

    /////////////// ACTION LIST SELECTOR

    const onSelectorChange = listName => {
        setCurrentActionListName(listName);
    };

    //////////////////// DEBUG

    if (errorSave) {
        console.log('errorSave');
    }

    //////////////////// RENDER

    return (
        <DndProvider backend={HTML5Backend as any}>
            <ExternalContainer>
                <BinDragLayer />
                <ReserveContainer>
                    {availableActions && (
                        <ALCReserve
                            actions={availableActions}
                            setCurrentIndex={setCurrentIndex}
                            addActionToList={addActionToList}
                            colorTypeDictionnary={colorTypeDictionnary}
                        />
                    )}
                </ReserveContainer>
                <ListsContainer>
                    {loading || loadingSave ? (
                        <Loading />
                    ) : (
                        <ALCList
                            actions={currentActionList}
                            cardOrder={currentActionListOrder}
                            moveCard={moveCard}
                            findCard={findCard}
                            addActionToList={addActionToList}
                            removeActionFromList={removeActionFromList}
                            getNewId={getNewId}
                            currentIndex={currentIndex}
                            setCurrentIndex={setCurrentIndex}
                            inType={inType}
                            outType={outType}
                            colorTypeDictionnary={colorTypeDictionnary}
                            changeParam={changeParam}
                            onSelectorChange={onSelectorChange}
                            currentActionListName={currentActionListName}
                            onSave={onSave}
                        />
                    )}
                </ListsContainer>
            </ExternalContainer>
        </DndProvider>
    );
}

export default withNamespaces()(ALCContainer);
