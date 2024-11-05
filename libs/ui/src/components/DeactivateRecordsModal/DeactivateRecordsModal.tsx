// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {Modal} from 'antd';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFilter, ISearchSelection} from '_ui/types';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {getRequestFromFilters} from '_ui/_utils/getRequestFromFilter';
import {ErrorDisplay} from '../ErrorDisplay';
import useSearchReducer from '../LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '../LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {Loading} from '../Loading';

interface IDeactivateRecordsModalProps {
    open: boolean;
    library: string;
    selection: ISearchSelection;
    filters?: IFilter[];
    onClose: () => void;
}

function DeactivateRecordsModal({
    library,
    onClose,
    open,
    selection,
    filters
}: IDeactivateRecordsModalProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {dispatch: searchDispatch} = useSearchReducer();

    const hasSelectedAll = selection.allSelected;

    const [deactivateRecords, {loading, error, called}] = useDeactivateRecordsMutation({
        variables: {
            libraryId: library,
            recordsIds: hasSelectedAll ? null : selection.selected.map(record => record.id),
            filters: hasSelectedAll ? getRequestFromFilters(filters) : null
        }
    });

    const _handleOk = async () => {
        try {
            // Run the deactivate mutation
            await deactivateRecords();

            searchDispatch({type: SearchActionTypes.SET_LOADING, loading: true}); // Refresh the search
            searchDispatch({type: SearchActionTypes.CLEAR_SELECTION}); // Refresh the search

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
            {loading && <Loading data-testid="loading" />}
            {!loading && error && <ErrorDisplay message={error.message} />}
            {!called && t('records_deactivation.confirm')}
        </Modal>
    );
}

export default DeactivateRecordsModal;
