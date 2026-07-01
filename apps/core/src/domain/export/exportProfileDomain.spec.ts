import mockLogger from '../../__tests__/mockers/logger';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import exportProfileDomain, {
    type IExportProfileDomainDeps,
    type IExportProfileConfig,
    type IExportProfileDomain,
} from './exportProfileDomain';
import {type IConfig} from '../../_types/config';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type ITreeDomain} from '../tree/treeDomain';

vi.mock('@leav/logger', () => ({
    logger: mockLogger,
}));

describe('exportProfileDomain', () => {
    const mockCtx: IQueryInfos = {
        userId: '1',
        queryId: 'exportProfileDomainTest',
    };

    const validExportConfig: IExportProfileConfig = {
        defaultProfile: 'Profile 1',
        profiles: [
            {
                label: 'Profile 1',
                columns: [
                    {columnLabel: 'Name', attribute: 'name'},
                    {columnLabel: 'Email', attribute: 'email'},
                ],
            },
            {
                label: 'Profile 2',
                columns: [
                    {columnLabel: 'Title', attribute: 'title'},
                    {columnLabel: 'Description', attribute: 'description'},
                ],
            },
        ],
    };

    const mockLibraryDomain: Mockify<ILibraryDomain> = {
        getLibraryProperties: vi.fn(),
    };

    const mockAttributeDomain: Mockify<IAttributeDomain> = {
        getLibraryAttributes: vi.fn(),
    };

    const mockTreeDomain: Mockify<ITreeDomain> = {
        getTreeProperties: vi.fn(),
    };

    const deps: IExportProfileDomainDeps = {
        'core.domain.library': mockLibraryDomain as ILibraryDomain,
        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
        'core.domain.tree': mockTreeDomain as ITreeDomain,
        config: {} as IConfig,
    };
    const domain: IExportProfileDomain = exportProfileDomain(deps);

    beforeEach(() => {
        vi.clearAllMocks();
        mockLibraryDomain.getLibraryProperties.mockResolvedValue({
            id: 'test_library',
            settings: {
                export: validExportConfig,
            },
        });
        mockAttributeDomain.getLibraryAttributes.mockResolvedValue([
            {id: 'name', label: 'Name', type: 'text'},
            {id: 'email', label: 'Email', type: 'text'},
            {id: 'title', label: 'Title', type: 'text'},
            {id: 'description', label: 'Description', type: 'text'},
        ]);
    });

    describe('getColumnsFromProfileConfig', () => {
        it('should return columns from the selected profile', async () => {
            const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'},
            ]);
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should return columns from the first profile if defaultProfile not found', async () => {
            const configWithNonExistentProfile: IExportProfileConfig = {
                defaultProfile: 'Non-existent Profile',
                profiles: [
                    {
                        label: 'Profile 1',
                        columns: [
                            {columnLabel: 'Name', attribute: 'name'},
                            {columnLabel: 'Email', attribute: 'email'},
                        ],
                    },
                    {
                        label: 'Profile 2',
                        columns: [
                            {columnLabel: 'Title', attribute: 'title'},
                            {columnLabel: 'Description', attribute: 'description'},
                        ],
                    },
                ],
            };

            mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                id: 'test_library',
                settings: {
                    export: configWithNonExistentProfile,
                },
            });

            const result = await domain.getColumnsFromProfileConfig('Non-existent Profile', 'test_library', mockCtx);

            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'},
            ]);
        });

        it('should return default profile columns when profile is undefined', async () => {
            const result = await domain.getColumnsFromProfileConfig(undefined, 'test_library', mockCtx);

            // When profile is undefined, it should use the default profile
            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'},
            ]);
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should return default profile columns when profile is empty string', async () => {
            const result = await domain.getColumnsFromProfileConfig('', 'test_library', mockCtx);

            // When profile is empty, it should use the default profile
            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'},
            ]);
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should throw error if attribute not in library', async () => {
            mockAttributeDomain.getLibraryAttributes.mockResolvedValue([{id: 'name', label: 'Name', type: 'text'}]);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                'Export profile column attribute "email" does not exist in the library (attribute "email" not found)',
            );
        });

        it('should throw an error if no library provided', async () => {
            mockLibraryDomain.getLibraryProperties.mockResolvedValue(null);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', '', mockCtx)).rejects.toThrow(
                'Export error: No library provided',
            );
            expect(mockLibraryDomain.getLibraryProperties).not.toHaveBeenCalled();
        });

        it('should throw an error if export config is missing', async () => {
            mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                id: 'test_library',
                settings: {},
            });

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                'Export profile config is missing',
            );
        });

        it('should handle columns with empty attributes', async () => {
            const configWithEmptyAttrs: IExportProfileConfig = {
                defaultProfile: 'Profile 1',
                profiles: [
                    {
                        label: 'Profile 1',
                        columns: [
                            {columnLabel: 'Name', attribute: 'name'},
                            {columnLabel: 'Empty Column 1', attribute: ''},
                            {columnLabel: 'Empty Column 2', attribute: ''},
                        ],
                    },
                ],
            };
            mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                id: 'test_library',
                settings: {
                    export: configWithEmptyAttrs,
                },
            });

            const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Empty Column 1', attribute: ''},
                {columnLabel: 'Empty Column 2', attribute: ''},
            ]);
        });

        it('should throw an error if getting library properties fails', async () => {
            // 1. Setup the mock to reject (throw an error)
            const libraryError = new Error('Library properties failed to load');
            mockLibraryDomain.getLibraryProperties.mockRejectedValue(libraryError);

            // 2. Use 'await expect(...).rejects.toThrow()' to assert that the async function throws
            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                libraryError,
            );

            // 3. Optional: Verify that the function was called as expected
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should throw an error if export config is invalid (missing defaultProfile)', async () => {
            const invalidConfig = {
                profiles: [
                    {
                        label: 'Profile 1',
                        columns: [{columnLabel: 'Name', attribute: 'name'}],
                    },
                ],
            };

            mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                id: 'test_library',
                settings: {
                    export: invalidConfig,
                },
            });

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                'Export profile config is not valid: "defaultProfile" is not allowed to be empty',
            );
        });

        it('should throw an error if export config has empty profiles array', async () => {
            const invalidConfig = {
                defaultProfile: 'Profile 1',
                profiles: [],
            };

            mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                id: 'test_library',
                settings: {
                    export: invalidConfig,
                },
            });

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                'Export profile config is missing',
            );
        });

        it('should throw an error if profile has empty columns array', async () => {
            const invalidConfig = {
                defaultProfile: 'Profile 1',
                profiles: [
                    {
                        label: 'Profile 1',
                        columns: [],
                    },
                ],
            };

            mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                id: 'test_library',
                settings: {
                    export: invalidConfig,
                },
            });

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                'Export profile is not valid: "columns" does not contain 1 required value(s)',
            );
        });

        describe('nested attributes validation', () => {
            it('should validate nested attributes through link attributes', async () => {
                const configWithNestedAttr: IExportProfileConfig = {
                    defaultProfile: 'Profile 1',
                    profiles: [
                        {
                            label: 'Profile 1',
                            columns: [{columnLabel: 'Linked Color', attribute: 'category.color'}],
                        },
                    ],
                };

                mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                    id: 'test_library',
                    settings: {export: configWithNestedAttr},
                });

                // Main library has a link attribute "category"
                mockAttributeDomain.getLibraryAttributes
                    .mockResolvedValueOnce([
                        {id: 'category', label: {fr: 'Catégorie'}, type: 'simple_link', linked_library: 'categories'},
                    ])
                    // Linked library "categories" has attribute "color"
                    .mockResolvedValueOnce([{id: 'color', label: {fr: 'Couleur'}, type: 'simple'}]);

                const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

                expect(result).toEqual([{columnLabel: 'Linked Color', attribute: 'category.color'}]);
                expect(mockAttributeDomain.getLibraryAttributes).toHaveBeenCalledTimes(2);
                expect(mockAttributeDomain.getLibraryAttributes).toHaveBeenNthCalledWith(1, 'test_library', mockCtx);
                expect(mockAttributeDomain.getLibraryAttributes).toHaveBeenNthCalledWith(2, 'categories', mockCtx);
            });

            it('should throw error if nested attribute does not exist in linked library', async () => {
                const configWithInvalidNested: IExportProfileConfig = {
                    defaultProfile: 'Profile 1',
                    profiles: [
                        {
                            label: 'Profile 1',
                            columns: [{columnLabel: 'Invalid', attribute: 'category.nonexistent'}],
                        },
                    ],
                };

                mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                    id: 'test_library',
                    settings: {export: configWithInvalidNested},
                });

                mockAttributeDomain.getLibraryAttributes
                    .mockResolvedValueOnce([
                        {id: 'category', label: {fr: 'Catégorie'}, type: 'simple_link', linked_library: 'categories'},
                    ])
                    .mockResolvedValueOnce([{id: 'color', label: {fr: 'Couleur'}, type: 'simple'}]);

                await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                    'Export profile column attribute "category.nonexistent" does not exist in the library (attribute "nonexistent" not found)',
                );
            });

            it('should throw error if intermediate attribute is not a link', async () => {
                const configWithNonLink: IExportProfileConfig = {
                    defaultProfile: 'Profile 1',
                    profiles: [
                        {
                            label: 'Profile 1',
                            columns: [{columnLabel: 'Invalid', attribute: 'name.something'}],
                        },
                    ],
                };

                mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                    id: 'test_library',
                    settings: {export: configWithNonLink},
                });

                mockAttributeDomain.getLibraryAttributes.mockResolvedValueOnce([
                    {id: 'name', label: {fr: 'Nom'}, type: 'simple'},
                ]);

                await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                    'Export profile column attribute "name.something" is invalid: "name" is not a link or tree attribute',
                );
            });

            it('should validate nested attributes through a tree attribute (any of its libraries)', async () => {
                const configWithTreeAttr: IExportProfileConfig = {
                    defaultProfile: 'Profile 1',
                    profiles: [
                        {
                            label: 'Profile 1',
                            columns: [{columnLabel: 'Group uuid', attribute: 'group_tree.uuid'}],
                        },
                    ],
                };

                mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                    id: 'test_library',
                    settings: {export: configWithTreeAttr},
                });

                mockAttributeDomain.getLibraryAttributes
                    .mockResolvedValueOnce([
                        {id: 'group_tree', label: {fr: 'Groupes'}, type: 'tree', linked_tree: 'groups_tree'},
                    ])
                    // users_groups library (linked to the tree) has the "uuid" base attribute
                    .mockResolvedValueOnce([{id: 'uuid', label: {fr: 'UUID'}, type: 'simple'}]);

                mockTreeDomain.getTreeProperties.mockResolvedValue({
                    id: 'groups_tree',
                    libraries: {
                        users_groups: {allowedAtRoot: true, allowMultiplePositions: false, allowedChildren: []},
                    },
                });

                const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

                expect(result).toEqual([{columnLabel: 'Group uuid', attribute: 'group_tree.uuid'}]);
                expect(mockTreeDomain.getTreeProperties).toHaveBeenCalledWith('groups_tree', mockCtx);
                expect(mockAttributeDomain.getLibraryAttributes).toHaveBeenNthCalledWith(2, 'users_groups', mockCtx);
            });

            it('should throw when tree sub-attribute exists in none of the tree libraries', async () => {
                const configWithInvalidTree: IExportProfileConfig = {
                    defaultProfile: 'Profile 1',
                    profiles: [
                        {
                            label: 'Profile 1',
                            columns: [{columnLabel: 'Invalid', attribute: 'group_tree.nonexistent'}],
                        },
                    ],
                };

                mockLibraryDomain.getLibraryProperties.mockResolvedValue({
                    id: 'test_library',
                    settings: {export: configWithInvalidTree},
                });

                mockAttributeDomain.getLibraryAttributes
                    .mockResolvedValueOnce([
                        {id: 'group_tree', label: {fr: 'Groupes'}, type: 'tree', linked_tree: 'groups_tree'},
                    ])
                    .mockResolvedValueOnce([{id: 'uuid', label: {fr: 'UUID'}, type: 'simple'}]);

                mockTreeDomain.getTreeProperties.mockResolvedValue({
                    id: 'groups_tree',
                    libraries: {
                        users_groups: {allowedAtRoot: true, allowMultiplePositions: false, allowedChildren: []},
                    },
                });

                await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                    'Export profile column attribute "group_tree.nonexistent" is invalid: "nonexistent" not found in any library linked to tree "groups_tree"',
                );
            });
        });
    });
});
