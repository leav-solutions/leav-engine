import {KitEmpty, KitSpace} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {profilesSpacer} from './NoProfiles.module.css';

export const NoProfiles = () => {
    const {t} = useSharedTranslation();

    return (
        <KitSpace className={profilesSpacer} direction="vertical" size="m">
            <KitEmpty
                image={KitEmpty.ASSET_LIST}
                title={t('explorer.export_profile_modal.no_profiles')}
                description={t('explorer.export_profile_modal.contact_admin')}
            />
        </KitSpace>
    );
};
