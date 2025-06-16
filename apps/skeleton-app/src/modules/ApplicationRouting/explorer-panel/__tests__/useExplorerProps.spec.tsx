// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import {useExplorerProps} from '../useExplorerProps';
import {ComponentProps} from 'react';
import {Explorer} from '_ui/components';
import {LibraryExplorerProps} from 'modules/ApplicationRouting/types';

type ExplorerProps = ComponentProps<typeof Explorer>;

describe('useExplorerProps', () => {
    describe('with defined values', () => {
        it('shoud return correct props when all values are defined with true boolean', () => {
            const explorerProps: LibraryExplorerProps = {
                showSearch: true,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFiltersAndSorts: true,
                freezeView: true,
                showAttributeLabels: true,
                creationFormId: 'create-id',
                editionFormId: 'edit-id',
                noPagination: true
            };

            const {result} = renderHook(() => useExplorerProps({explorerProps}));

            expect(result.current.commonExplorerProps).toEqual({
                showSearch: true,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFiltersAndSorts: true,
                enableConfigureView: false,
                ignoreViewByDefault: true,
                hideTableHeader: false,
                creationFormId: 'create-id',
                editionFormId: 'edit-id'
            });

            expect(result.current.libraryExplorerProps).toEqual({
                noPagination: true
            });
        });

        it('should return correct props when all values are defined with false boolean', () => {
            const explorerProps: LibraryExplorerProps = {
                showSearch: false,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFiltersAndSorts: false,
                freezeView: false,
                showAttributeLabels: false,
                creationFormId: 'create-id',
                editionFormId: 'edit-id'
            };

            const {result} = renderHook(() => useExplorerProps({explorerProps}));

            expect(result.current.commonExplorerProps).toEqual({
                showSearch: false,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFiltersAndSorts: false,
                enableConfigureView: true,
                ignoreViewByDefault: false,
                hideTableHeader: true,
                creationFormId: 'create-id',
                editionFormId: 'edit-id'
            });
        });
    });

    it('should return undefined where booleans are expected of none are provided', () => {
        const explorerProps: LibraryExplorerProps = {};

        const {result} = renderHook(() => useExplorerProps({explorerProps}));

        expect(result.current.commonExplorerProps.showSearch).toBeUndefined();
        expect(result.current.commonExplorerProps.enableConfigureView).toBeUndefined();
        expect(result.current.commonExplorerProps.ignoreViewByDefault).toBeUndefined();
        expect(result.current.commonExplorerProps.hideTableHeader).toBeUndefined();
    });

    it('should handle missing optional props gracefully', () => {
        const explorerProps = {};

        const {result} = renderHook(() => useExplorerProps({explorerProps}));

        expect(result.current.commonExplorerProps).toEqual({});
        expect(result.current.libraryExplorerProps).toEqual({});
    });
});
