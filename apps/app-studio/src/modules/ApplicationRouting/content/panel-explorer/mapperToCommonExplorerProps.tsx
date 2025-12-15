// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps} from 'react';
import {type Explorer} from '@leav/ui';
import {type ExplorerProps} from '../../types';

const isBoolean = (val: unknown): val is boolean => 'boolean' === typeof val;

type OverridableExplorerPropsByUser =
    | 'showSearch'
    | 'showFilters'
    | 'showSorts'
    | 'ignoreViewByDefault'
    | 'defaultViewSettings'
    | 'hideTableHeader'
    | 'creationFormId'
    | 'noPagination'
    | 'defaultPrimaryActions'
    | 'defaultMassActions'
    | 'defaultActionsForItem';

export const mapToCommonExplorerProps = ({
    explorerProps,
}: {
    explorerProps: ExplorerProps | undefined;
}): Pick<ComponentProps<typeof Explorer>, OverridableExplorerPropsByUser> => {
    if (!explorerProps) {
        return {};
    }
    return {
        showSearch: isBoolean(explorerProps.showSearch) ? explorerProps.showSearch : undefined,
        showFilters: explorerProps.showFilters,
        showSorts: explorerProps.showSorts,
        ignoreViewByDefault: isBoolean(explorerProps.freezeView) ? explorerProps.freezeView : undefined,
        defaultViewSettings: {
            enableConfigureView: isBoolean(explorerProps.freezeView) ? !explorerProps.freezeView : false,
        },
        hideTableHeader: isBoolean(explorerProps.showAttributeLabels) ? !explorerProps.showAttributeLabels : undefined,
        creationFormId: explorerProps.creationFormId,
        noPagination: explorerProps.noPagination ?? undefined,
        defaultPrimaryActions: explorerProps.defaultPrimaryActions,
        defaultMassActions: explorerProps.defaultMassActions,
        defaultActionsForItem: explorerProps.defaultActionsForItem,
    };
};
