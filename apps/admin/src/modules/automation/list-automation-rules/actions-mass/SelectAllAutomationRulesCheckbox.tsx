import {KitCheckbox} from 'aristid-ds';
import {TotalResult} from '../../../ui/toolbar/total-result/TotalResult';

type SelectAllAutomationRulesCheckboxProps = {
    total: number;
    selectedCount: number;
    loading: boolean;
    onSelectAll: () => void;
    onClearSelection: () => void;
};

export const SelectAllAutomationRulesCheckbox = ({
    total,
    selectedCount,
    loading,
    onSelectAll,
    onClearSelection,
}: SelectAllAutomationRulesCheckboxProps) => {
    const isAllSelected = total > 0 && selectedCount >= total;
    const isPartiallySelected = selectedCount > 0 && selectedCount < total;

    return (
        <KitCheckbox
            aria-checked={isPartiallySelected ? 'mixed' : isAllSelected ? 'true' : 'false'}
            indeterminate={isPartiallySelected}
            checked={isAllSelected}
            disabled={loading || total === 0}
            onChange={() => (isAllSelected ? onClearSelection() : onSelectAll())}
        >
            <TotalResult loading={loading} total={total} />
        </KitCheckbox>
    );
};
