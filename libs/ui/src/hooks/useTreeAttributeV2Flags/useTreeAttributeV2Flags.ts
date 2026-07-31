import {ENABLE_TREE_ATTRIBUTE_V2_FORM, ENABLE_TREE_ATTRIBUTE_V2_MODAL} from '@leav/utils';
import {useGlobalSettingsFlagsQuery} from '_ui/_gqlTypes';

export interface IUseTreeAttributeV2Flags {
    loading: boolean;
    isFormV2Enabled: boolean;
    isModalV2Enabled: boolean;
}

/**
 * Feature flags of the "tree attribute selection" epic (LEAVC-996), read from
 * `globalSettings.settings`.
 *
 * `cache-first` is essential: the hook is called once per tree field of a form, and a single network
 * request must result from it.
 *
 * `loading` is exposed so callers can gate rendering until the flags are resolved: while loading,
 * both flags are `false`, but rendering the V1 components on that transient value then flipping to
 * V2 once the response arrives would remount them (lost local state, effects replayed).
 */
export const useTreeAttributeV2Flags = (): IUseTreeAttributeV2Flags => {
    const {data, loading} = useGlobalSettingsFlagsQuery({fetchPolicy: 'cache-first'});
    const settings = data?.globalSettings?.settings;

    return {
        loading,
        isFormV2Enabled: Boolean(settings?.[ENABLE_TREE_ATTRIBUTE_V2_FORM]),
        isModalV2Enabled: Boolean(settings?.[ENABLE_TREE_ATTRIBUTE_V2_MODAL]),
    };
};
