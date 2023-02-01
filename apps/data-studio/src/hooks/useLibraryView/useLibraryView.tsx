// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useQuery} from '@apollo/client';
import extractAttributesFromLibrary from 'components/LibraryItemsList/helpers/extractAttributesFromLibrary';
import {defaultView, getSelectedViewKey} from 'constants/constants';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {getViewByIdQuery} from 'graphQL/queries/views/getViewById';
import {useUser} from 'hooks/UserHook/UserHook';
import {useState} from 'react';
import {prepareView} from 'utils';
import {getFiltersFromRequest} from 'utils/getFiltersFromRequest';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {GET_USER_DATA, GET_USER_DATAVariables} from '_gqlTypes/GET_USER_DATA';
import {GET_VIEW, GET_VIEWVariables} from '_gqlTypes/GET_VIEW';
import {IAttribute, IView} from '_types/types';

const useLibraryView = (
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list
): {loading: boolean; error: Error; view: IView} => {
    const [user] = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error>(null);
    const [view, setView] = useState<IView>(defaultView);

    const hasAccess = library.permissions.access_library;
    const selectedViewKey = getSelectedViewKey(library.id);

    const _getLibraryDefaultView = () => {
        const attributesFromQuery: IAttribute[] = extractAttributesFromLibrary(library);
        return {
            id: library.defaultView.id,
            owner: true,
            library: library.id,
            label: library.defaultView.label,
            description: library.defaultView.description,
            display: library.defaultView.display,
            color: library.defaultView.color,
            shared: library.defaultView.shared,
            filters: getFiltersFromRequest(library.defaultView.filters ?? [], library.id, attributesFromQuery),
            sort: library.defaultView.sort,
            settings: library.defaultView.settings
        };
    };

    // Will be used to get view details for last used view
    const [getViewDetails] = useLazyQuery<GET_VIEW, GET_VIEWVariables>(getViewByIdQuery, {
        onCompleted: data => {
            if (!data) {
                setError(new Error('Unknown view'));
                setIsLoading(false);
            }

            const viewDetails: IView = prepareView(
                data.view,
                extractAttributesFromLibrary(library),
                library.id,
                user?.userId
            );

            setView(viewDetails);
            setIsLoading(false);
        },
        onError: err => {
            // Error when fetching view, load default view
            if (library.defaultView) {
                const libraryDefaultView = _getLibraryDefaultView();
                setView(libraryDefaultView);
            }

            setError(err);
            setIsLoading(false);
        }
    });

    // First of all, get last used view from user data
    useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        fetchPolicy: 'no-cache',
        variables: {keys: [selectedViewKey]},
        skip: !hasAccess,
        onCompleted: d => {
            // No last used view on user data? Check if library has a default view.
            if (!d.userData?.data?.[selectedViewKey]) {
                if (library.defaultView) {
                    const libraryDefaultView = _getLibraryDefaultView();
                    setView(libraryDefaultView);
                }
                setIsLoading(false);
                return;
            }

            // Found something on user data? Load view details as we've only retrieved its id
            const viewId = d.userData?.data[selectedViewKey];

            if (viewId === defaultView.id) {
                setIsLoading(false);
                return;
            }

            getViewDetails({variables: {viewId}});
        },
        onError: err => {
            // Unable to load any other view, keep default view
            setError(err);
            setIsLoading(false);
        }
    });

    return {
        loading: isLoading,
        error,
        view
    };
};

export default useLibraryView;
