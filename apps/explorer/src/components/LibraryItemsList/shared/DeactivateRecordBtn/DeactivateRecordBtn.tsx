// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button, ButtonProps} from 'antd';
import confirm from 'antd/lib/modal/confirm';
import {deactivateRecordsMutation} from 'graphQL/mutations/records/deactivateRecordsMutation';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {DEACTIVATE_RECORDS, DEACTIVATE_RECORDSVariables} from '_gqlTypes/DEACTIVATE_RECORDS';
import {IRecordIdentityWhoAmI} from '_types/types';

interface IDeactivateRecordBtnProps extends ButtonProps {
    record: IRecordIdentityWhoAmI;
}

function DeactivateRecordBtn({record, ...buttonProps}: IDeactivateRecordBtnProps): JSX.Element {
    const {t} = useTranslation();

    const {dispatch: searchDispatch} = useSearchReducer();

    const [deactivateRecords] = useMutation<DEACTIVATE_RECORDS, DEACTIVATE_RECORDSVariables>(
        deactivateRecordsMutation,
        {
            variables: {
                libraryId: record.library.id,
                recordsIds: [record.id]
            }
        }
    );

    const _handleClickConfirm = async () => {
        await deactivateRecords();

        searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true}); // Refresh the search
    };

    const _handleClick = async (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
