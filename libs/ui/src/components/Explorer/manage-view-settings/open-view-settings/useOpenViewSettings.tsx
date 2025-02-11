// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import {FaSlidersH} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SettingsPanel} from '../router-menu/SettingsPanel';
import {useEditSettings} from './useEditSettings';
import {SettingsPanelPages} from './EditSettingsContext';

interface IChangePanelPage {
    pageName: SettingsPanelPages;
    title: string;
    onClickLeftButton?: () => void;
}

export const useOpenViewSettings = (library: string) => {
    const {activeSettings, setActiveSettings} = useEditSettings();

    const {t} = useSharedTranslation();

    const rootPanel = {pageName: 'router-menu', title: t('explorer.settings')} as const;

    const _changePanelPage = ({pageName, title, onClickLeftButton}: IChangePanelPage) => {
        setActiveSettings({
            ...activeSettings!,
            content: <SettingsPanel library={library} page={pageName} />,
            title,
            onClickLeftButton
        });
    };

    const _openSettingsPanel = (pageName: SettingsPanelPages = 'router-menu') => {
        const chanelPageParams: IChangePanelPage = {
            pageName,
            title: t(`explorer.${pageName}`)
        };
        if (pageName !== rootPanel.pageName) {
            chanelPageParams.onClickLeftButton = () => {
                _changePanelPage(rootPanel);
            };
        }

        _changePanelPage(chanelPageParams);
    };

    return {
        openSettingsPanel: _openSettingsPanel,
        viewSettingsButton: (
            <KitButton
                type="secondary"
                icon={<FaSlidersH />}
                onClick={() => _openSettingsPanel()}
                title={String(t('explorer.settings')) /* TODO: avoid transform null to 'null' */}
            />
        )
    };
};
