// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import styled from 'styled-components';
import {FloatingMenu, FloatingMenuAction, RecordCard} from '_ui/components';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import DeactivateRecordBtn from '_ui/components/LibraryItemsList/shared/DeactivateRecordBtn';
import SelectCellsBtn, {SelectCellsBtnType} from '_ui/components/LibraryItemsList/shared/SelectCellsBtn';
import {PreviewSize} from '_ui/constants';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {ArrowsAltOutlined} from '@ant-design/icons';
import {AntButton} from 'aristid-ds';

const Info = styled.div`
    min-width: 150px;
`;

interface ICellInfosProps {
    record: IRecordIdentityWhoAmI;
    previewSize: PreviewSize;
    lang?: string[];
    onEdit: () => void;
}

function CellInfos({record, previewSize, lang, onEdit}: ICellInfosProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {state: searchState} = useSearchReducer();

    const canDeleteRecord = searchState.library.permissions.delete_record;

    const menuBtnSize: SizeType = 'middle';

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.details'),
            button: (
                <AntButton
                    aria-label="edit-record"
                    shape="circle"
                    size={menuBtnSize}
                    icon={<ArrowsAltOutlined size={48} />}
                    onClick={onEdit}
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

    const isSelectActive = searchState.selection.selected.length || searchState.selection.allSelected;

    return (
        <>
            <Info>
                <RecordCard record={record} size={previewSize} lang={lang} />
            </Info>
            <FloatingMenu actions={isSelectActive ? selectActions : menuActions} size={menuBtnSize} />
        </>
    );
}

export default CellInfos;
