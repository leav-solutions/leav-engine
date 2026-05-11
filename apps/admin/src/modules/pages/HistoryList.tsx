// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard, KitLoader} from 'aristid-ds';
import {Navigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {AdminAbsolutePaths} from '../routes/paths';
import {usePagination} from '../utils/usePagination';
import {useHistoryFilters} from '../history/list-history/toolbar/filter/useHistoryFilters';
import {HistoryToolbar} from '../history/list-history/toolbar/HistoryToolbar';
import {useGetHistoryData} from '../history/list-history/get-history-data/useGetHistoryData';
import {HistoryTable} from '../history/list-history/table/HistoryTable';
import {useHistoryDetails} from '../history/open-history-details/useHistoryDetails';
import {HistoryDetailsModal} from '../history/open-history-details/HistoryDetailsModal';
import {PageContainer} from '../ui/page/PageContainer';
import {PageHeader} from '../ui/page/PageHeader';
import {PageContentContainer} from '../ui/page/PageContentContainer';

export const HistoryList = () => {
    const {t} = useTranslation();
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
        <PageContainer>
            <PageHeader
                extraAlignLeft={<KitIdCard title={t('logs.title')} description={t('logs.description')} size="s" />}
            />
            <PageContentContainer>
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
            </PageContentContainer>
        </PageContainer>
    );
};
