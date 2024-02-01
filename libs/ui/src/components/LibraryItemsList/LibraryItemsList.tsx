// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {CSSObject} from 'styled-components';
import {ErrorDisplay, Loading} from '_ui/components';
import {ErrorDisplayTypes} from '_ui/constants';
import {IFilter, ISearchSelection, SearchMode} from '_ui/types/search';
import {ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import useLibraryView from './hooks/useLibraryView/useLibraryView';
import LibraryItemsListContent from './LibraryItemsListContent';

interface ILibraryItemsListProps {
    selectionMode?: boolean;
    library: ILibraryDetailExtended;
    style?: CSSObject;
    showTransparency?: boolean;
    mode?: SearchMode;
    onSelectChange?: (selection: ISearchSelection, filters?: IFilter[]) => void;
}

export const LibraryItemsList: FunctionComponent<ILibraryItemsListProps> = ({
    selectionMode,
    library,
    style,
    showTransparency,
    mode,
    onSelectChange
}) => {
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
            showTransparency={showTransparency}
            onSelectChange={onSelectChange}
            mode={mode}
        />
    );
};

export default LibraryItemsList;
