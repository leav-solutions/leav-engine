// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {FaSlidersH} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SettingsPanel} from './SettingsPanel';
import {useEditSettings} from './useEditSettings';

export const useOpenSettings = (library: string) => {
    const {setActiveSettings} = useEditSettings();
    const {t} = useSharedTranslation();

    const _openSettingsPanel = () =>
        setActiveSettings({
            content: <SettingsPanel library={library} />,
            title: t('explorer.settings')
        });

    return (
        <KitButton
            type="tertiary"
            color="neutral"
            icon={<FaSlidersH />}
            onClick={_openSettingsPanel}
            title={String(t('explorer.settings')) /* TODO: avoid transform null to 'null' */}
        />
    );
};
