// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mapToCommonExplorerProps, mapToLibraryExplorerProps} from '../mapperToExplorerProps';
import {type LibraryExplorerProps} from '../../types';

describe('mapperToExplorerProps', () => {
    describe('with defined values', () => {
        it('should return correct props when all values are defined with true boolean', () => {
            const explorerProps: LibraryExplorerProps = {
                showSearch: true,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFilters: true,
                showSorts: true,
                freezeView: true,
                showAttributeLabels: true,
                creationFormId: 'create-id',
                editionFormId: 'edit-id',
                noPagination: true
            };

            expect(mapToCommonExplorerProps({explorerProps})).toEqual({
                showSearch: true,
                showFilters: true,
                showSorts: true,
                ignoreViewByDefault: true,
                hideTableHeader: false,
                creationFormId: 'create-id',
                editionFormId: 'edit-id',
                noPagination: true
            });

            expect(mapToLibraryExplorerProps({explorerProps})).toEqual({
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate']
            });
        });

        it('should return correct props when all values are defined with false boolean', () => {
            const explorerProps: LibraryExplorerProps = {
                showSearch: false,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFilters: false,
                showSorts: false,
                freezeView: false,
                showAttributeLabels: false,
                creationFormId: 'create-id',
                editionFormId: 'edit-id',
                noPagination: true
            };

            expect(mapToCommonExplorerProps({explorerProps})).toEqual({
                showSearch: false,
                showFilters: false,
                showSorts: false,
                ignoreViewByDefault: false,
                hideTableHeader: true,
                creationFormId: 'create-id',
                editionFormId: 'edit-id',
                noPagination: true
            });
        });
    });

    it('should return undefined where booleans are expected of none are provided', () => {
        const explorerProps: LibraryExplorerProps = {};

        const commonExplorerProps = mapToCommonExplorerProps({explorerProps});

        expect(commonExplorerProps.showSearch).toBeUndefined();
        expect(commonExplorerProps.ignoreViewByDefault).toBeUndefined();
        expect(commonExplorerProps.hideTableHeader).toBeUndefined();
    });

    it('should handle missing optional props gracefully', () => {
        const explorerProps = {};

        expect(mapToCommonExplorerProps({explorerProps})).toEqual({});
        expect(mapToLibraryExplorerProps({explorerProps})).toEqual({});
    });
});
