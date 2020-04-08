import React, {useEffect, useRef, useState} from 'react';
import {useDrag} from 'react-dnd-cjs';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {useTranslation} from 'react-i18next';
import {Button, Card, Icon} from 'semantic-ui-react';
import TypeTag from '../ALCTypeTag';
import {IAction, IColorDic, IParamInput} from '../interfaces/interfaces';
import itemTypes from '../ItemTypes';

interface IALCReserveCardProps {
    id: string;
    action: IAction;
    moveCard?: (id: string, isOver: boolean, to: number) => void;
    findCard?: (id: string) => number | undefined;
    origin: string;
    addActionToList: (actionName: string, atIndex: number) => void;
    removeActionFromList?: (id: string) => void;
    marginTop?: string;
    currentIndex?: number;
    setCurrentIndex?: (idx: number) => void;
    connectionState?: {top: boolean; bottom: boolean};
    getConnectorStatus?: (indx: number, action: {}) => boolean | undefined;
    colorTypeDictionnary: IColorDic;
    changeParam?: (input: IParamInput) => void;
    index?: number;
    dragging?: boolean;
}

function ALCReserveCard({
    id,
    action,
    origin,
    addActionToList,
    removeActionFromList,
    setCurrentIndex,
    connectionState,
    colorTypeDictionnary
}: IALCReserveCardProps): JSX.Element {
    const {t} = useTranslation();
    const container = useRef(null);
    const [typesOpen, toggleTypes] = useState(false);
    const [internalWidth, setWidth] = useState(null);

    const [, drag, preview] = useDrag({
        item: {
            type: itemTypes.ACTION,
            id,
            originalIndex: -1,
            origin,
            action,
            connectionState,
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
        })
    });

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: false});
        // @ts-ignore
        setWidth(container && container.current && container.current.offsetWidth);
    }, [preview]);

    const handleToggleTypes = () => {
        toggleTypes(!typesOpen);
    };

    const onAddButtonClicked = () => {
        tryAndAdd(action.id, -1);
    };

    const tryAndAdd = (actId: string, atIndex: number) => {
        if (addActionToList) {
            addActionToList(actId, atIndex);
        }
    };

    const inputs = action.input_types;
    const outputs = action.output_types;

    return (
        <div ref={container}>
            <div ref={node => drag(node)} style={{paddingBottom: '5px'}}>
                <Card fluid>
                    <Card.Content>
                        <Card.Header>{action.name}</Card.Header>
                        <Card.Description>{action.description}</Card.Description>
                        <Button
                            style={{
                                position: 'absolute',
                                right: '2px',
                                top: '5px',
                                fontSize: '0.8em'
                            }}
                            circular
                            icon="add"
                            onClick={onAddButtonClicked}
                        />
                        <div
                            style={{
                                textAlign: 'right'
                            }}
                            onClick={handleToggleTypes}
                        >
                            <Card.Meta>
                                {typesOpen ? t('attributes.hide_types') : t('attributes.display_types')}
                                <Icon name={typesOpen ? 'triangle down' : 'triangle right'} />
                            </Card.Meta>
                        </div>
                    </Card.Content>
                    {typesOpen && (
                        <Card.Content extra>
                            <div style={{padding: 0}}>
                                <Icon name="triangle right" />
                                <span>{t('attributes.input_types')}: </span>
                                {inputs &&
                                    colorTypeDictionnary[inputs[0]] &&
                                    inputs.map((input, i) => (
                                        <TypeTag key={i} color={colorTypeDictionnary[input]} input={input} />
                                    ))}
                            </div>
                            <div style={{marginTop: '5px'}}>
                                <Icon name="triangle left" />
                                <span>{t('attributes.output_types')}: </span>
                                {outputs &&
                                    colorTypeDictionnary[outputs[0]] &&
                                    outputs.map((output, i) => (
                                        <TypeTag key={i} color={colorTypeDictionnary[output]} input={output} />
                                    ))}
                            </div>
                        </Card.Content>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default ALCReserveCard;
