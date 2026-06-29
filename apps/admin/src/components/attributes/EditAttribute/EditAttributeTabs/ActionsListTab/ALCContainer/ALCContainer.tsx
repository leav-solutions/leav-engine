import {cloneDeep} from 'lodash';
import {useEffect, useState} from 'react';
import {type GET_ACTIONS_LIST_QUERY_attributes_list_actions_list} from '../../../../../../_gqlTypes/GET_ACTIONS_LIST_QUERY';
import Loading from '../../../../../shared/Loading';
import ALCList from '../ALCList';
import ALCReserve from '../ALCReserve';
import BinDragLayer from '../DragDrop/BinDragLayer';
import {
    type IAction,
    type IActionConfig,
    type IAllActionLists,
    type IColorDic,
    type ICurrActionListOrder,
    type IParam,
    type IParamConfig,
    type IParamInput,
    type IReserveAction,
} from '../interfaces/interfaces';
import {ExternalContainer, ListsContainer, ReserveContainer} from '../stylesComps';
import {ActionListNames, getColorDictionnary, getCurrentList, getCurrentListOrder} from '../utils/actionsManipulations';
import {
    type GetActionsListQueryQuery,
    useGetActionsListQueryQuery,
    useSaveAttributeActionListMutation,
} from '../../../../../../_gqlTypes';

//////////////////// INTERFACES

interface IALCContainerProps {
    availableActions: IReserveAction[] | null;
    attribute: any;
}

interface IAttributeTypes {
    inTypes: GetActionsListQueryQuery['attributes']['list'][0]['input_types'];
    outTypes: GetActionsListQueryQuery['attributes']['list'][0]['output_types'];
}

//////////////////// COMPONENT

