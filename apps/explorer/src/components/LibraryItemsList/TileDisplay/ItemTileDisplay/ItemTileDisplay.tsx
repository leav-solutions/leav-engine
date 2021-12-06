// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowsAltOutlined, CheckOutlined, DeleteOutlined} from '@ant-design/icons';
import {Button, Card, message, Space} from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import SelectCellsBtn, {
    SelectCellsBtnType
} from 'components/LibraryItemsList/LibraryItemsListTable/BodyCell/SelectCellsBtn';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {displayTypeToPreviewSize, getFileUrl, localizedTranslation} from 'utils';
import themingVar from '../../../../themingVar';
import {IItem, ISharedSelected, PreviewSize, SharedStateSelectionType} from '../../../../_types/types';
import EditRecordModal from '../../../RecordEdition/EditRecordModal';
import RecordPreview from '../../LibraryItemsListTable/RecordPreview';

const itemPreviewSize = {
    [PreviewSize.small]: '100px',
    [PreviewSize.medium]: '200px',
    [PreviewSize.big]: '300px'
};

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
    height: 100%;
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

const Selection = styled.div<{checked: boolean}>`
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({checked}) => (checked ? 'hsla(0, 0%, 0%, 0.7)' : 'hsla(0, 0%, 0%, 0.1)')};

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

const SelectionActions = styled(Space)`
    && {
        display: none;
        position: absolute;
        top: 1em;
    }
    ${Selection}:hover & {
        display: inherit;
    }
`;

interface ICheckboxWrapper {
    checked: boolean;
    styled?: CSSObject;
}

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
        color: #fff;

        &:hover {
            color: #fff;
        }

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
                        <ActionsWrapper>
                            {isChecked ? (
                                <Selection checked>
                                    <SelectionActions>
                                        <SelectCellsBtn
                                            selectionType={SelectCellsBtnType.ONLY}
                                            text={t('items-list-row.select-only')}
                                            record={item.whoAmI}
                                            size="small"
                                            style={{color: '#FFF', background: 'transparent'}}
                                        />
                                        <SelectCellsBtn
                                            selectionType={SelectCellsBtnType.ALL}
                                            text={t('items-list-row.select-all')}
                                            record={item.whoAmI}
                                            size="small"
                                            style={{color: '#FFF', background: 'transparent'}}
                                        />
                                    </SelectionActions>
                                    <div className="checked-icon">
                                        <CheckOutlined style={{fontSize: '64px', color: '#FFF'}} />
                                    </div>
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
                            image={
                                item.whoAmI.preview?.[previewSize] ? getFileUrl(item.whoAmI.preview[previewSize]) : ''
                            }
                            tile={true}
                            style={{
                                width: itemPreviewSize[previewSize],
                                height: itemPreviewSize[previewSize]
                            }}
                        />
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
