// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckCircleFilled, CheckOutlined, DeleteOutlined} from '@ant-design/icons';
import {Button, Card, message, Space, Tooltip} from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import SelectCellsBtn, {
    SelectCellsBtnType
} from 'components/LibraryItemsList/LibraryItemsListTable/BodyCell/SelectCellsBtn';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {displayTypeToPreviewSize, getFileUrl, localizedTranslation} from 'utils';
import themingVar from '../../../../themingVar';
import {
    IItem,
    ISharedSelected,
    ISharedStateSelectionSearch,
    PreviewSize,
    SharedStateSelectionType
} from '../../../../_types/types';
import EditRecordModal from '../../../RecordEdition/EditRecordModal';
import RecordPreview from '../../../shared/RecordPreview';

const itemPreviewSize = {
    [PreviewSize.small]: '100px',
    [PreviewSize.medium]: '200px',
    [PreviewSize.big]: '300px'
};

const buttonsColor = '#333333';

// Using 8 digit hexadecimal notation to add transparency
const hoverBackgroundColor = `${themingVar['@leav-background-active']}AA`;
const selectedBackgroundColor = `${themingVar['@leav-background-active']}DF`;

const Item = styled(Card)<{$previewSize: string}>`
    && {
        width: ${p => p.$previewSize};
        margin: 0.5em;
        outline: 2px solid transparent;

        & .ant-card-cover {
            width: ${p => p.$previewSize};
            height: ${p => p.$previewSize};
        }

        &:hover {
            outline-color: ${themingVar['@primary-color']};
        }
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    border-bottom: 1px solid ${themingVar['@divider-color']};
`;

const ActionsWrapper = styled.div`
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    justify-content: center;

    &:hover {
        .actions {
            animation: show-actions 300ms ease;
            opacity: 1;
            background: ${hoverBackgroundColor};
        }
    }

    @keyframes show-actions {
        from {
            opacity: 0;
            background: none;
        }
        to {
            opacity: 1;
            background: ${hoverBackgroundColor};
        }
    }
`;

const Selection = styled.div<{checked: boolean}>`
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => (p.checked ? selectedBackgroundColor : 'none')};

    &:hover {
        background: ${p => (p.checked ? selectedBackgroundColor : hoverBackgroundColor)};
    }
`;

const SelectionActions = styled(Space)`
    && {
        display: none;
        position: absolute;
        top: 1em;
    }
    ${Selection}:hover & {
        display: inherit;
    }
    button {
        color: ${buttonsColor};
        border-color: ${buttonsColor};
    }
`;

const Actions = styled.div`
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr;
    opacity: 0;
    width: 100%;
    height: 100%;
    grid-gap: 1rem;

    justify-items: center;
    align-items: center;
    justify-content: center;

    border-radius: 0.25rem 0.25rem 0 0;

    button {
        color: ${buttonsColor};
        border-color: ${buttonsColor}66;

        // Arrange buttons, depending on their position on the grid
        &:nth-child(1) {
            justify-self: end;
            align-self: end;
        }
        &:nth-child(2) {
            justify-self: start;
            align-self: end;
        }
        &:nth-child(3) {
            justify-self: end;
            align-self: start;
        }
        &:nth-child(4) {
            justify-self: start;
            align-self: start;
        }
    }
`;

const CheckedIconWrapper = styled.div`
    font-size: 3em;
    color: ${themingVar['@primary-color']};
`;

interface IItemTileDisplayProps {
    item: IItem;
}

function ItemTileDisplay({item}: IItemTileDisplayProps): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState} = useSearchReducer();
    const selectionMode = useContext(SelectionModeContext);
    const [editRecordModal, setEditRecordModal] = useState<boolean>(false);
    const previewSize: PreviewSize = displayTypeToPreviewSize(searchState.display.size);

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

    const isAllSelected = selectionMode
        ? selectionState.searchSelection.type === SharedStateSelectionType.search &&
          selectionState.searchSelection.allSelected
        : selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;

    const selectedToggle = () => {
        setIsSelect(!isSelected);

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
        setIsSelect(
            selectionState[selectionMode ? 'searchSelection' : 'selection'].selected.some(
                elementSelected =>
                    elementSelected.id === item.whoAmI.id && elementSelected.library === item.whoAmI.library.id
            )
        );
    }, [selectionState.selection, selectionState.searchSelection, item, selectionState, selectionMode]);

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

    const isChecked = isSelected || isAllSelected;

    const selectMode =
        selectionState.selection.selected.length ||
        (selectionState.selection as ISharedStateSelectionSearch).allSelected;

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
            <Item
                $previewSize={itemPreviewSize[previewSize]}
                size="small"
                onClick={selectedToggle}
                onDoubleClick={() => setEditRecordModal(true)}
                cover={
                    <ImageWrapper>
                        <RecordPreview
                            label={item.whoAmI.label || item.whoAmI.id}
                            image={
                                item.whoAmI.preview?.[previewSize] ? getFileUrl(item.whoAmI.preview[previewSize]) : ''
                            }
                            tile={true}
                            style={{
                                width: itemPreviewSize[previewSize],
                                height: itemPreviewSize[previewSize]
                            }}
                        />
                        <ActionsWrapper>
                            {isChecked || selectMode ? (
                                <Selection checked={isChecked}>
                                    <SelectionActions>
                                        <SelectCellsBtn
                                            selectionType={SelectCellsBtnType.ONLY}
                                            text={t('items-list-row.select-only')}
                                            record={item.whoAmI}
                                            size="small"
                                            ghost
                                        />
                                        <SelectCellsBtn
                                            selectionType={SelectCellsBtnType.ALL}
                                            text={t('items-list-row.select-all')}
                                            record={item.whoAmI}
                                            size="small"
                                            ghost
                                        />
                                    </SelectionActions>
                                    {isChecked && (
                                        <CheckedIconWrapper className="checked-icon">
                                            <CheckCircleFilled />
                                        </CheckedIconWrapper>
                                    )}
                                </Selection>
                            ) : (
                                <Actions className="actions">
                                    <Tooltip title={t('global.select')} key="select">
                                        <Button shape="circle" ghost icon={<CheckOutlined />} onClick={_handleSelect} />
                                    </Tooltip>
                                    <Tooltip title={t('global.edit')} key="edit">
                                        <EditRecordBtn shape={'circle'} ghost record={item.whoAmI} />
                                    </Tooltip>
                                    <Tooltip title={t('global.delete')} key="delete">
                                        <Button
                                            shape="circle"
                                            ghost
                                            icon={<DeleteOutlined />}
                                            onClick={_handleDelete}
                                        />
                                    </Tooltip>
                                </Actions>
                            )}
                        </ActionsWrapper>
                    </ImageWrapper>
                }
            >
                <Card.Meta
                    title={
                        <Paragraph
                            ellipsis={{rows: 1, tooltip: true}}
                            style={{marginBottom: 0, fontSize: previewSize === PreviewSize.small ? '.8em' : '1em'}}
                        >
                            {item.whoAmI.label || item.whoAmI.id}
                        </Paragraph>
                    }
                />
            </Item>
        </>
    );
}

export default ItemTileDisplay;