function ALCContainer({availableActions = [], attribute}: IALCContainerProps): JSX.Element {
    // {saveValue: {higherId: 0}, getValue: {higherId: 0}, deleteValue: {higherId: 0}}
    const [currentActionListName, setCurrentActionListName] = useState('saveValue');

    const [attributeTypes, setAttributeTypes] = useState<IAttributeTypes>({
        inTypes: {saveValue: [], postSaveValue: [], getValue: [], deleteValue: [], postDeleteValue: []},
        outTypes: {saveValue: [], postSaveValue: [], getValue: [], deleteValue: [], postDeleteValue: []},
    });

    const [currentActionList, setCurrentList] = useState<IAllActionLists>({
        saveValue: {higherId: 0},
        postSaveValue: {higherId: 0},
        getValue: {higherId: 0},
        deleteValue: {higherId: 0},
        postDeleteValue: {higherId: 0},
    });
    const [currentActionListOrder, setcurrentActionListOrder] = useState<ICurrActionListOrder>({
        saveValue: [],
        postSaveValue: [],
        getValue: [],
        deleteValue: [],
        postDeleteValue: [],
    });
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [colorTypeDictionnary, setColorTypeDictionnary] = useState<IColorDic>({});
    const {loading, data} = useGetActionsListQueryQuery({
        variables: {attId: attribute ? attribute.id : undefined},
        // important to avoid a bug (?) where action param value are override !
        // https://aristid.atlassian.net/browse/LEAVC-596
        fetchPolicy: 'no-cache',
    });

    const [saveAttributeActionsList, {loading: loadingSave}] = useSaveAttributeActionListMutation(
        {onError: e => console.error(e.message)}, // TODO: handle error properly
    );

    useEffect(() => {
        const currentConfig =
            data && data.attributes && data.attributes.list[0] && data.attributes.list[0].actions_list
                ? data.attributes.list[0].actions_list
                : {
                      [ActionListNames.SAVE_VALUE]: [],
                      [ActionListNames.POST_SAVE_VALUE]: [],
                      [ActionListNames.GET_VALUE]: [],
                      [ActionListNames.DELETE_VALUE]: [],
                      [ActionListNames.POST_DELETE_VALUE]: [],
                  };
        const attr = data && data.attributes && data.attributes.list[0];

        if (attr) {
            const inTypes = attr.input_types;
            const outTypes = attr.output_types;
            setAttributeTypes({inTypes, outTypes});
        }

        setCurrentList(
            getCurrentList(currentConfig as GET_ACTIONS_LIST_QUERY_attributes_list_actions_list, availableActions),
        );
        setcurrentActionListOrder(
            getCurrentListOrder(currentConfig as GET_ACTIONS_LIST_QUERY_attributes_list_actions_list),
        );
        setColorTypeDictionnary(getColorDictionnary(availableActions));
    }, [data, availableActions]);

    //////////////////// INDEX AND OBJECT MANIPULATIONS

    const getNewId = () => (currentActionList ? currentActionList[currentActionListName].higherId + 1 : 0);

    const getActionFromId = (id: string, listId: number = currentActionList[currentActionListName].higherId + 1) => {
        if (!availableActions) {
            return {list_id: -1};
        } else {
            const act: IAction = {
                ...cloneDeep(availableActions.filter(action => action.id === id)[0]),
                list_id: listId,
                isSystem: false,
            };
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

    const addActionToList = (actionId: string, atIndex?: number) => {
        const action = getActionFromId(actionId);

        const currentActionListCopy = cloneDeep(currentActionList);

        currentActionListCopy[currentActionListName].higherId = action.list_id;
        currentActionListCopy[currentActionListName][action.list_id] = action;
        const index = atIndex === undefined || atIndex === -1 ? action.list_id : atIndex;
        setCurrentList(currentActionListCopy);

        if (currentActionListOrder) {
            const currentActionListOrderCopy = {...currentActionListOrder};
            currentActionListOrderCopy[currentActionListName].splice(index, 0, action.list_id);
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
                actionId => Number(actionId) !== Number(id),
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
    const _handleCustomMessage = (actionId: number, value: string, lang: string) => {
        if (currentActionList && currentActionListName) {
            const currentActionListCopy = cloneDeep(currentActionList);
            const act = currentActionListCopy[currentActionListName][actionId];
            if (act && !act.error_message) {
                act.error_message = {};
            }
            act.error_message[lang] = value;
            setCurrentList(currentActionListCopy);
        }
    };

    /////////////// SAVE CONFIG FUNCTIONS

    const extractParamConfig = (param: IParam): IParamConfig => ({
        name: param.name,
        value: param.value,
    });

    const getConfigActionFromAction = act => {
        const params = act.params && act.params.length ? act.params.map(param => extractParamConfig(param)) : null;
        return {
            id: act.id,
            params,
            error_message: act.error_message,
        };
    };

    const onSave = () => {
        const exportableConfig = {saveValue: [], postSaveValue: [], getValue: [], deleteValue: [], postDeleteValue: []};

        const actionListsNames = Object.keys(currentActionList);

        actionListsNames.forEach(actionListName => {
            const actions: IActionConfig[] = [];
            currentActionListOrder[actionListName].forEach(actId => {
                const action = getConfigActionFromAction(currentActionList[actionListName][actId]);
                actions.push(action);
            });
            exportableConfig[actionListName] = actions;
        });

        if (
            exportableConfig.saveValue ||
            exportableConfig.postSaveValue ||
            exportableConfig.getValue ||
            exportableConfig.deleteValue ||
            exportableConfig.postDeleteValue
        ) {
            saveAttributeActionsList({
                variables: {
                    att: {
                        id: attribute.id,
                        type: attribute.type,
                        actions_list: {
                            saveValue: exportableConfig.saveValue ? exportableConfig.saveValue : null,
                            postSaveValue: exportableConfig.postSaveValue ? exportableConfig.postSaveValue : null,
                            getValue: exportableConfig.getValue ? exportableConfig.getValue : null,
                            deleteValue: exportableConfig.deleteValue ? exportableConfig.deleteValue : null,
                            postDeleteValue: exportableConfig.postDeleteValue ? exportableConfig.postDeleteValue : null,
                        },
                    },
                },
            });
        }
    };

    /////////////// ACTION LIST SELECTOR

    const onSelectorChange = listName => {
        setCurrentActionListName(listName);
    };

    //////////////////// RENDER

    return (
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
                        inType={attributeTypes.inTypes}
                        outType={attributeTypes.outTypes}
                        colorTypeDictionnary={colorTypeDictionnary}
                        changeParam={changeParam}
                        onSelectorChange={onSelectorChange}
                        currentActionListName={currentActionListName}
                        onSave={onSave}
                        onChangeCustomMessage={_handleCustomMessage}
                    />
                )}
            </ListsContainer>
        </ExternalContainer>
    );
}

export default ALCContainer;
