// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps} from 'react';
import {Explorer} from '@leav/ui';
import {LibraryExplorerProps} from '../types';

const isBoolean = (val: unknown): val is boolean => 'boolean' === typeof val;

type CommonOverridablePropsByUser =
    | 'showSearch'
    | 'showFilters'
    | 'showSorts'
    | 'ignoreViewByDefault'
    | 'hideTableHeader'
    | 'creationFormId'
    | 'editionFormId'
    | 'noPagination';

type LibraryOverridablePropsByUser = 'defaultPrimaryActions' | 'defaultActionsForItem' | 'defaultMassActions';

export const mapToLibraryExplorerProps = ({
    explorerProps
}: {
    explorerProps: LibraryExplorerProps;
}): Pick<ComponentProps<typeof Explorer>, LibraryOverridablePropsByUser> => ({
    defaultPrimaryActions: explorerProps.defaultPrimaryActions,
    defaultActionsForItem: explorerProps.defaultActionsForItem,
    defaultMassActions: explorerProps.defaultMassActions
});

export const mapToCommonExplorerProps = ({
    explorerProps
}: {
    explorerProps: LibraryExplorerProps;
}): Pick<ComponentProps<typeof Explorer>, CommonOverridablePropsByUser> => ({
    showSearch: isBoolean(explorerProps.showSearch) ? explorerProps.showSearch : undefined,
    showFilters: explorerProps.showFilters,
    showSorts: explorerProps.showSorts,
    ignoreViewByDefault: isBoolean(explorerProps.freezeView) ? explorerProps.freezeView : undefined,
    hideTableHeader: isBoolean(explorerProps.showAttributeLabels) ? !explorerProps.showAttributeLabels : undefined,
    creationFormId: explorerProps.creationFormId,
    editionFormId: explorerProps.editionFormId,
    noPagination: explorerProps.noPagination ?? undefined
});
