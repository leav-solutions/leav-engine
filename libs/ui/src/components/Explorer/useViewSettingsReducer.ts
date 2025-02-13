// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ExplorerLinkAttributeQuery,
    LinkAttributeDetailsFragment,
    RecordFilterCondition,
    useExplorerAttributesQuery,
    useExplorerLinkAttributeQuery,
    useGetViewsListQuery,
    ViewDetailsFilterFragment
} from '_ui/_gqlTypes';
import {localizedTranslation, Override} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {useEffect, useMemo, useReducer, useState} from 'react';
import {
    DefaultViewSettings,
    Entrypoint,
    ExplorerFilter,
    IEntrypointLink,
    IExplorerFilterLink,
    IExplorerFilterStandard,
    IExplorerFilterThrough
} from './_types';
import {v4 as uuid} from 'uuid';
import {
    IViewSettingsState,
    useEditSettings,
    viewSettingsInitialState,
    viewSettingsReducer
} from './manage-view-settings';
import {mapViewTypeFromLegacyToExplorer} from './_constants';
import {ThroughConditionFilter} from '_ui/types';
import {isLinkAttribute, isStandardAttribute} from '_ui/_utils/attributeType';

type ValidFieldFilter = Override<
    ViewDetailsFilterFragment,
    {
        field: NonNullable<ViewDetailsFilterFragment['field']>;
        condition: NonNullable<ViewDetailsFilterFragment['condition']>;
    }
>;

type ValidFieldFilterThrough = Override<
    ValidFieldFilter,
    {
        condition: ThroughConditionFilter.THROUGH;
    }
> & {
    subField: NonNullable<ViewDetailsFilterFragment['field']>;
    subCondition?: ViewDetailsFilterFragment['condition'];
};

const _isValidFieldFilter = (filter: ViewDetailsFilterFragment | ExplorerFilter): filter is ValidFieldFilter =>
    !!filter.field;

const _isValidFieldFilterThrough = (
    filter: ValidFieldFilter | ValidFieldFilterThrough
): filter is ValidFieldFilterThrough =>
    filter.condition === ThroughConditionFilter.THROUGH && !!filter.subCondition && !!filter.subField;

const _isLinkAttributeDetails = (
    linkAttributeData: NonNullable<ExplorerLinkAttributeQuery['attributes']>['list'][number]
): linkAttributeData is LinkAttributeDetailsFragment & {id: string; multiple_values: boolean} =>
    'linked_library' in linkAttributeData;

const _entrypointsAreEqual = (entrypoint1, entrypoint2) =>
    Object.keys(entrypoint1).every(key => entrypoint1[key] === entrypoint2[key]);

