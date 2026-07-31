import {useTranslation} from 'react-i18next';
import {type TreeSelectionConfInput, useSaveAttributeMutation} from '../../../_gqlTypes';
import {displaySaveErrorAlert} from '../displaySaveErrorAlert';

export const useSaveTreeSelectionConf = (attributeId: string) => {
    const {t} = useTranslation();
    const [saveAttribute, {loading}] = useSaveAttributeMutation();

    /**
     * The whole configuration is sent on every change: `saveAttribute` replaces `tree_selection_conf`
     * as a whole, it does not merge it field by field.
     */
    const saveTreeSelectionConf = async (conf: TreeSelectionConfInput): Promise<boolean> => {
        try {
            const {errors} = await saveAttribute({
                variables: {attrData: {id: attributeId, tree_selection_conf: conf}},
            });

            if (errors) {
                displaySaveErrorAlert(t('attributes.tree_selection.save_error'), errors[0].message);
                return false;
            }

            return true;
        } catch (error) {
            displaySaveErrorAlert(
                t('attributes.tree_selection.save_error'),
                error instanceof Error ? error.message : String(error),
            );
            return false;
        }
    };

    return {saveTreeSelectionConf, loading};
};
