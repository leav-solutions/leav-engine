// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, ArrowsAltOutlined, DeleteOutlined} from '@ant-design/icons';
import {Button, Card, message} from 'antd';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useContext, useEffect, useState} from 'react';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {useTranslation} from 'react-i18next';
import {getFileUrl, localizedTranslation} from 'utils';
import themingVar from '../../../../themingVar';
import {IItem, ISharedSelected, SharedStateSelectionType} from '../../../../_types/types';
import EditRecordModal from '../../../RecordEdition/EditRecordModal';
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
    const {t} = useTranslation();

    const selectionMode = useContext(SelectionModeContext);
    const [editRecordModal, setEditRecordModal] = useState<boolean>(false);
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection
    }));
    const dispatch = useAppDispatch();

    const [{lang}] = useLang();
    const [isSelected, setIsSelect] = useState<boolean>(
        !!selectionState.selection.selected.some(
            elementSelected =>
                elementSelected.id === item.whoAmI.id && elementSelected.library === item.whoAmI.library.id
        )
    );

    const selectedToggle = () => {
        setIsSelect(s => !s);

        const newSelected: ISharedSelected = {
            id: item.whoAmI.id,
            library: item.whoAmI.library.id,
            label: localizedTranslation(item.whoAmI.label, lang)
        };

        if (selectionMode) {
            dispatch(setSelectionToggleSearchSelectionElement(newSelected));
        } else {
            dispatch(
                setSelectionToggleSelected({
                    selectionType: SharedStateSelectionType.search,
                    elementSelected: newSelected
                })
            );
        }
    };

    useEffect(() => {
        if (selectionMode) {
            setIsSelect(
                selectionState.searchSelection.selected.some(
                    elementSelected =>
                        elementSelected.id === item.whoAmI.id && elementSelected.library === item.whoAmI.library.id
                )
            );
        } else {
            setIsSelect(
                selectionState.selection.selected.some(
                    elementSelected =>
                        elementSelected.id === item.whoAmI.id && elementSelected.library === item.whoAmI.library.id
                )
            );
        }
    }, [selectionState.selection, selectionState.searchSelection, item, selectionMode]);

    const selectionActive =
        (selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected) ||
        selectionState.selection.selected.length;

    const _handleClose = () => {
        setEditRecordModal(false);
    };

    const _handleEdit = e => {
        e.stopPropagation();
        e.preventDefault();

        setEditRecordModal(true);
    };

    const _handleSelect = e => {
        e.stopPropagation();
        e.preventDefault();

        selectedToggle();
    };

    const _handleDelete = e => {
        e.stopPropagation();
        e.preventDefault();

        message.warn(t('global.feature_not_available'));
    };

    return (
        <>
            {editRecordModal && (
                <EditRecordModal
                    open={editRecordModal}
                    record={item.whoAmI}
                    library={item.whoAmI.library.id}
                    onClose={_handleClose}
                />
            )}
            <Card
                onClick={selectedToggle}
                cover={
                    <ImageWrapper>
                        <ActionsWrapper>
                            {isSelected ? (
                                <Selection onClick={selectedToggle}>
                                    <CheckboxWrapper checked={isSelected} onClick={selectedToggle}>
                                        {isSelected && <CheckOutlined style={{fontSize: '64px', color: '#FFF'}} />}
                                    </CheckboxWrapper>
                                </Selection>
                            ) : (
                                <Actions className="actions">
                                    <Button shape="circle" ghost icon={<CheckOutlined />} onClick={_handleSelect} />
                                    <Button shape="circle" icon={<ArrowsAltOutlined />} ghost onClick={_handleEdit} />
                                    <Button shape="circle" ghost icon={<DeleteOutlined />} onClick={_handleDelete} />
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
        </>
    );
}

export default ItemTileDisplay;
