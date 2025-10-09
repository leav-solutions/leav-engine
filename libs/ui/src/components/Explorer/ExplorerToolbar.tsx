// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ReactNode, type FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerFiltersAndSorts} from './ExplorerFiltersAndSorts';
import styled from 'styled-components';

const ExplorerToolbarListStyled = styled.ul`
    padding: calc(var(--general-spacing-xs) * 1px);
    margin: 0;
    margin-bottom: calc(var(--general-spacing-s) * 1px);
    background: var(--general-colors-neutral-grey-100);
    border-radius: calc(var(--general-border-radius-s) * 1px);
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-self: center;
    overflow: auto;
    align-items: center;
    gap: calc(var(--general-spacing-xxs) * 1px);
    white-space: nowrap;
    min-height: 26px; // height of the filter chip
    width: 100%;
    justify-content: space-between;

    &.headless {
        margin-bottom: 0;
    }
`;

const Section = styled.div`
    display: flex;
    align-items: center;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

export const ExplorerToolbar: FunctionComponent<{
    isMassSelectionAll: boolean;
    showFilters: boolean;
    showSorts: boolean;
    headless: boolean;
    selectAllButton: ReactNode | null;
    viewSettingsLoading: boolean;
}> = ({isMassSelectionAll, showFilters, showSorts, headless, selectAllButton, viewSettingsLoading, children}) => {
    const {t} = useSharedTranslation();

    return (
        <ExplorerToolbarListStyled aria-label={t('explorer.toolbar')} className={headless ? 'headless' : ''}>
            <Section>
                {!viewSettingsLoading && (
                    <ExplorerFiltersAndSorts
                        selectAllButton={selectAllButton}
                        showFilters={showFilters}
                        showSorts={showSorts}
                        isMassSelectionAll={isMassSelectionAll}
                    />
                )}
            </Section>
            <Section>{children}</Section>
        </ExplorerToolbarListStyled>
    );
};
