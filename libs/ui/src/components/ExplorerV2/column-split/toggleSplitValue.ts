import {KitAlert} from 'aristid-ds';
import {APICallStatus, type FieldSubmitMultipleFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ERROR_ALERT_DURATION} from '_ui/constants';
import {type AttributeProperties, type IItemData} from '../_types';
import {type IColumnSplitOption} from './_types';
import {findValueIdForKey} from './getValueKeys';

interface IToggleSplitValueParams {
    item: IItemData;
    attribute: AttributeProperties;
    option: IColumnSplitOption;
    checked: boolean;
    /** Option keys currently set on this record — already merged with the optimistic overlay, used to
     *  compute the EXPECTED next state (D2 exclusivity on a mono non-required attribute). */
    selectedKeys: string[];
    setOptimisticKeys: (item: IItemData, attributeId: string, keys: string[]) => void;
    clearOptimisticKeys: (item: IItemData, attributeId: string) => void;
    /** Hoisted to `TableView` rather than obtained from `useSaveValueBatchMutation` here: this used to be
     *  a hook, which meant one Apollo mutation instance PER CELL (25 rows × N sub-columns), all
     *  re-rendered on every `TableView` render — for a function that holds no state of its own. */
    saveValues: FieldSubmitMultipleFunc;
    t: ReturnType<typeof useSharedTranslation>['t'];
}

/**
 * Writes one split-cell toggle, decalqued on `useKanbanCardTransition`: the optimistic overlay is set
 * BEFORE the call, rolled back (overlay entry dropped) + `KitAlert.error` on refusal. Never a manual
 * `refetch()` — `useWatchLibraryRecordUpdates` (see `useExplorerData`) refreshes the touched record in
 * place, and the reconciliation effect in `useOptimisticSplitValues` drops the overlay entry once that
 * fresh data confirms the write.
 *
 * - Check (any cardinality): single write, `value: option.rawValue`. On a mono attribute the engine
 *   replaces the existing value by itself (D2) — no separate "uncheck the old one" call.
 * - Uncheck, multivalued: needs the `id_value` of THIS value among possibly several (`findValueIdForKey`
 *   on the record's raw properties, not the optimistic overlay — only real saved values have a real
 *   `id_value`). No `id_value` found = nothing to write, see below.
 * - Uncheck, mono: `idValue: null`, the engine finds the single value on its own.
 */
export const toggleSplitValue = async ({
    item,
    attribute,
    option,
    checked,
    selectedKeys,
    setOptimisticKeys,
    clearOptimisticKeys,
    saveValues,
    t,
}: IToggleSplitValueParams): Promise<void> => {
    const isMultiple = Boolean(attribute.multiple_values);
    // Unchecking only drops THIS option: on a multivalued attribute the row's other checked values
    // stay, and an expected set of `[]` would never reconcile against them (the overlay entry would
    // stick and keep them visually unchecked forever). On a mono attribute the filter yields `[]`.
    const nextKeys = checked
        ? isMultiple
            ? [...selectedKeys, option.key]
            : [option.key]
        : selectedKeys.filter(key => key !== option.key);

    // Read on the RECORD's own (server) data, never on the optimistic overlay: only a value that is
    // really saved has an `id_value`.
    const idValue =
        !checked && isMultiple ? findValueIdForKey(item.propertiesById[attribute.id], attribute, option.key) : null;

    if (!checked && isMultiple && idValue === null) {
        return;
    }

    setOptimisticKeys(item, attribute.id, nextKeys);

    const record = {id: item.itemId, library: {id: item.libraryId}};
    const result = checked
        ? await saveValues(record, [{attribute: attribute.id, idValue: null, value: option.rawValue}])
        : await saveValues(
              record,
              [{attribute: attribute.id, idValue, value: null}],
              undefined,
              true /* deleteEmpty */,
          );

    if (result.status !== APICallStatus.SUCCESS) {
        clearOptimisticKeys(item, attribute.id);
        KitAlert.error({
            showIcon: true,
            duration: ERROR_ALERT_DURATION,
            message: t('error.error_occurred'),
            description: result.error ?? t('explorer.column_split.save_error'),
            closable: true,
        });
    }
};
