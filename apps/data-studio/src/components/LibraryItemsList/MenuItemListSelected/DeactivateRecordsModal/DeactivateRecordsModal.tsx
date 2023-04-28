// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {Modal} from 'antd';
import {ErrorDisplay, Loading} from '@leav/ui';
import {deactivateRecordsMutation} from 'graphQL/mutations/records/deactivateRecordsMutation';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {useTranslation} from 'react-i18next';
import {resetSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {getRequestFromFilters} from 'utils/getRequestFromFilter';
import {DEACTIVATE_RECORDS, DEACTIVATE_RECORDSVariables} from '_gqlTypes/DEACTIVATE_RECORDS';
import {ISharedStateSelectionSearch} from '_types/types';

interface IDeactivateRecordsModalProps {
    open: boolean;
    onClose: () => void;
}

function DeactivateRecordsModal({onClose, open}: IDeactivateRecordsModalProps): JSX.Element {
    const {t} = useTranslation();
    const {selectionState} = useAppSelector(state => ({selectionState: state.selection}));
    const dispatch = useAppDispatch();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const hasSelectedAll = !!(selectionState.selection as ISharedStateSelectionSearch).allSelected;

    const elementsCount = hasSelectedAll ? searchState.totalCount : selectionState.selection.selected.length;

    const [deactivateRecords, {loading, error, called}] = useMutation<DEACTIVATE_RECORDS, DEACTIVATE_RECORDSVariables>(
        deactivateRecordsMutation,
        {
            variables: {
                libraryId: searchState.library.id,
                recordsIds: hasSelectedAll ? null : selectionState.selection.selected.map(record => record.id),
                filters: hasSelectedAll ? getRequestFromFilters(searchState.filters) : null
            }
        }
    );

    const _handleOk = async () => {
        try {
            // Run the deactivate mutation
            await deactivateRecords();

            dispatch(resetSelection()); // Clear selection
            searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true}); // Refresh the search

            onClose();
        } catch (e) {
            // Errors are handled with the error variable
        }
    };

    return (
        <Modal
            title={t('records_deactivation.title')}
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
            onOk={_handleOk}
            onCancel={onClose}
            confirmLoading={loading}
            open={open}
            closable
            centered
            okButtonProps={{className: 'submit-btn'}}
            destroyOnClose
        >
            {loading && <Loading />}
            {!loading && error && <ErrorDisplay message={error.message} />}
            {!called && t('records_deactivation.confirm', {count: elementsCount})}
        </Modal>
    );
}

export default DeactivateRecordsModal;
