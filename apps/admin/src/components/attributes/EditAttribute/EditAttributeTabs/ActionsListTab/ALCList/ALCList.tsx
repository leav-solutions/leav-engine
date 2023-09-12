// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useCallback, useEffect, useState} from 'react';
import {useDrop} from 'react-dnd';
import {useTranslation} from 'react-i18next';
import {Button, Header} from 'semantic-ui-react';
import ALCCard from '../ALCCard';
import Connector from '../ALCConnectors';
import ALCListSelector from '../ALCListSelector';
import {IAllActionLists, IColorDic, IDragObject, IParamInput} from '../interfaces/interfaces';
import ItemTypes from '../ItemTypes';
import {ALCPlaceholder, HiddenDiv, ListContainer, ListContent} from '../stylesComps';
import {doArrayIntersect} from '../utils/doArrayIntersect';

//////////////////// INTERFACES

interface IALCListProps {
    actions: IAllActionLists;
    moveCard: (id: string, isOver: boolean, to: number) => void;
    findCard: (id: string) => number;
    addActionToList: (actionName: string, atIndex?: number) => void;
    removeActionFromList: (id: string) => void;
    getNewId: () => number;
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    inType: {saveValue: Array<string | null>; getValue: Array<string | null>; deleteValue: Array<string | null>};
    outType: {saveValue: Array<string | null>; getValue: Array<string | null>; deleteValue: Array<string | null>};
    colorTypeDictionnary: IColorDic;
    onSelectorChange: (event: any) => void;
    currentActionListName: string;
    changeParam?: (input: IParamInput) => void;
    cardOrder: any;
    onSave: () => void;
    onChangeCustomMessage?: (actionId: number, value: string, lang: string) => void;
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
    onChangeCustomMessage
}: IALCListProps) {
    const {t} = useTranslation();
    const specificCardOrder = cardOrder[currentActionListName];
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
                    addActionToList(dragObject.action.id, currentIndex);
                } else {
                    addActionToList(dragObject.action.id);
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
                    if (!action) {
                        return;
                    }
                    const preceedingConnector = i === 0 ? inType[listName] : list[actionIdList[i - 1]].output_types;
                    const followingConnector =
                        i >= actionIdList.length - 1 ? outType[listName] : list[actionIdList[i + 1]].input_types;
                    const topConnection = doArrayIntersect(preceedingConnector, action.input_types);
                    const bottomConnection = doArrayIntersect(followingConnector, action.output_types);

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
                    id={`${action.list_id}`}
                    action={action}
                    moveCard={moveCard}
                    findCard={findCard}
                    origin="ALCList"
                    removeActionFromList={removeActionFromList}
                    marginTop={currentIndex === i ? '100px' : '0'}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    colorTypeDictionnary={colorTypeDictionnary}
                    changeParam={changeParam}
                    onChangeCustomMessage={onChangeCustomMessage}
                />
            );
        } else {
            return <ALCPlaceholder key={`placeholder${i}`}>Slide Actions Here</ALCPlaceholder>;
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
                    <Connector inputs={inType[currentActionListName]} dictionnary={colorTypeDictionnary} />
                </div>
                {specificCardOrder && specificCardOrder.length ? (
                    specificCardOrder.map((actionId, i) => renderAction(actionId, i))
                ) : (
                    <ALCPlaceholder>Slide Actions Here</ALCPlaceholder>
                )}
                <HiddenDiv ref={dropOut} extend={currentIndex === -1} hover={collectedProps.hovered} />
                <div style={{width: '100%', padding: '0 1px'}}>
                    <Connector inputs={outType[currentActionListName]} dictionnary={colorTypeDictionnary} />
                </div>
            </ListContent>
            <div style={{textAlign: 'right'}}>
                <Button
                    primary={!connectionFailures?.length}
                    negative={!!connectionFailures?.length}
                    disabled={connectionFailures && connectionFailures.length > 0 ? true : false}
                    style={{marginTop: '8px'}}
                    className="ui button"
                    onClick={setConfig}
                >
                    {connectionFailures && connectionFailures.length > 0
                        ? t('attributes.connection_problem')
                        : t('admin.submit')}
                </Button>
            </div>
        </ListContainer>
    );
}

export default ALCList;
