// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import omit from 'lodash/omit';
import {useState} from 'react';
import {useUser} from '_ui/hooks/useUser/useUser';
import {IAttribute} from '_ui/types/search';
import {IView} from '_ui/types/views';
import {useGetUserDataQuery, useGetViewLazyQuery, ViewDetailsFragment} from '_ui/_gqlTypes';
import {ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {prepareView} from '_ui/_utils';
import {getFiltersFromRequest} from '_ui/_utils/getFiltersFromRequest';
import {defaultView, getSelectedViewKey} from '../../constants';
import extractAttributesFromLibrary from '../../helpers/extractAttributesFromLibrary';

const useLibraryView = (library: ILibraryDetailExtended): {loading: boolean; error: Error; view: IView} => {
    const {userData} = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error>(null);
    const [view, setView] = useState<IView>(defaultView);

    const hasAccess = library.permissions.access_library;
    const selectedViewKey = getSelectedViewKey(library.id);

    const _getLibraryDefaultView = (): IView => {
        const attributesFromQuery: IAttribute[] = extractAttributesFromLibrary(library);

        return {
            id: library.defaultView.id,
            owner: true,
            library: library.id,
            label: library.defaultView.label,
            description: library.defaultView.description,
            display: omit(view.display, ['__typename']) as ViewDetailsFragment['display'],
            color: library.defaultView.color,
            shared: library.defaultView.shared,
            filters: getFiltersFromRequest(library.defaultView.filters ?? [], library.id, attributesFromQuery),
            sort: library?.defaultView?.sort,
            settings: library.defaultView.settings
        };
    };

    // Will be used to get view details for last used view
    const [getViewDetails] = useGetViewLazyQuery({
        onCompleted: data => {
            if (!data) {
                setError(new Error('Unknown view'));
                setIsLoading(false);
            }

            const viewDetails: IView = prepareView(
                data.view,
                extractAttributesFromLibrary(library),
                library.id,
                userData?.userId
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
    useGetUserDataQuery({
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
