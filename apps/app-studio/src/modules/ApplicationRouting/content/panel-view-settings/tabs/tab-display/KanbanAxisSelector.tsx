import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {KitSelect, KitTypography} from 'aristid-ds';
import {useLang, isValidGroupingAxis} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useGetViewSettingsLibraryAttributesQuery} from '../../../../../../__generated__';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {section} from './kanbanAxisSelector.module.css';

/**
 * Kanban axis picker: designates which attribute drives the columns. Candidates are ALL the library's
 * attributes eligible as a grouping axis per ADR-007 (`isValidGroupingAxis` from @leav/ui — a finite
 * value set: a tree, or a closed values list). Not limited to attributes already displayed as columns:
 * picking one that is not yet a column appends it as a hidden column (handled by the reducer) so it can
 * carry the `isGroupBy` marker. Attributes are fetched from the library (same query as the admin gear →
 * shared Apollo cache).
 */
export const KanbanAxisSelector = () => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, groupByAttributeId, setGroupByAttribute} = useCurrentView();
    const libraryId = view?.library;

    const {data} = useGetViewSettingsLibraryAttributesQuery({
        skip: !libraryId,
        variables: {libraryId: libraryId ?? ''},
    });

    const axisAttributes = useMemo(
        () =>
            (data?.libraries?.list?.[0]?.attributes ?? []).filter(attribute =>
                isValidGroupingAxis({
                    type: attribute.type,
                    values_list: 'values_list' in attribute ? attribute.values_list : undefined,
                }),
            ),
        [data],
    );

    const options = useMemo(
        () =>
            axisAttributes.map(attribute => ({
                value: attribute.id,
                label: attribute.label ? localizedTranslation(attribute.label, lang) : attribute.id,
            })),
        [axisAttributes, lang],
    );

    const handleChange = (attributeId?: string) => {
        const attribute = axisAttributes.find(({id}) => id === attributeId);
        setGroupByAttribute(attribute ? {id: attribute.id, label: attribute.label} : null);
    };

    return (
        <section className={section}>
            <KitTypography.Text weight="bold" size="fontSize5">
                {t('view_settings.display.axis.title')}
            </KitTypography.Text>
            {options.length === 0 ? (
                <KitTypography.Text size="fontSize3">{t('view_settings.display.axis.no_eligible')}</KitTypography.Text>
            ) : (
                <KitSelect
                    placeholder={t('view_settings.display.axis.placeholder')}
                    options={options}
                    value={groupByAttributeId ?? undefined}
                    onChange={handleChange}
                    allowClear
                />
            )}
        </section>
    );
};
