// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import useLibraryView from 'hooks/useLibraryView/useLibraryView';
import React from 'react';
import {CSSObject} from 'styled-components';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import LibraryItemsListContent from './LibraryItemsListContent';

interface ILibraryItemsListProps {
    selectionMode?: boolean;
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list;
    style?: CSSObject;
}

function LibraryItemsList({selectionMode, library, style}: ILibraryItemsListProps): JSX.Element {
    const {loading: libraryViewLoading, view: libraryView} = useLibraryView(library);

    const hasAccess = library.permissions.access_library;

    if (!hasAccess) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    if (libraryViewLoading) {
        return <Loading />;
    }

    return (
        <LibraryItemsListContent
            library={library}
            selectionMode={selectionMode}
            defaultView={libraryView}
            style={style}
        />
    );
}

export default LibraryItemsList;
