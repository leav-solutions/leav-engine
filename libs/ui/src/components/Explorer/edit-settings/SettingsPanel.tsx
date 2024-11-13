// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {FunctionComponent, useState} from 'react';
import {KitTypography} from 'aristid-ds';
import {FaFilter, FaList, FaSortAlphaDown} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {DisplayMode} from './DisplayMode';
import {SettingItem} from './SettingItem';
import {useEditSettings} from './useEditSettings';

export type SettingsPanelPages = 'view-configuration' | 'display-mode';

const ContentWrapperStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-s) * 1px);
`;

const ConfigurationStyledMenu = styled.menu`
    padding: 0;
`;

interface ISettingsPanelProps {
    library: string;
}

export const SettingsPanel: FunctionComponent<ISettingsPanelProps> = ({library}) => {
    const {t} = useSharedTranslation();

    const {setActiveSettings, activeSettings} = useEditSettings();

    const [currentPage, setCurrentPage] = useState<SettingsPanelPages>('view-configuration');

    const _goToAdvancedSettingsPage = (page: SettingsPanelPages) => {
        if (!activeSettings) {
            throw Error('Should not be able to change side pane page if there is no side panel!');
        }

        const _changePanelPage = ({
            pageName,
            title,
            onClickLeftButton
        }: {
            pageName: SettingsPanelPages;
            title: string;
            onClickLeftButton?: () => void;
        }) => {
            setCurrentPage(pageName);
            setActiveSettings({
                ...activeSettings!,
                title,
                onClickLeftButton
            });
        };

        _changePanelPage({
            pageName: page,
            title: t(`explorer.${page}`),
            onClickLeftButton: () => {
                const rootPanel = {pageName: 'view-configuration', title: t('explorer.settings')} as const;
                _changePanelPage(rootPanel);
            }
        });
    };

    // TODO: look for MemoryRouter

    return (
        <ContentWrapperStyledDiv>
            {currentPage === 'view-configuration' && (
                <nav>
                    <KitTypography.Title level="h4">{t('explorer.view-configuration')}</KitTypography.Title>
                    <ConfigurationStyledMenu>
                        <SettingItem
                            icon={<FaList />}
                            title={t('explorer.display-mode')}
                            onClick={() => _goToAdvancedSettingsPage('display-mode')}
                        />
                        <SettingItem
                            icon={<FaFilter />}
                            title={t('explorer.filters')}
                            onClick={() => {
                                /* TODO: not implemented yet */
                            }}
                        />
                        <SettingItem
                            icon={<FaSortAlphaDown />}
                            title={t('explorer.sort')}
                            onClick={() => {
                                /* TODO: not implemented yet */
                            }}
                        />
                    </ConfigurationStyledMenu>
                </nav>
            )}
            {currentPage === 'display-mode' && <DisplayMode library={library} />}
        </StyledSettingsPanelContent>
    );
};
