import {useTranslation} from 'react-i18next';
import {type MultiDisplayOption, useSaveAttributeMutation} from '../../../_gqlTypes';
import {displaySaveErrorAlert} from '../displaySaveErrorAlert';

export type DisplayOptionField = 'multi_link_display_option' | 'multi_tree_display_option';

/**
 * `multi_link_display_option` / `multi_tree_display_option` are root fields of the attribute, not
 * fields of `tree_selection_conf`: they need their own mutation, sending nothing else so that no
 * neighbouring field is overwritten.
 */
export const useSaveDisplayOption = (attributeId: string, field: DisplayOptionField) => {
    const {t} = useTranslation();
    const [saveAttribute, {loading}] = useSaveAttributeMutation();

    const saveDisplayOption = async (displayOption: MultiDisplayOption): Promise<boolean> => {
        try {
            const {errors} = await saveAttribute({
                variables: {attrData: {id: attributeId, [field]: displayOption}},
            });

            if (errors) {
                displaySaveErrorAlert(t('attributes.display.display_option_save_error'), errors[0].message);
                return false;
            }

            return true;
        } catch (error) {
            displaySaveErrorAlert(
                t('attributes.display.display_option_save_error'),
                error instanceof Error ? error.message : String(error),
            );
            return false;
        }
    };

    return {saveDisplayOption, loading};
};
