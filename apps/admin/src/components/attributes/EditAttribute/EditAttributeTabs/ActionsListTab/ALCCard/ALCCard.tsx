// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useRef, useState} from 'react';
import {useDrag, useDrop} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {useTranslation} from 'react-i18next';
import {Button, Card, Icon} from 'semantic-ui-react';
import Connector from '../ALCConnectors';
import {IAction, IColorDic, IParamInput} from '../interfaces/interfaces';
import itemTypes from '../ItemTypes';
import {ActionRow} from '../stylesComps';
import Param from './ActionContent/Param';
import useLang from 'hooks/useLang';
import CustomMessage from './ActionContent/CustomMessage/CustomMessage';

//////////////////// INTERFACES

export interface ICardProps {
    id: string;
    action: IAction;
    moveCard?: (id: string, isOver: boolean, to: number) => void;
    findCard?: (id: string) => number | undefined;
    origin: string;
    removeActionFromList?: (id: string) => void;
    marginTop?: string;
    currentIndex?: number;
    setCurrentIndex?: (idx: number) => void;
    getConnectorStatus?: (indx: number, action: {}) => boolean | undefined;
    colorTypeDictionnary: IColorDic;
    changeParam?: (input: IParamInput) => void;
    changeCustomMessage?: (actionId: number, value: string, lang: string) => void;
    index?: number;
    dragging?: boolean;
}

//////////////////// COMPONENT

function ALCCard({
    id,
    action,
    moveCard,
    findCard,
    origin,
    removeActionFromList,
    marginTop,
    setCurrentIndex,
    colorTypeDictionnary,
    changeParam,
    index,
    dragging,
    changeCustomMessage
}: ICardProps) {
    const {t} = useTranslation();
    const container = useRef(null);
    const {availableLangs} = useLang();

    const [internalWidth, setWidth] = useState(null);
    const [paramOpen, toggleParams] = useState(false);
    const [paramMessageOpen, toggleParamsMessage] = useState(false);
    const [blockedCard, setBlockCard] = useState(false);

    //////////////////// DRAG AND DROP

    const [{isDragging}, drag, preview] = useDrag({
        item: {
            type: itemTypes.ACTION,
            id,
            originalIndex: findCard && findCard(id),
            origin,
            action,
            colorTypeDictionnary,
            width: internalWidth
        },
        end(item: any, monitor) {
            if (setCurrentIndex) {
                setCurrentIndex(-1);
            }
            if (!monitor.didDrop()) {
                if (removeActionFromList && !item.action.isSystem) {
                    removeActionFromList(id);
                }
            }
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        }),
        canDrag: monitor => {
            return !blockedCard;
        }
    });

    const [{isOver}, drop] = useDrop({
        accept: itemTypes.ACTION,
        canDrop: () => false,
        hover(item, monitor) {
            monitor.isOver({shallow: true});
            if (findCard && moveCard) {
                const overIndex = findCard(id);
                const itemCopy = JSON.parse(JSON.stringify(item));
                if (itemCopy.origin === 'ALCReserve') {
                    if (origin === 'ALCList') {
                        if (setCurrentIndex) {
                            setCurrentIndex(Number(overIndex));
                        }
                    }
                    return;
                }
                if (overIndex !== undefined) {
                    moveCard(itemCopy.id, isOver, overIndex);
                }
            }
        },
        collect: monitor => ({
            isOver: monitor.isOver()
        })
    });

    //////////////////// COMPONENT FUNCTIONS

    const onRemoveButtonClicked = () => {
        tryAndRemove(action.list_id);
    };

    const handleToggleParams = () => {
        toggleParams(!paramOpen);
    };

    const handleToggleParamsMessage = () => {
        toggleParamsMessage(!paramMessageOpen);
    };

    const tryAndRemove = (actId: number) => {
        if (removeActionFromList) {
            removeActionFromList(String(actId));
        }
    };

    //////////////////// SETTING THE COMPONENT

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: false});
        // @ts-ignore
        setWidth(container && container.current && container.current.offsetWidth);
    }, [preview]);

    //////////////////// COMPONENT CONSTANTS (CALCULATED)

    const opacity = isDragging ? 0 : 1;
    const inputs = action.input_types;
    const outputs = action.output_types;

    //////////////////// RENDER
    function renderListCard(listAction: IAction) {
        return (
            <ActionRow
                ref={node => {
                    // if the card is blocked, meaning an input field is being focused on,
                    // return the node without crag and drop context to allow
                    // text selection in Firefox
                    if (blockedCard) {
                        return node;
                    }
                    return drag(drop(node));
                }}
                opacity={opacity}
                marginTop={marginTop}
                index={index}
                isDragging={dragging}
            >
                <Card fluid>
                    <Connector inputs={inputs} dictionnary={colorTypeDictionnary} isDragging={dragging} />
                    <Card.Content>
                        <h3>{listAction.name}</h3>
                        <p>{listAction.description}</p>
                        {listAction.isSystem ? (
                            <Icon
                                style={{
                                    position: 'absolute',
                                    right: '6px',
                                    top: '15px',
                                    color: '#383939'
                                }}
                                name="lock"
                                title="action is system"
                            />
                        ) : (
                            <Button
                                style={{
                                    position: 'absolute',
                                    right: '2px',
                                    top: '10px',
                                    fontSize: '0.8em'
                                }}
                                circular
                                icon="trash"
                                onClick={onRemoveButtonClicked}
                            />
                        )}
                        {listAction.params && listAction.params.length > 0 && (
                            <div style={{textAlign: 'right'}} onClick={handleToggleParams}>
                                <Card.Meta>
                                    {paramOpen ? t('attributes.hide_params') : t('attributes.display_params')}
                                    <Icon name={paramOpen ? 'triangle down' : 'triangle right'} />
                                </Card.Meta>
                            </div>
                        )}
                    </Card.Content>
                    {paramOpen && (
                        <Card.Content>
                            <div style={{margin: '5px 0'}}>
                                {listAction.params &&
                                    listAction.params.length &&
                                    listAction.params.map((param, i) => (
                                        <Param
                                            index={index}
                                            key={i}
                                            actionId={listAction.list_id !== undefined ? listAction.list_id : -1}
                                            param={param}
                                            changeParam={changeParam}
                                            setBlockCard={setBlockCard}
                                        />
                                    ))}
                            </div>
                        </Card.Content>
                    )}
                    <div
                        style={{textAlign: 'right', marginBottom: '13px', marginRight: '13px'}}
                        onClick={handleToggleParamsMessage}
                    >
                        <Card.Meta>
                            {paramMessageOpen ? t('attributes.hide_messages') : t('attributes.display_messages')}
                            <Icon name={paramMessageOpen ? 'triangle down' : 'triangle right'} />
                        </Card.Meta>
                    </div>
                    <Card.Content>
                        <div>
                            {paramMessageOpen &&
                                availableLangs.map(lang => (
                                    <CustomMessage
                                        index={index}
                                        custom_message={listAction.error_message?.[lang] ?? ''}
                                        lang={lang}
                                        key={lang}
                                        actionId={listAction.list_id !== undefined ? listAction.list_id : -1}
                                        changeCustomMessage={changeCustomMessage}
                                        setBlockCard={setBlockCard}
                                    />
                                ))}
                        </div>
                    </Card.Content>

                    <Connector inputs={outputs} dictionnary={colorTypeDictionnary} isDragging={dragging} />
                </Card>
            </ActionRow>
        );
    }

    return <div ref={container}>{renderListCard(action)}</div>;
}

export default ALCCard;
