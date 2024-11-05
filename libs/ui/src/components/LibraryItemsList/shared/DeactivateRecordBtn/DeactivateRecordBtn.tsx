// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {Button, ButtonProps} from 'antd';
import confirm from 'antd/lib/modal/confirm';
import {SyntheticEvent} from 'react';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer/';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {stopEvent} from '_ui/_utils';

interface IDeactivateRecordBtnProps extends ButtonProps {
    record: IRecordIdentityWhoAmI;
}

function DeactivateRecordBtn({record, ...buttonProps}: IDeactivateRecordBtnProps): JSX.Element {
    const {t} = useSharedTranslation();

    const {dispatch: searchDispatch} = useSearchReducer();

    const [deactivateRecords] = useDeactivateRecordsMutation({
        variables: {
            libraryId: record.library.id,
            recordsIds: [record.id]
        }
    });

    const _handleClickConfirm = async () => {
        await deactivateRecords();

        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true}); // Refresh the search
    };

    const _handleClick = async (e: SyntheticEvent) => {
        stopEvent(e);

        confirm({
            content: t('records_deactivation.confirm_one'),
            okText: t('global.submit'),
            cancelText: t('global.cancel'),
            onOk: _handleClickConfirm
        });
    };

    return (
        <Button name="deactivate" icon={<DeleteOutlined />} shape="circle" {...buttonProps} onClick={_handleClick} />
    );
}

export default DeactivateRecordBtn;
