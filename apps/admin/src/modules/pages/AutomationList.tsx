import {KitIdCard, KitLoader} from 'aristid-ds';
import {Navigate, useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';
import {AutomationTable} from '../automation/list-automation-rules/table/AutomationTable';
import {usePagination} from '../utils/usePagination';
import {
    useGetAutomationRulesData,
    type AutomationRulesData,
} from '../automation/list-automation-rules/get-automation-rules-data/useGetAutomationRulesData';
import {useDeleteAutomationRule} from '../automation/delete-automation-rule/useDeleteAutomationRule';
import {AutomationToolbar} from '../automation/list-automation-rules/toolbar/AutomationToolbar';
import {PageContainer} from '../ui/page/PageContainer';
import {PageHeader} from '../ui/page/PageHeader';
import {PageContentContainer} from '../ui/page/PageContentContainer';
import {useTranslation} from 'react-i18next';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';

export const AutomationList = () => {
    const navigate = useNavigate();
    const {currentPage, pageSize, resetPage, handlePageChange, handlePageSizeChange} = usePagination();
    // const {gqlFilters, filtersValues, onFilterChange} = useHistoryFilters({onFilterChange: resetPage}); //TODO: Use similar hook as for history
    const {data, total, loading, error} = useGetAutomationRulesData({currentPage, pageSize, filters: undefined}); //TODO: Add filters from above hook
    // const {isOpen, selectedRecord, openDetails, closeDetails} = useAutomationDetails();  //TODO: Use similar hook as for history, but for automation

    const {t} = useTranslation();
    const {deleteAutomationRule} = useDeleteAutomationRule();
    const {openConfirmModal} = useConfirmModal();

    const handleRowClick = (record: AutomationRulesData) => {
        navigate(`${AdminAbsolutePaths.automation}/edit/${record.id}`);
    };

    const handleDelete = (ruleId: string) => {
        openConfirmModal({
            title: t('automation.table.action.delete.confirm.title'),
            content: t('automation.table.action.delete.confirm.content'),
            onOk: () => deleteAutomationRule(ruleId),
            dangerConfirm: true,
        });
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
                        onDelete={handleDelete}
                    />
                )}
            </PageContentContainer>
        </PageContainer>
    );
};
