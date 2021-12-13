// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {message} from 'antd';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import SelectCellsBtn, {
    SelectCellsBtnType
} from 'components/LibraryItemsList/LibraryItemsListTable/BodyCell/SelectCellsBtn';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {DeleteOutlined} from '@ant-design/icons';
import themingVar from '../../../../../themingVar';
import {IRecordIdentityWhoAmI, ISharedStateSelectionSearch, PreviewSize} from '../../../../../_types/types';

const Info = styled.div`
    border-left: 1px solid ${themingVar['@divider-color']};
    min-width: 150px;
    max-width: 35px;
`;

interface ICellInfosProps {
    record: IRecordIdentityWhoAmI;
    previewSize: PreviewSize;
    lang?: string[];
}

function CellInfos({record, previewSize, lang}: ICellInfosProps): JSX.Element {
    const {t} = useTranslation();

    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));

    const menuBtnSize: SizeType = 'large';

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.edit'),
            button: <EditRecordBtn shape={'circle'} record={record} size={menuBtnSize} />
        },
        {
            title: t('items_list.table.actions-tooltips.remove'),
            icon: <DeleteOutlined />,
            size: menuBtnSize,
            onClick: () => message.warn(t('global.feature_not_available'))
        }
    ];

    const selectActions: FloatingMenuAction[] = [
        {
            title: t('items-list-row.select-only'),
            button: (
                <SelectCellsBtn
                    selectionType={SelectCellsBtnType.ONLY}
                    text={t('items-list-row.select-only')}
                    record={record}
                    size={menuBtnSize}
                />
            )
        },
        {
            title: t('items-list-row.select-all'),
            button: (
                <SelectCellsBtn
                    selectionType={SelectCellsBtnType.ALL}
                    text={t('items-list-row.select-all')}
                    record={record}
                    size={menuBtnSize}
                />
            )
        }
    ];

    const selectMode =
        selectionState.selection.selected.length ||
        (selectionState.selection as ISharedStateSelectionSearch).allSelected;

    return (
        <>
            <Info>
                <RecordCard record={record} size={previewSize} lang={lang} />
            </Info>
            <FloatingMenu actions={selectMode ? selectActions : menuActions} size={menuBtnSize} />
        </>
    );
}

export default CellInfos;
