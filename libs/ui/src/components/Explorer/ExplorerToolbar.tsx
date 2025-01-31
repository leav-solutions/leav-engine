// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitButton, KitDivider, KitFilter, KitSpace} from 'aristid-ds';
import {FaTrash} from 'react-icons/fa';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SortOrder} from '_ui/_gqlTypes';
import {useViewSettingsContext} from './manage-view-settings/store-view-settings/useViewSettingsContext';
import {CommonFilterItem} from './manage-view-settings/_shared/CommonFilterItem';
import {useAttributeDetailsData} from './manage-view-settings/_shared/useAttributeDetailsData';
import {useOpenViewSettings} from './manage-view-settings';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const ExplorerToolbarListStyled = styled.ul`
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-xxs) * 1px)
        calc(var(--general-spacing-m) * 1px) calc(var(--general-spacing-xxs) * 1px);
    margin: 0;
    list-style: none;
    display: flex;
    overflow: auto;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    white-space: nowrap;
`;

const DividerStyled = styled(KitDivider)`
    height: 2em;
`;

export const ExplorerToolbar: FunctionComponent<{
    libraryId: string;
    isMassSelectionAll: boolean;
}> = ({libraryId, isMassSelectionAll, children}) => {
    const {t} = useSharedTranslation();

    const {
        view: {filters, sort}
    } = useViewSettingsContext();

    const {openSettingsPanel} = useOpenViewSettings(libraryId);

    const {attributeDetailsById} = useAttributeDetailsData(libraryId);

    if (filters.length === 0 && sort.length === 0 && children === null) {
        return null;
    }

    const sortValues =
        sort.length === 0
            ? undefined
            : sort.map(
                  ({field, order}) =>
                      (attributeDetailsById?.[field]?.label ?? field) +
                      ' ' +
                      (order === SortOrder.asc ? t('explorer.sort-ascending') : t('explorer.sort-descending'))
              );

    const _handleClickOnSort: ComponentProps<typeof FilterStyled>['onClick'] = () =>
        isMassSelectionAll ? undefined : () => openSettingsPanel('sort-items');

    return (
        <ExplorerToolbarListStyled aria-label={t('explorer.toolbar')}>
            {children !== null && (
                <>
                    <li>{children}</li>
                    {filters.length !== 0 && <DividerStyled type="vertical" />}
                </>
            )}
            {filters.length > 0 && (
                <>
                    <KitSpace size="s">
                        {filters.map(filter => (
                            <li key={filter.id}>
                                <CommonFilterItem key={filter.id} filter={filter} disabled={isMassSelectionAll} />
                            </li>
                        ))}
                    </KitSpace>
                    {sort.length > 0 && <DividerStyled type="vertical" />}
                </>
            )}
            {sort.length > 0 && (
                <>
                    <li>
                        <FilterStyled
                            label={t('explorer.sort-items')}
                            values={sortValues}
                            disabled={isMassSelectionAll}
                            onClick={_handleClickOnSort}
                        />
                    </li>
                    <DividerStyled type="vertical" />
                </>
            )}
            <li>
                <FilterStyled
                    as={KitButton}
                    type="secondary"
                    size="s"
                    danger
                    icon={<FaTrash />}
                    disabled={true /* TODO: why? */}
                >
                    {t('explorer.reset-view')}
                </FilterStyled>
            </li>
        </ExplorerToolbarListStyled>
    );
};
