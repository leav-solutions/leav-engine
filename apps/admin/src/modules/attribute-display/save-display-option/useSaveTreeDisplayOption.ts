import {useTranslation} from 'react-i18next';
import {type MultiDisplayOption, useSaveAttributeMutation} from '../../../_gqlTypes';
import {displaySaveErrorAlert} from '../displaySaveErrorAlert';

/**
 * `multi_tree_display_option` is a root field of the attribute, not a field of `tree_selection_conf`:
 * it needs its own mutation, sending nothing else so that no neighbouring field is overwritten.
 */
export const useSaveTreeDisplayOption = (attributeId: string) => {
    const {t} = useTranslation();
    const [saveAttribute, {loading}] = useSaveAttributeMutation();

    const saveTreeDisplayOption = async (displayOption: MultiDisplayOption): Promise<boolean> => {
        try {
            const {errors} = await saveAttribute({
                variables: {attrData: {id: attributeId, multi_tree_display_option: displayOption}},
            });

            if (errors) {
                displaySaveErrorAlert(t('attributes.tree_selection.display_option_save_error'), errors[0].message);
                return false;
            }

            return true;
        } catch (error) {
            displaySaveErrorAlert(
                t('attributes.tree_selection.display_option_save_error'),
                error instanceof Error ? error.message : String(error),
            );
            return false;
        }
    };

    return {saveTreeDisplayOption, loading};
};
