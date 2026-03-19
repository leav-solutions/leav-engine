// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {HistoryTable} from './table/HistoryTable';
import {useGetHistoryData} from './get-history-data/useGetHistoryData';
import {usePagination} from './table/usePagination';
import {historyContentContainer} from './historyContent.module.css';
import {KitLoader} from 'aristid-ds';
import {Navigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../../routes/paths';

export const HistoryContent = () => {
    const {currentPage, pageSize, handlePageChange, handlePageSizeChange} = usePagination();
    const {data: historyData, total, loading, error} = useGetHistoryData({currentPage, pageSize});

    if (error) {
        return <Navigate to={AdminAbsolutePaths.notFound} />;
    }

    return (
        <div className={historyContentContainer}>
            {/* TODO: Add filters component here */}
            {loading && <KitLoader />}
            {!loading && !error && (
                <HistoryTable
                    data={historyData}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    );
};
