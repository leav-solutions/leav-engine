// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import mockLogger from '../../__tests__/mockers/logger';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import exportProfileDomain, {
    type IExportProfileDomainDeps,
    type IExportProfileConfig,
    type IExportProfileDomain,
} from './exportProfileDomain';
import {type IConfig} from '_types/config';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';

jest.mock('@leav/logger', () => ({
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
        getLibraryProperties: jest.fn(),
    };

    const mockAttributeDomain: Mockify<IAttributeDomain> = {
        getLibraryAttributes: jest.fn(),
    };

    const deps: IExportProfileDomainDeps = {
        'core.domain.library': mockLibraryDomain as ILibraryDomain,
        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
        config: {} as IConfig,
    };
    const domain: IExportProfileDomain = exportProfileDomain(deps);

    beforeEach(() => {
        jest.clearAllMocks();
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
                'Export profile column attribute "email" does not exist in library',
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
    });
});
