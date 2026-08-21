import {type ComponentProps, type FunctionComponent, useRef, useState} from 'react';
import styled from 'styled-components';
import {AntFlex, KitButton, KitDivider, KitSwitch, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FilterDropdownContent} from './FilterDropdownContent';
import {useFiltersContext} from '../../useFiltersContext';
import {FiltersActionTypes} from '../../context/filtersReducer';
import {isUIFilterTree, type IUIFilterDropDownProps, type UIFilter} from '../../_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClockRotateLeft, faTrash} from '@fortawesome/free-solid-svg-icons';

const FilterDropDownStyledDiv = styled.div`
    max-height: 600px;
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

const ShowHiddenToggleWrapper = styled(AntFlex)`
    gap: calc(var(--general-spacing-xs) * 1px);
    padding: 0 calc(var(--general-spacing-xs) * 1px);
`;

export const FilterDropDown: FunctionComponent<IUIFilterDropDownProps> = ({filter, canReset, canRemove}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useFiltersContext();
    const selectDropDownRef = useRef<HTMLDivElement>(null);

    // Ref populated by TreeAttributeDropDown with its toggle handler (cleanup of hidden selections included)
    const toggleHiddenRef = useRef<((checked: boolean) => void) | null>(null);

    // Driven by TreeAttributeDropDown once tree data is loaded: true only if permissions are configured
    const [showTreeToggle, setShowTreeToggle] = useState(false);

    const onFilterChange: ComponentProps<typeof FilterDropdownContent>['onFilterChange'] = (filterData: UIFilter) =>
        dispatch({
            type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData,
        });

    const _onResetFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: FiltersActionTypes.RESET_FILTER,
            payload: {
                id: filter.id,
            },
        });

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: FiltersActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id,
            },
        });

    const isTreeFilter = isUIFilterTree(filter);
    const includeHiddenOptions = isTreeFilter ? (filter.includeHiddenOptions ?? false) : false;

    return (
        <FilterDropDownStyledDiv>
            <FilterDropdownContent
                filter={filter}
                onFilterChange={onFilterChange}
                selectDropDownRef={selectDropDownRef}
                toggleHiddenRef={isTreeFilter ? toggleHiddenRef : undefined}
                onPermissionConfiguredChange={isTreeFilter ? setShowTreeToggle : undefined}
            />
            <div ref={selectDropDownRef} />
            <KitDivider noMargin />
            {canReset && (
                <KitButton type="action" icon={<FontAwesomeIcon icon={faClockRotateLeft} />} onClick={_onResetFilter}>
                    {t('global.reset')}
                </KitButton>
            )}
            {canRemove && (
                <KitButton type="action" icon={<FontAwesomeIcon icon={faTrash} />} onClick={_onDeleteFilter} danger>
                    {t('global.delete')}
                </KitButton>
            )}
            {isTreeFilter && showTreeToggle && (
                <ShowHiddenToggleWrapper align="center" justify="space-between">
                    <KitTypography.Text size="fontSize5">{t('filters.show-hidden-options')}</KitTypography.Text>
                    <KitSwitch
                        checked={includeHiddenOptions}
                        onChange={checked => toggleHiddenRef.current?.(checked)}
                    />
                </ShowHiddenToggleWrapper>
            )}
        </FilterDropDownStyledDiv>
    );
};
