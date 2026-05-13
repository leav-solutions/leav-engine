import {mapToCommonExplorerProps} from '../mapperToCommonExplorerProps';
import {type ExplorerProps} from '../../../types';

describe('mapToCommonExplorerProps', () => {
    describe('with defined values', () => {
        it('should return correct props when all values are defined with true boolean', () => {
            const explorerProps: ExplorerProps = {
                showSearch: true,
                defaultPrimaryActions: ['create'],
                defaultActionsForItem: ['activate'],
                defaultMassActions: ['deactivate'],
                showFilters: true,
                showSorts: true,
                freezeView: true,
                showAttributeLabels: true,
                creationFormId: 'create-id',
                noPagination: true,
                showActionsLabels: true,
            };

            expect(mapToCommonExplorerProps({explorerProps})).toEqual({
                showSearch: true,
                showFilters: true,
                showSorts: true,
                ignoreViewByDefault: true,
                hideTableHeader: false,
                creationFormId: 'create-id',
                noPagination: true,
                defaultPrimaryActions: ['create'],
                defaultMassActions: ['deactivate'],
                defaultViewSettings: {
                    enableConfigureView: false,
                },
                defaultActionsForItem: ['activate'],
            });
        });

        it('should return correct props when all values are defined with false boolean', () => {
            const explorerProps: ExplorerProps = {
                showSearch: false,
                defaultPrimaryActions: [],
                defaultActionsForItem: [],
                defaultMassActions: [],
                showFilters: false,
                showSorts: false,
                freezeView: false,
                showAttributeLabels: false,
                creationFormId: 'create-id',
                showActionsLabels: false,
            };

            expect(mapToCommonExplorerProps({explorerProps})).toEqual({
                showSearch: false,
                showFilters: false,
                showSorts: false,
                ignoreViewByDefault: false,
                hideTableHeader: true,
                creationFormId: 'create-id',
                noPagination: undefined,
                defaultPrimaryActions: [],
                defaultActionsForItem: [],
                defaultMassActions: [],
                defaultViewSettings: {
                    enableConfigureView: true,
                },
            });
        });
    });

    it('should return undefined where booleans are expected of none are provided', () => {
        const explorerProps: ExplorerProps = {};

        const commonExplorerProps = mapToCommonExplorerProps({explorerProps});

        expect(commonExplorerProps.showSearch).toBeUndefined();
        expect(commonExplorerProps.ignoreViewByDefault).toBeUndefined();
        expect(commonExplorerProps.defaultViewSettings).toEqual({
            enableConfigureView: false,
        });
        expect(commonExplorerProps.hideTableHeader).toBeUndefined();
        expect(commonExplorerProps.noPagination).toBe(undefined);
    });

    it('should handle missing optional props gracefully with default value', () => {
        const explorerProps = undefined;

        expect(mapToCommonExplorerProps({explorerProps})).toEqual({});
    });
});
