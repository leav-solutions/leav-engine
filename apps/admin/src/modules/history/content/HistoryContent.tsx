// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitLoader} from 'aristid-ds';
import {Navigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../../routes/paths';
import {useHistoryFilters} from './toolbar/filter/useHistoryFilters';
import {HistoryToolbar} from './toolbar/HistoryToolbar';
import {useGetHistoryData} from './get-history-data/useGetHistoryData';
import {usePagination} from '../../utils/usePagination';
import {HistoryTable} from './table/HistoryTable';
import {useHistoryDetails} from './details/useHistoryDetails';
import {HistoryDetailsModal} from './details/HistoryDetailsModal';

export const HistoryContent = () => {
    const {currentPage, pageSize, resetPage, handlePageChange, handlePageSizeChange} = usePagination();
    const {gqlFilters, filtersValues, onFilterChange, onFilterReset} = useHistoryFilters({onFilterChange: resetPage});
    const {data, total, loading, error, refresh} = useGetHistoryData({
        currentPage,
        pageSize,
        filters: gqlFilters,
        resetPage,
    });
    const {isOpen, selectedRecord, openDetails, closeDetails} = useHistoryDetails();

    if (error) {
        return <Navigate to={AdminAbsolutePaths.notFound} />;
    }

    return (
        <>
            <HistoryToolbar
                loading={loading}
                total={total}
                filtersValues={filtersValues}
                onFilterChange={onFilterChange}
                onRefresh={refresh}
                onFilterReset={onFilterReset}
            />
            {loading ? (
                <KitLoader />
            ) : (
                <HistoryTable
                    data={data}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onRowClick={openDetails}
                />
            )}
            <HistoryDetailsModal isOpen={isOpen} historyData={selectedRecord} onClose={closeDetails} />
        </>
    );
};
