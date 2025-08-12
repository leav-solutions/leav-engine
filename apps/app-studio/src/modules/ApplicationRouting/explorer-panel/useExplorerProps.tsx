// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps} from 'react';
import {Explorer} from '@leav/ui';
import {LibraryExplorerProps} from '../types';

const isBoolean = (val: unknown) => 'boolean' === typeof val;

type CommonOverridablePropsByUser =
    | 'showSearch'
    | 'defaultPrimaryActions'
    | 'defaultActionsForItem'
    | 'defaultMassActions'
    | 'showFilters'
    | 'showSorts'
    | 'ignoreViewByDefault'
    | 'hideTableHeader'
    | 'creationFormId'
    | 'editionFormId';

type LibraryOverridablePropsByUser = 'noPagination';

export const useExplorerProps = ({explorerProps}: {explorerProps: LibraryExplorerProps}) => {
    const commonExplorerProps: Pick<ComponentProps<typeof Explorer>, CommonOverridablePropsByUser> = {
        showSearch: isBoolean(explorerProps?.showSearch) ? explorerProps.showSearch : undefined,
        defaultPrimaryActions: explorerProps?.defaultPrimaryActions,
        defaultActionsForItem: explorerProps?.defaultActionsForItem,
        defaultMassActions: explorerProps?.defaultMassActions,
        showFilters: explorerProps?.showFilters,
        showSorts: explorerProps?.showSorts,
        ignoreViewByDefault: isBoolean(explorerProps?.freezeView) ? explorerProps.freezeView : undefined,
        hideTableHeader: isBoolean(explorerProps?.showAttributeLabels) ? !explorerProps.showAttributeLabels : undefined,
        creationFormId: explorerProps?.creationFormId,
        editionFormId: explorerProps?.editionFormId
    };

    const libraryExplorerProps: Pick<ComponentProps<typeof Explorer>, LibraryOverridablePropsByUser> = {
        noPagination: explorerProps?.noPagination ?? undefined
    };

    return {commonExplorerProps, libraryExplorerProps};
};
