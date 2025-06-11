import {Explorer} from '_ui/components';
import {ComponentProps} from 'react';
import {LibraryExplorerProps} from '../types';

const isBoolean = (val: unknown) => 'boolean' === typeof val;

type CommonOverrablePropsByUser =
    | 'showSearch'
    | 'defaultPrimaryActions'
    | 'defaultActionsForItem'
    | 'defaultMassActions'
    | 'showFiltersAndSorts'
    | 'enableConfigureView'
    | 'ignoreViewByDefault'
    | 'hideTableHeader'
    | 'creationFormId'
    | 'editionFormId';

type LibraryOverrablePropsByUser = 'noPagination';

export const useExplorerProps = ({explorerProps}: {explorerProps: LibraryExplorerProps}) => {
    const commonExplorerProps: Pick<ComponentProps<typeof Explorer>, CommonOverrablePropsByUser> = {
        showSearch: isBoolean(explorerProps?.showSearch) ? explorerProps.showSearch : undefined,
        defaultPrimaryActions: explorerProps?.defaultPrimaryActions,
        defaultActionsForItem: explorerProps?.defaultActionsForItem,
        defaultMassActions: explorerProps?.defaultMassActions,
        showFiltersAndSorts: explorerProps?.showFiltersAndSorts,
        enableConfigureView: isBoolean(explorerProps?.freezeView) ? !explorerProps.freezeView : undefined,
        ignoreViewByDefault: isBoolean(explorerProps?.freezeView) ? explorerProps.freezeView : undefined,
        hideTableHeader: isBoolean(explorerProps?.showAttributeLabels) ? !explorerProps.showAttributeLabels : undefined,
        creationFormId: explorerProps?.creationFormId,
        editionFormId: explorerProps?.editionFormId
    };

    const libraryExplorerProps: Pick<ComponentProps<typeof Explorer>, LibraryOverrablePropsByUser> = {
        noPagination: explorerProps?.noPagination ?? undefined
    };

    return {commonExplorerProps, libraryExplorerProps};
};
