import {useRef} from 'react';
import {type CheckboxChangeEvent} from 'antd/es/checkbox';
import {KitCheckbox, KitRadio} from 'aristid-ds';
import {type FieldSubmitMultipleFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type AttributeProperties, type IItemData} from '../_types';
import {type IColumnSplitOption} from './_types';
import {toggleSplitValue} from './toggleSplitValue';
import {columnSplitCellControl} from './columnSplit.module.css';

interface IColumnSplitCellProps {
    item: IItemData;
    attribute: AttributeProperties;
    option: IColumnSplitOption;
    /** Option keys currently set on this record — already merged with the optimistic overlay. */
    selectedKeys: string[];
    disabled: boolean;
    setOptimisticKeys: (item: IItemData, attributeId: string, keys: string[]) => void;
    clearOptimisticKeys: (item: IItemData, attributeId: string) => void;
    /** Write dependencies, resolved once in `TableView` and threaded down: this component is rendered
     *  once per row × sub-column, so calling the hooks here multiplied them by as many cells. */
    saveValues: FieldSubmitMultipleFunc;
    t: ReturnType<typeof useSharedTranslation>['t'];
}

export const ColumnSplitCell = ({
    item,
    attribute,
    option,
    selectedKeys,
    disabled,
    setOptimisticKeys,
    clearOptimisticKeys,
    saveValues,
    t,
}: IColumnSplitCellProps) => {
    const isWritingRef = useRef(false);

    const toggle = async (checked: boolean) => {
        if (isWritingRef.current) {
            return;
        }
        isWritingRef.current = true;
        try {
            await toggleSplitValue({
                item,
                attribute,
                option,
                checked,
                selectedKeys,
                setOptimisticKeys,
                clearOptimisticKeys,
                saveValues,
                t,
            });
        } finally {
            isWritingRef.current = false;
        }
    };

    const isChecked = selectedKeys.includes(option.key);

    const isExclusiveRadio = !attribute.multiple_values && attribute.required;

    return (
        <span className={columnSplitCellControl}>
            {isExclusiveRadio ? (
                <KitRadio
                    name={`${item.itemId}__${attribute.id}`}
                    checked={isChecked}
                    disabled={disabled}
                    onChange={() => toggle(true)}
                    aria-label={option.label}
                />
            ) : (
                <KitCheckbox
                    checked={isChecked}
                    disabled={disabled}
                    onChange={(event: CheckboxChangeEvent) => toggle(event.target.checked)}
                    aria-label={option.label}
                />
            )}
        </span>
    );
};
