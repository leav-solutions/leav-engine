import {KitEmpty, KitSpace} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import styled from 'styled-components';

const NoProfilesSpacer = styled(KitSpace)`
    justify-content: center;
    width: 100%;
    height: 100%;
`;

export const NoProfiles = () => {
    const {t} = useSharedTranslation();

    return (
        <NoProfilesSpacer direction="vertical" size="m">
            <KitEmpty
                image={KitEmpty.ASSET_LIST}
                title={t('explorer.export_profile_modal.no_profiles')}
                description={t('explorer.export_profile_modal.contact_admin')}
            />
        </NoProfilesSpacer>
    );
};
