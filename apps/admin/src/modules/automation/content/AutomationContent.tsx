// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitLoader} from 'aristid-ds';
import {Navigate, useNavigate} from 'react-router-dom';
import {AdminAbsolutePaths} from '../../routes/paths';
import {AutomationTable} from './table/AutomationTable';
import {usePagination} from '../../utils/usePagination';
import {
    useGetAutomationRulesData,
    type AutomationRulesData,
} from './get-automation-rules-data/useGetAutomationRulesData';
import {AutomationToolbar} from './toolbar/AutomationToolbar';

export const AutomationContent = () => {
    const navigate = useNavigate();
    const {currentPage, pageSize, resetPage, handlePageChange, handlePageSizeChange} = usePagination();
    // const {gqlFilters, filtersValues, onFilterChange} = useHistoryFilters({onFilterChange: resetPage}); //TODO: Use similar hook as for history
    const {data, total, loading, error} = useGetAutomationRulesData({currentPage, pageSize, filters: undefined}); //TODO: Add filters from above hook
    // const {isOpen, selectedRecord, openDetails, closeDetails} = useAutomationDetails();  //TODO: Use similar hook as for history, but for automation

    const handleRowClick = (record: AutomationRulesData) => {
        navigate(`${AdminAbsolutePaths.automation}/edit/${record.id}`);
    };

    if (error) {
        return <Navigate to={AdminAbsolutePaths.notFound} />;
    }

    return (
        <>
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
        </>
    );
};
