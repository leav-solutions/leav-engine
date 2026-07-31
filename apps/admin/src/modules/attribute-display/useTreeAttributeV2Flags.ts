import {ENABLE_TREE_ATTRIBUTE_V2_FORM, ENABLE_TREE_ATTRIBUTE_V2_MODAL} from '@leav/utils';
import {useCurrentApplicationContext} from '../../context/CurrentApplicationContext';

/**
 * Global settings are already loaded by the application context, so no extra query is needed here.
 * Both flags default to `false`, which keeps the V1 behaviour and hides the selection tab.
 */
export const useTreeAttributeV2Flags = (): {isFormV2Enabled: boolean; isModalV2Enabled: boolean} => {
    const {globalSettings} = useCurrentApplicationContext();
    const settings = globalSettings?.settings;

    return {
        isFormV2Enabled: Boolean(settings?.[ENABLE_TREE_ATTRIBUTE_V2_FORM]),
        isModalV2Enabled: Boolean(settings?.[ENABLE_TREE_ATTRIBUTE_V2_MODAL]),
    };
};
