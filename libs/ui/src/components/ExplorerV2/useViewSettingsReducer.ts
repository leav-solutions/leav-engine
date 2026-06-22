import {useEffect, useReducer, useState} from 'react';
import {useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {type Entrypoint, type IEntrypointLink} from './_types';
import {
    type IViewSettingsState,
    viewSettingsInitialState,
    viewSettingsReducer,
    ViewSettingsActionTypes,
} from './manage-view-settings-v2';
import {isLinkAttributeDetails} from '_ui/components/Filters/useTransformFilters';

const _areDifferents = <T extends object>(object1: T, object2: T) =>
    Object.keys(object1).some(key => object1[key] !== object2[key]);

/**
 * Owns only the **ephemeral** view state (mass selection, page size, fulltext search) plus the
 * async-resolved `libraryId`/`entrypoint`. ExplorerV2 is a pure consumer of viewsV2: the display
 * config (viewType/attributesIds/sort) comes from the controlled `currentView` prop and is merged
 * on top of this state.
 */
export const useViewSettingsReducer = (entrypoint: Entrypoint) => {
    /**
     * Should be `true` until `libraryId` is resolved and the reducer is `RESET`.
     */
    const [loading, setLoading] = useState(true);
    const [libraryId, setLibraryId] = useState(entrypoint.type === 'library' ? entrypoint.libraryId : null);
    const [view, dispatch] = useReducer(viewSettingsReducer, viewSettingsInitialState);

    /**
     * We need to check if the `props.entrypoint` has changed to detect a new `props.entrypoint.libraryId`
     * and reload from scratch.
     */
    const needToReloadFromScratch = _areDifferents(entrypoint, view.entrypoint);

    useEffect(() => {
        if (needToReloadFromScratch) {
            setLoading(true);
            setLibraryId(entrypoint.type === 'library' ? entrypoint.libraryId : null);
        }
    }, [needToReloadFromScratch]);

    /**
     * On `entrypoint.type === 'link'`, we need to get the library id from the link attribute to set up `<Explorer />`.
     */
    const {data: linkAttributeData} = useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId,
        },
    });

    useEffect(() => {
        if (entrypoint.type !== 'link') {
            return;
        }

        const attributeData = linkAttributeData?.attributes?.list?.[0];

        if (!attributeData) {
            return;
        }

        setLibraryId(isLinkAttributeDetails(attributeData) ? (attributeData.linked_library?.id ?? '') : null);
    }, [entrypoint, linkAttributeData]);

    useEffect(() => {
        if (libraryId !== null) {
            dispatch({
                type: ViewSettingsActionTypes.RESET,
                payload: {
                    ...viewSettingsInitialState,
                    entrypoint,
                    libraryId,
                } satisfies IViewSettingsState,
            });
            setLoading(false);
        }
    }, [libraryId]);

    return {
        loading,
        view,
        dispatch,
    };
};
