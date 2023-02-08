// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import DeactivateRecordBtn from 'components/LibraryItemsList/shared/DeactivateRecordBtn';
import SelectCellsBtn, {SelectCellsBtnType} from 'components/LibraryItemsList/shared/SelectCellsBtn';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import RecordCard from 'components/shared/RecordCard';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useSearchReducer from 'hooks/useSearchReducer';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {IRecordIdentityWhoAmI, ISharedStateSelectionSearch, PreviewSize} from '../../../../../_types/types';

const Info = styled.div`
    min-width: 150px;
`;

interface ICellInfosProps {
    record: IRecordIdentityWhoAmI;
    previewSize: PreviewSize;
    lang?: string[];
}

function CellInfos({record, previewSize, lang}: ICellInfosProps): JSX.Element {
    const {t} = useTranslation();
    const [activeLibrary] = useActiveLibrary();
    const canDeleteRecord = activeLibrary.permissions.delete_record;

    const {state: searchState} = useSearchReducer();
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));

    const menuBtnSize: SizeType = 'middle';

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.details'),
            button: (
                <EditRecordBtn
                    shape={'circle'}
                    record={record}
                    size={menuBtnSize}
                    valuesVersion={searchState.valuesVersions}
                />
            )
        }
    ];

    if (canDeleteRecord) {
        menuActions.push({
            title: t('records_deactivation.title_one'),
            button: <DeactivateRecordBtn record={record} />
        });
    }

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
