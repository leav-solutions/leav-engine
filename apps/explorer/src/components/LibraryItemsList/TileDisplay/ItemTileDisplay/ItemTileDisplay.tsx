// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined,EditOutlined,EllipsisOutlined,HeartOutlined} from '@ant-design/icons';
import {Button,Card} from 'antd';
import React,{useEffect,useState} from 'react';
import styled,{CSSObject} from 'styled-components';
import {getFileUrl} from 'utils';
import {useStateItem} from '../../../../Context/StateItemsContext';
import themingVar from '../../../../themingVar';
import {IItem} from '../../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../../LibraryItemsListReducer';
import RecordPreview from '../../LibraryItemsListTable/RecordPreview';

const ImageWrapper = styled.div`
    position: relative;
    border-bottom: 1px solid ${themingVar['@divider-color']};
`;

const ActionsWrapper = styled.div`
    display: flex;
    justify-content: center;

    &:hover {
        .actions {
            animation: show-actions 300ms ease;
            opacity: 1;
            background: hsla(0, 0%, 0%, 0.5);
        }
    }

    @keyframes show-actions {
        from {
            opacity: 0;
            background: none;
        }
        to {
            opacity: 1;
            background: hsla(0, 0%, 0%, 0.5);
        }
    }
`;

const Selection = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
`;

interface ICheckboxWrapper {
    checked: boolean;
    styled?: CSSObject;
}

const CheckboxWrapper = styled.span<ICheckboxWrapper>`
    height: 100%;
    width: 100%;
    cursor: pointer;

    background: ${({checked}) => (checked ? 'hsla(0, 0%, 0%, 0.7)' : 'hsla(0, 0%, 0%, 0.1)')};

    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${({checked}) => (checked ? 'hsla(0, 0%, 0%, 0.8)' : 'hsla(0, 0%, 0%, 0.3)')};
    }

    @keyframes show {
        from {
            background: hsla(0, 0%, 0%, 0.1);
        }
        to {
            background: hsla(0, 0%, 0%, 0.5);
        }
    }
`;

const Actions = styled.div`
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr;
    opacity: 0;
    width: 100%;
    height: 100%;

    justify-items: center;
    align-items: center;
    justify-content: center;
    grid-gap: 1rem;

    padding: 2rem 5rem;
    border-radius: 0.25rem 0.25rem 0 0;

    button {
        color: #fff;

        &:hover {
            color: #fff;
        }
    }
`;

interface IItemTileDisplayProps {
    item: IItem;
    showRecordEdition: (item: IItem) => void;
}

function ItemTileDisplay({item, showRecordEdition}: IItemTileDisplayProps): JSX.Element {
    const {stateItems, dispatchItems} = useStateItem();
    const [isSelected, setIsSelect] = useState<boolean>(!!stateItems.itemsSelected[item.whoAmI.id]);

    const handleClick = () => {
        if (stateItems.selectionMode) {
            setIsSelect(s => !s);

            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
                itemsSelected: {...stateItems.itemsSelected, [item.whoAmI.id]: !isSelected}
            });
        }
    };

    const switchSelectionMode = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: !stateItems.selectionMode
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {...stateItems.itemsSelected, [item.whoAmI.id]: true}
        });
    };

    useEffect(() => {
        setIsSelect(stateItems.itemsSelected[item.whoAmI.id]);
    }, [stateItems.itemsSelected, item]);

    return (
        <Card
            cover={
                <ImageWrapper>
                    <ActionsWrapper>
                        {stateItems.selectionMode ? (
                            <Selection>
                                <CheckboxWrapper checked={isSelected} onClick={handleClick}>
                                    {isSelected && <CheckOutlined style={{fontSize: '64px', color: '#FFF'}} />}
                                </CheckboxWrapper>
                            </Selection>
                        ) : (
                            <Actions className="actions">
                                <Button shape="circle" ghost icon={<CheckOutlined />} onClick={switchSelectionMode} />
                                <Button
                                    shape="circle"
                                    icon={<EditOutlined />}
                                    ghost
                                    onClick={() => showRecordEdition(item)}
                                />
                                <Button shape="circle" ghost icon={<HeartOutlined />} />
                                <Button shape="circle" ghost icon={<EllipsisOutlined />} />
                            </Actions>
                        )}
                    </ActionsWrapper>
                    <RecordPreview
                        label={item.whoAmI.label || item.whoAmI.id}
                        image={item.whoAmI.preview?.medium ? getFileUrl(item.whoAmI.preview.medium) : ''}
                        tile={true}
                    />
                </ImageWrapper>
            }
        >
            <Card.Meta title={item.whoAmI.label || item.whoAmI.id} description={item.whoAmI.library?.id} />
        </Card>
    );
}

export default ItemTileDisplay;
