import {KitIdCard, KitLoader, KitSnackBarProvider} from 'aristid-ds';
import {useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';
import {AutomationTable} from '../automation/list-automation-rules/table/AutomationTable';
import {usePagination} from '../utils/usePagination';
import {
    useGetAutomationRulesData,
    type AutomationRulesData,
} from '../automation/list-automation-rules/get-automation-rules-data/useGetAutomationRulesData';
import {useDeleteAutomationRule} from '../automation/delete-automation-rule/useDeleteAutomationRule';
import {DuplicateAutomationRuleModal} from '../automation/duplicate-automation-rule/DuplicateAutomationRuleModal';
import {AutomationToolbar} from '../automation/list-automation-rules/toolbar/AutomationToolbar';
import {useAutomationFilters} from '../automation/list-automation-rules/toolbar/filter/useAutomationFilters';
import {useAutomationRulesSelection} from '../automation/list-automation-rules/actions-mass/useAutomationRulesSelection';
import {useAutomationRulesMassActions} from '../automation/list-automation-rules/actions-mass/useAutomationRulesMassActions';
import {SelectAllAutomationRulesCheckbox} from '../automation/list-automation-rules/actions-mass/SelectAllAutomationRulesCheckbox';
import {AUTOMATION_MASS_ACTIONS_SNACKBAR_ID} from '../automation/list-automation-rules/actions-mass/constants';
import {PageContainer} from '../ui/page/PageContainer';
import {PageHeader} from '../ui/page/PageHeader';
import {PageContentContainer} from '../ui/page/PageContentContainer';
import {useTranslation} from 'react-i18next';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';

export const AutomationList = () => {
    const navigate = useNavigate();
    const {currentPage, pageSize, resetPage, handlePageChange, handlePageSizeChange} = usePagination();
    const {gqlFilters, filtersValues, onFilterChange, onFilterReset} = useAutomationFilters({
        onFilterChange: resetPage,
    });
    const {data, total, loading, error, refetch} = useGetAutomationRulesData({
        currentPage,
        pageSize,
        filters: gqlFilters,
    });
    const {
        selectedRules,
        selectedRuleIds,
        isAllFilteredSelected,
        isSelectingAll,
        selectRules,
        selectAllFiltered,
        clearSelection,
    } = useAutomationRulesSelection({total, pageSize, filters: gqlFilters, visibleRules: data});
    useAutomationRulesMassActions({selectedRules, clearSelection, refetchRules: refetch, resetPage});
    // const {isOpen, selectedRecord, openDetails, closeDetails} = useAutomationDetails();  //TODO: Use similar hook as for history, but for automation

    const {t} = useTranslation();
    const {deleteAutomationRule} = useDeleteAutomationRule();
    const {openConfirmModal} = useConfirmModal();
    const [ruleToDuplicate, setRuleToDuplicate] = useState<AutomationRulesData | null>(null);

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

    const handleDuplicated = (newRuleId: string) => {
        setRuleToDuplicate(null);
        navigate(`${AdminAbsolutePaths.automation}/edit/${newRuleId}`);
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
                    filtersValues={filtersValues}
                    onFilterChange={onFilterChange}
                    onFilterReset={onFilterReset}
                    selectAllCheckbox={
                        <SelectAllAutomationRulesCheckbox
                            total={total}
                            selectedCount={selectedRules.length}
                            loading={loading || isSelectingAll}
                            onSelectAll={selectAllFiltered}
                            onClearSelection={clearSelection}
                        />
                    }
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
                        onDuplicate={setRuleToDuplicate}
                        selectedRuleIds={selectedRuleIds}
                        onSelectionChange={selectRules}
                        disableRowCheckboxes={isAllFilteredSelected}
                    />
                )}
            </PageContentContainer>
            <DuplicateAutomationRuleModal
                rule={ruleToDuplicate ? {id: ruleToDuplicate.id, label: ruleToDuplicate.name} : null}
                onClose={() => setRuleToDuplicate(null)}
                onDuplicated={handleDuplicated}
            />
            <KitSnackBarProvider id={AUTOMATION_MASS_ACTIONS_SNACKBAR_ID} />
        </PageContainer>
    );
};