export const useViewSettingsReducer = (entrypoint: Entrypoint, defaultViewSettings: DefaultViewSettings = {}) => {
    const {lang} = useLang();
    const [loading, setLoading] = useState(true);
    const [libraryId, setLibraryId] = useState(entrypoint.type === 'library' ? entrypoint.libraryId : null);
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);
    const {closeSettingsPanel} = useEditSettings();
    const entrypointsAreEqual = _entrypointsAreEqual(entrypoint, view.entrypoint);

    useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId
        },
        onCompleted: data => {
            const attributeData = data?.attributes?.list?.[0];
            if (!attributeData) {
                throw new Error('Unknown link attribute');
            }
            setLibraryId(_isLinkAttributeDetails(attributeData) ? (attributeData.linked_library?.id ?? '') : null);
        }
    });

    const {
        data: viewData,
        loading: viewsLoading,
        error: viewError
    } = useGetViewsListQuery({
        skip: entrypointsAreEqual || libraryId === null,
        fetchPolicy: 'network-only',
        variables: {
            libraryId: libraryId as string
        }
    });
    // Take the last view from the array
    const userView = viewData?.views?.list?.at(-1);

    const userViewFilters =
        userView?.filters?.reduce<Array<ValidFieldFilter | ValidFieldFilterThrough>>((acc, filter) => {
            if (!_isValidFieldFilter(filter)) {
                return acc;
            }

            const _isThroughFilter = filter.field.includes('.');
            if (_isThroughFilter) {
                const [field, subField] = filter.field.split('.');
                const throughFilter: ValidFieldFilterThrough = {
                    field,
                    subField,
                    value: filter.value ?? null,
                    condition: ThroughConditionFilter.THROUGH,
                    subCondition: filter.condition
                };
                acc.push(throughFilter);
            } else {
                acc.push(filter);
            }

            return acc;
        }, []) ?? [];

    const preparedDefaultFilters =
        defaultViewSettings.filters?.reduce<Array<ValidFieldFilter | ValidFieldFilterThrough>>((acc, filter) => {
            if (!_isValidFieldFilter(filter)) {
                return acc;
            }

            const _isThroughFilter = filter.field.includes('.');
            const [field, subField] = filter.field.split('.');
            if (_isThroughFilter) {
                const throughFilter: ValidFieldFilterThrough = {
                    field,
                    subField,
                    value: filter.value ?? null,
                    condition: ThroughConditionFilter.THROUGH,
                    subCondition: filter.condition
                };
                acc.push(throughFilter);
            } else {
                acc.push(filter);
            }

            return acc;
        }, []) ?? [];

    const attributesToHydrate = [
        ...new Set(
            [
                ...(preparedDefaultFilters ?? []),
                ...(defaultViewSettings.sort ?? []),
                ...userViewFilters,
                ...(userView?.sort ?? [])
            ].map(({field}) => field)
        )
    ];

    const {
        data: attributesData,
        loading: attributesLoading,
        error: attributesError
    } = useExplorerAttributesQuery({
        variables: {
            ids: attributesToHydrate
        },
        skip: libraryId === null || viewsLoading || attributesToHydrate.length === 0
    });

    const attributesDataById = useMemo(
        () =>
            (attributesData?.attributes?.list ?? []).reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {}),
        [attributesData]
    );

    useEffect(() => {
        setLoading(true);
        setLibraryId(entrypoint.type === 'library' ? entrypoint.libraryId : null);
    }, [entrypoint]);

    useEffect(() => {
        if (!entrypointsAreEqual) {
            closeSettingsPanel();
        }
    }, [entrypointsAreEqual]);

    useEffect(() => {
        if (libraryId !== null && !viewsLoading && !attributesLoading) {
            const allFilters = [...preparedDefaultFilters, ...userViewFilters];

            const hydratedSettings: IViewSettingsState = {
                ...viewSettingsInitialState,
                entrypoint,
                libraryId,
                viewId: userView?.id,
                viewLabels: userView?.label ?? {},
                viewType: userView?.display
                    ? mapViewTypeFromLegacyToExplorer[userView.display.type]
                    : viewSettingsInitialState.viewType,
                ...defaultViewSettings,
                attributesIds: [
                    ...(userView?.attributes ?? []).map(attr => attr.id),
                    ...(defaultViewSettings?.attributesIds ?? [])
                ],
                sort: [...(defaultViewSettings?.sort ?? []), ...(userView?.sort ?? [])].map(s => ({
                    field: s.field,
                    order: s.order
                })),
                filters: allFilters.reduce<ExplorerFilter[]>((acc, filter) => {
                    if (!attributesDataById[filter.field]) {
                        console.warn(
                            `Attribute ${filter.field} from defaultViewSettings or user view not found in database.`
                        );
                        return acc;
                    }

                    const filterAttributeBase = {
                        label: localizedTranslation(attributesDataById[filter.field].label, lang),
                        type: attributesDataById[filter.field].type
                    };

                    // filter is standardFilter
                    if (isStandardAttribute(filterAttributeBase.type)) {
                        const newFilter: IExplorerFilterStandard = {
                            field: filter.field,
                            value: filter.value ?? null,
                            id: uuid(),
                            condition: (filter.condition as RecordFilterCondition) ?? null,
                            attribute: {
                                ...filterAttributeBase,
                                format: attributesDataById[filter.field].format
                            }
                        };
                        acc.push(newFilter);
                    }

                    if (isLinkAttribute(filterAttributeBase.type)) {
                        if (_isValidFieldFilterThrough(filter)) {
                            const newFilter: IExplorerFilterThrough = {
                                field: filter.field,
                                value: filter.value ?? null,
                                id: uuid(),
                                condition: filter.condition,
                                attribute: {
                                    ...filterAttributeBase,
                                    linkedLibrary: attributesDataById[filter.field].linked_library
                                },
                                subCondition: filter.subCondition ?? null,
                                subField: filter.subField
                            };
                            acc.push(newFilter);
                        } else {
                            const newFilter: IExplorerFilterLink = {
                                field: filter.field,
                                value: filter.value ?? null,
                                id: uuid(),
                                condition: filter.condition,
                                attribute: {
                                    ...filterAttributeBase,
                                    linkedLibrary: attributesDataById[filter.field].linked_library
                                }
                            };
                            acc.push(newFilter);
                        }
                    }
                    return acc;
                }, [])
            };

            dispatch({
                type: 'RESET',
                payload: {
                    ...hydratedSettings,
                    initialViewSettings: {
                        viewType: hydratedSettings.viewType,
                        attributesIds: hydratedSettings.attributesIds,
                        sort: hydratedSettings.sort,
                        pageSize: hydratedSettings.pageSize,
                        filters: hydratedSettings.filters
                    }
                }
            });
            setLoading(false);
        }
    }, [attributesLoading, viewsLoading, libraryId]);

    return {
        loading,
        error: viewError ?? attributesError,
        view,
        dispatch
    };
};
