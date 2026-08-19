import {useTranslation} from 'react-i18next';
import {useSaveAttributeMutation} from '../../../_gqlTypes';
import {displaySaveErrorAlert} from '../displaySaveErrorAlert';

/**
 * `column_split_enabled` is a root field of the attribute (LEAVC-1075): it needs its own mutation,
 * sending nothing else so that no neighbouring field is overwritten.
 */
export const useSaveColumnSplit = (attributeId: string) => {
    const {t} = useTranslation();
    const [saveAttribute, {loading}] = useSaveAttributeMutation();

    const saveColumnSplit = async (columnSplitEnabled: boolean): Promise<boolean> => {
        try {
            const {errors} = await saveAttribute({
                variables: {attrData: {id: attributeId, column_split_enabled: columnSplitEnabled}},
            });

            if (errors) {
                displaySaveErrorAlert(t('attributes.display.column_split_save_error'), errors[0].message);
                return false;
            }

            return true;
        } catch (error) {
            displaySaveErrorAlert(
                t('attributes.display.column_split_save_error'),
                error instanceof Error ? error.message : String(error),
            );
            return false;
        }
    };

    return {saveColumnSplit, loading};
};
