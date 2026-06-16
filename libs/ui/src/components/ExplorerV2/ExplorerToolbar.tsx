import {type ReactNode, type FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerFiltersAndSorts} from './ExplorerFiltersAndSorts';
import styled from 'styled-components';

const ExplorerToolbarListStyled = styled.ul`
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-xs) * 1px)
        calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-s) * 1px);
    margin: 0;
    margin-bottom: calc(var(--general-spacing-s) * 1px);
    background: var(--general-colors-neutral-grey-100);
    border-radius: calc(var(--general-border-radius-s) * 1px);
    list-style: none;
    display: flex;
    overflow: auto;
    align-items: center;
    gap: calc(var(--general-spacing-xxs) * 1px);
    white-space: nowrap;
    min-height: 26px; // height of the filter chip
    justify-content: space-between;

    &.headless {
        margin-bottom: 0;
    }

    & > div:last-of-type {
        flex-shrink: 0;
        align-self: start;
    }
`;

const Section = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

export const ExplorerToolbar: FunctionComponent<{
    isMassSelectionAll: boolean;
    showFilters: boolean;
    showSorts: boolean;
    headless: boolean;
    canRemoveFilters: boolean;
    selectAllButton: ReactNode | null;
    viewSettingsLoading: boolean;
}> = ({
    isMassSelectionAll,
    showFilters,
    showSorts,
    headless,
    canRemoveFilters,
    selectAllButton,
    viewSettingsLoading,
    children,
}) => {
    const {t} = useSharedTranslation();

    return (
        <ExplorerToolbarListStyled aria-label={t('explorer.toolbar')} className={headless ? 'headless' : ''}>
            <Section>
                {!viewSettingsLoading && (
                    <ExplorerFiltersAndSorts
                        selectAllButton={selectAllButton}
                        showFilters={showFilters}
                        showSorts={showSorts}
                        canRemoveFilters={canRemoveFilters}
                        isMassSelectionAll={isMassSelectionAll}
                    />
                )}
            </Section>
            <Section>{children}</Section>
        </ExplorerToolbarListStyled>
    );
};
