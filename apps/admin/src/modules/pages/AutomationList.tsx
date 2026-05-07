// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard, KitLoader} from 'aristid-ds';
import {Navigate, useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';
import {AutomationTable} from '../automation/list-automation-rules/table/AutomationTable';
import {usePagination} from '../utils/usePagination';
import {
    useGetAutomationRulesData,
    type AutomationRulesData,
} from '../automation/list-automation-rules/get-automation-rules-data/useGetAutomationRulesData';
import {AutomationToolbar} from '../automation/list-automation-rules/toolbar/AutomationToolbar';
import {PageContainer} from '../ui/page/PageContainer';
import {PageHeader} from '../ui/page/PageHeader';
import {PageContentContainer} from '../ui/page/PageContentContainer';
import {useTranslation} from 'react-i18next';

export const AutomationList = () => {
    const navigate = useNavigate();
    const {currentPage, pageSize, resetPage, handlePageChange, handlePageSizeChange} = usePagination();
    // const {gqlFilters, filtersValues, onFilterChange} = useHistoryFilters({onFilterChange: resetPage}); //TODO: Use similar hook as for history
    const {data, total, loading, error} = useGetAutomationRulesData({currentPage, pageSize, filters: undefined}); //TODO: Add filters from above hook
    // const {isOpen, selectedRecord, openDetails, closeDetails} = useAutomationDetails();  //TODO: Use similar hook as for history, but for automation

    const {t} = useTranslation();

    const handleRowClick = (record: AutomationRulesData) => {
        navigate(`${AdminAbsolutePaths.automation}/edit/${record.id}`);
    };

    if (error) {
        return <Navigate to={AdminAbsolutePaths.notFound} />;
    }

    return (
        <PageContainer>
            <PageHeader
                extraAlignLeft={
                    <KitIdCard title={t('automation.title')} description={t('automation.description')} size="s" />
                }
            />
            <PageContentContainer>
                <AutomationToolbar
                    loading={loading}
                    total={total}
                    // filtersValues={filtersValues}
                    // onFilterChange={onFilterChange}
                />
                {loading ? (
                    <KitLoader />
                ) : (
                    <AutomationTable
                        data={data}
                        total={total}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        onRowClick={handleRowClick}
                    />
                )}
            </PageContentContainer>
        </PageContainer>
    );
};
