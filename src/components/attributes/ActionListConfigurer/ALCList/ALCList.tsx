import React, {useEffect, useState, useCallback} from 'react';
import {useDrop} from 'react-dnd-cjs';
import ALCCard from '../ALCCard';
import ItemTypes from '../ItemTypes';
import {doArrayIntersect} from '../utils/doArrayIntersect';
import Connector from '../ALCConnectors';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import ALCListSelector from '../ALCListSelector';

import {Button, Header} from 'semantic-ui-react';

import {IColorDic, IParamInput, IDragObject, IAllActionLists} from '../interfaces/interfaces';
import { ALCPlaceholder, ListContainer, ListContent, HiddenDiv} from '../stylesComps';

//////////////////// INTERFACES

interface IALCListProps extends WithNamespaces {
    actions: IAllActionLists;
    moveCard: (id: string, isOver: boolean, to: number) => void;
    findCard: (id: string) => number;
    addActionToList: (actionName: string, atIndex?: number) => void;
    removeActionFromList: (id: string) => void;
    getNewId: () => number;
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    inType: Array<string | null>;
    outType: Array<string | null>;
    colorTypeDictionnary: IColorDic;
    onSelectorChange: (event: any) => void;
    currentActionListName: string;
    changeParam?: (input: IParamInput) => void;
    cardOrder: number[];
    onSave: () => void;
}

//////////////////// COMPONENT

function ALCList({
    actions,
    moveCard,
    findCard,
    addActionToList,
    removeActionFromList,
    getNewId,
    currentIndex,
    setCurrentIndex,
    inType,
    outType,
    colorTypeDictionnary,
    changeParam,
    cardOrder,
    onSelectorChange,
    currentActionListName,
    onSave,
    t
}: IALCListProps) {

    const specificCardOrder = cardOrder;
    const cards = actions[currentActionListName];

    const [connectionFailures, setConnectionFailures] = useState<any[]>([]);

    //////////////////// DRAG AND DROP

    const [collectedProps, drop] = useDrop({
        accept: ItemTypes.ACTION,
        canDrop: () => {
            return true;
        },
        drop: (dragObject: IDragObject) => {
            if (dragObject.origin === 'ALCReserve') {
                if (currentIndex >= 0) {
                    addActionToList(dragObject.action.name, currentIndex);
                } else {
                    addActionToList(dragObject.action.name);
                }
                setCurrentIndex(-1);
            }
        },
        hover: item => {
            if (item.origin === 'ALCReserve' && !item.id) {
                const higherId = getNewId();
                item.id = `${higherId}`;
            }
        },
        collect: monitor => {
            return {
                hovered: monitor.isOver(),
                canDrop: !!monitor.canDrop()
            };
        }
    });

    /////// DRAG / DROP FOR THE HIDDEN DIV

    const [, dropOut] = useDrop({
        accept: ItemTypes.ACTION,
        canDrop() {
            return false;
        },
        hover(item, monitor) {
            setCurrentIndex(-1);
            return;
        }
    });

    //////////////////// TYPES COMPATIBILITY FUNCTIONS

    const checkConnections = useCallback(() => {
        const connFailures: any[] = [];
        const actionListNames = Object.keys(actions);
        actionListNames.forEach(listName => {
            const actionIdList = cardOrder[listName];
            const list = actions[listName];
            if (actionIdList && actionIdList.length) {
                for (let i = 0; i < actionIdList.length; i++) {
                    const actionId = actionIdList[i];
                    const action = list[actionId];
                    const preceedingConnector = i === 0 ? inType : list[actionIdList[i - 1]].output_types;
                    const followingConnector =
                        i >= actionIdList.length - 1 ? outType : list[actionIdList[i + 1]].input_types;
                    const topConnection = doArrayIntersect(preceedingConnector, action.input_types);
                    const bottomConnection =
                        listName === 'saveValue' ? doArrayIntersect(followingConnector, action.output_types) : true;
                    if (!topConnection || !bottomConnection) {
                        connFailures.push({list: listName, id: actionId});
                    }
                }
            }
            setConnectionFailures(connFailures);
        });
    }, [actions, cardOrder, inType, outType]);

    //////////////////// SETTING THE COMPONENT

    useEffect(() => {
        checkConnections();
        if (!collectedProps.hovered) {
            setCurrentIndex(-1);
        }
    }, [collectedProps.hovered, setCurrentIndex, cardOrder, checkConnections]);

    /////////////// EXPORT

    const changeSelectorTo = listName => {
        onSelectorChange(listName);
    };

    const setConfig = e => {
        onSave();
        e.preventDefault();
        return true;
    };

    //////////////////// RENDER

    const renderAction = (actionId: number, i: number) => {
        const action = cards[actionId];
        if (action) {
            return (
                <ALCCard
                    key={actionId}
                    index={i}
                    id={`${action.id}`}
                    action={action}
                    moveCard={moveCard}
                    findCard={findCard}
                    origin="ALCList"
                    addActionToList={addActionToList}
                    removeActionFromList={removeActionFromList}
                    marginTop={currentIndex === i ? '100px' : '0'}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    colorTypeDictionnary={colorTypeDictionnary}
                    changeParam={changeParam}
                />
            );
        } else {
            return <ALCPlaceholder key="placeholder">Slide Actions Here</ALCPlaceholder>
        }
    };

    return (
        <ListContainer ref={drop}>
            <Header as="h4">{t('attributes.action_list')}</Header>
            <ALCListSelector
                changeSelectorTo={changeSelectorTo}
                currentActionListName={currentActionListName}
                connectionFailures={connectionFailures}
            />
            <ListContent>
                <div style={{width: '100%', padding: '0 1px'}}>
                    <Connector inputs={inType} dictionnary={colorTypeDictionnary} />
                </div>
                {specificCardOrder && specificCardOrder.length ? (
                    specificCardOrder.map((actionId, i) => renderAction(actionId, i))
                ) : (
                    <ALCPlaceholder >Slide Actions Here</ALCPlaceholder>
                )}
                <HiddenDiv ref={dropOut} extend={currentIndex === -1} hover={collectedProps.hovered} />
                {currentActionListName === 'saveValue' && (
                    <div style={{width: '100%', padding: '0 1px'}}>
                        <Connector inputs={outType} dictionnary={colorTypeDictionnary} />
                    </div>
                )}
            </ListContent>
            <div style={{textAlign: 'right'}}>
                <Button
                    style={{marginTop: '8px'}}
                    color={connectionFailures && connectionFailures.length > 0 ? 'red' : 'blue'}
                    disabled={connectionFailures && connectionFailures.length > 0 ? true : false}
                    className="ui button"
                    onClick={setConfig}
                >
                    {connectionFailures && connectionFailures.length > 0
                        ? "There's a connection problem"
                        : 'Save Config'}
                </Button>
            </div>
        </ListContainer>
    );
}

export default withNamespaces()(ALCList);
