// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import mockLogger from '../../__tests__/mockers/logger';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import exportProfileDomain, {type IExportProfileDomainDeps, type IExportProfileConfig} from './exportProfileDomain';

jest.mock('@leav/logger', () => ({
    logger: mockLogger
}));

describe('exportProfileDomain', () => {
    const mockCtx: IQueryInfos = {
        userId: '1',
        queryId: 'exportProfileDomainTest'
    };

    const validExportConfig: IExportProfileConfig = {
        defaultProfile: 'Profile 1',
        profiles: [
            {
                label: 'Profile 1',
                columns: [
                    {columnLabel: 'Name', attribute: 'name'},
                    {columnLabel: 'Email', attribute: 'email'}
                ]
            },
            {
                label: 'Profile 2',
                columns: [
                    {columnLabel: 'Title', attribute: 'title'},
                    {columnLabel: 'Description', attribute: 'description'}
                ]
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getColumnsFromProfileConfig', () => {
        it('should return columns from the selected profile', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: validExportConfig
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'}
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
                            {columnLabel: 'Email', attribute: 'email'}
                        ]
                    },
                    {
                        label: 'Profile 2',
                        columns: [
                            {columnLabel: 'Title', attribute: 'title'},
                            {columnLabel: 'Description', attribute: 'description'}
                        ]
                    }
                ]
            };

            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: configWithNonExistentProfile
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('Non-existent Profile', 'test_library', mockCtx);

            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'}
            ]);
        });

        it('should return default profile columns when profile is undefined', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: validExportConfig
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig(undefined, 'test_library', mockCtx);

            // When profile is undefined, it should use the default profile
            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'}
            ]);
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should return default profile columns when profile is empty string', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: validExportConfig
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('', 'test_library', mockCtx);

            // When profile is empty, it should use the default profile
            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Email', attribute: 'email'}
            ]);
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should throw an error if no library provided', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn()
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', '', mockCtx)).rejects.toThrow(
                'Invalid request'
            );
            expect(mockLibraryDomain.getLibraryProperties).not.toHaveBeenCalled();
        });

        it('should throw an error if export config is missing', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {}
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                'Export profile config is missing'
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
                            {columnLabel: 'Empty Column 2', attribute: ''}
                        ]
                    }
                ]
            };

            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: configWithEmptyAttrs
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

            expect(result).toEqual([
                {columnLabel: 'Name', attribute: 'name'},
                {columnLabel: 'Empty Column 1', attribute: ''},
                {columnLabel: 'Empty Column 2', attribute: ''}
            ]);
        });

        it('should throw an error if getting library properties fails', async () => {
            // 1. Setup the mock to reject (throw an error)
            const libraryError = new Error('Library properties failed to load');
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockRejectedValue(libraryError)
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);

            // 2. Use 'await expect(...).rejects.toThrow()' to assert that the async function throws
            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                libraryError
            );

            // 3. Optional: Verify that the function was called as expected
            expect(mockLibraryDomain.getLibraryProperties).toHaveBeenCalledWith('test_library', mockCtx);
        });

        it('should throw an error if export config is invalid (missing defaultProfile)', async () => {
            const invalidConfig = {
                profiles: [
                    {
                        label: 'Profile 1',
                        columns: [{columnLabel: 'Name', attribute: 'name'}]
                    }
                ]
            };

            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: invalidConfig
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                /Invalid request/
            );
        });

        it('should throw an error if export config has empty profiles array', async () => {
            const invalidConfig = {
                defaultProfile: 'Profile 1',
                profiles: []
            };

            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: invalidConfig
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                /Invalid request/
            );
        });

        it('should throw an error if profile has empty columns array', async () => {
            const invalidConfig = {
                defaultProfile: 'Profile 1',
                profiles: [
                    {
                        label: 'Profile 1',
                        columns: []
                    }
                ]
            };

            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockResolvedValue({
                    id: 'test_library',
                    settings: {
                        export: invalidConfig
                    }
                })
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);

            await expect(domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx)).rejects.toThrow(
                /Invalid request/
            );
        });
    });
});
