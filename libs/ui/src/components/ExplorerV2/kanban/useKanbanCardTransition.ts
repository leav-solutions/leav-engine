import {KitAlert} from 'aristid-ds';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {APICallStatus} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ERROR_ALERT_DURATION} from '_ui/constants';
import {type IItemData} from '../_types';
import {type IKanbanColumn} from '../grouping/_types';

/**
 * Writes a card's kanban transition: dropping on a node column saves that node as the new axis value
 * (mono-valued attribute: the engine replaces the existing value, no id_value needed); dropping on the
 * "no value" column (nodeId `null`) clears it via `deleteEmpty`. Every failure — contextual permission
 * refusals included — comes back as a non-SUCCESS status (no throw), reported through an alert so the
 * caller only has to roll its optimistic move back.
 */
export const useKanbanCardTransition = ({
    groupByAttributeId,
}: {
    groupByAttributeId: string;
}): {
    moveCard: (params: {card: IItemData; targetColumn: IKanbanColumn}) => Promise<boolean>;
} => {
    const {t} = useSharedTranslation();
    const {saveValues} = useSaveValueBatchMutation();

    return {
        moveCard: async ({card, targetColumn}) => {
            const isClearingValue = targetColumn.nodeId === null;

            const result = await saveValues(
                {id: card.itemId, library: {id: card.libraryId}},
                [{attribute: groupByAttributeId, idValue: null, value: targetColumn.nodeId}],
                undefined,
                isClearingValue,
            );

            if (result.status !== APICallStatus.SUCCESS) {
                KitAlert.error({
                    showIcon: true,
                    duration: ERROR_ALERT_DURATION,
                    message: t('error.error_occurred'),
                    description: result.error ?? t('explorer.kanban.transition-error'),
                    closable: true,
                });
                return false;
            }

            return true;
        },
    };
};
