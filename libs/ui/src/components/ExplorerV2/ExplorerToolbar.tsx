import {type ReactNode, type FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerFilters} from './ExplorerFilters';
import styled from 'styled-components';

const ExplorerToolbarListStyled = styled.ul`
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-xs) * 1px)
        calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-s) * 1px);
    margin: 0;
    margin-bottom: calc(var(--general-spacing-s) * 1px);
    background: var(--general-colors-neutral-grey-50);
    border-radius: calc(var(--general-border-radius-s) * 1px);
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    /* Without this, the flex column parent (height: 100%, overflow: hidden) can shrink this bar
       below its wrapped content's natural height once the data area below claims space. */
    flex-shrink: 0;
    align-items: center;
    gap: calc(var(--general-spacing-xxs) * 1px);
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
    pinnedFilterIds: Set<string>;
    headless: boolean;
    canRemoveFilters: boolean;
    selectAllButton: ReactNode | null;
    viewSettingsLoading: boolean;
    children?: ReactNode;
}> = ({
    isMassSelectionAll,
    showFilters,
    pinnedFilterIds,
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
                    <ExplorerFilters
                        selectAllButton={selectAllButton}
                        showFilters={showFilters}
                        pinnedFilterIds={pinnedFilterIds}
                        canRemoveFilters={canRemoveFilters}
                        isMassSelectionAll={isMassSelectionAll}
                    />
                )}
            </Section>
            <Section>{children}</Section>
        </ExplorerToolbarListStyled>
    );
};
