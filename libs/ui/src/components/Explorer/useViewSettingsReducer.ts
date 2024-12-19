// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useExplorerAttributesQuery} from '_ui/_gqlTypes';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {useEffect, useMemo, useReducer} from 'react';
import {DefaultViewSettings, IExplorerFilter} from './_types';
import {v4 as uuid} from 'uuid';
import {viewSettingsReducer, viewSettingsInitialState} from './manage-view-settings';

export const useViewSettingsReducer = (defaultViewSettings: DefaultViewSettings = {}) => {
    const {lang} = useLang();
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);

    const attributesToHydrate = [
        ...(defaultViewSettings.filters?.map(filter => filter.field) ?? []),
        ...(defaultViewSettings.sort?.map(sort => sort.attributeId) ?? [])
    ];
    const {data, loading, error} = useExplorerAttributesQuery({
        variables: {
            ids: attributesToHydrate
        },
        skip: !attributesToHydrate.length
    });

    const attributesDataById = useMemo(
        () =>
            (data?.attributes?.list ?? []).reduce((acc, attr) => {
                acc[attr.id] = attr;
                return acc;
            }, {}),
        [data]
    );

    const hydratedSettings = useMemo(
        () => ({
            ...defaultViewSettings,
            filters: (defaultViewSettings.filters ?? []).reduce<IExplorerFilter[]>((acc, filter) => {
                if (!attributesDataById[filter.field]) {
                    console.warn(`Attribute ${filter.field} from defaultViewSettings not found in database.`);
                    return acc;
                }

                return [
                    ...acc,
                    {
                        ...filter,
                        id: uuid(),
                        attribute: {
                            label: localizedTranslation(attributesDataById[filter.field].label, lang),
                            format: attributesDataById[filter.field].format
                        }
                    }
                ];
            }, [])
        }),
        [defaultViewSettings, attributesDataById, lang]
    );

    useEffect(() => {
        if (!loading) {
            dispatch({type: 'RESET', payload: {...viewSettingsInitialState, ...hydratedSettings}});
        }
    }, [loading]);

    const res = {
        loading,
        error,
        view,
        dispatch
    };

    return res;
};
