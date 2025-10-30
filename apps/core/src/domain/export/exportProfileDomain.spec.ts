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
        profileSelected: 'Profile 1',
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

        it('should return columns from the first profile if profileSelected not found', async () => {
            const configWithNonExistentProfile: IExportProfileConfig = {
                profileSelected: 'Non-existent Profile',
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

        it('should return undefined and log warning if no profile provided', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn()
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('', 'test_library', mockCtx);

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('No profile or library provided'));
            expect(mockLibraryDomain.getLibraryProperties).not.toHaveBeenCalled();
        });

        it('should return undefined and log warning if no library provided', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn()
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('Profile 1', '', mockCtx);

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('No profile or library provided'));
            expect(mockLibraryDomain.getLibraryProperties).not.toHaveBeenCalled();
        });

        it('should return undefined and log warning if export config is missing', async () => {
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
            const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Export profile config is missing'));
        });

        it('should handle columns with empty attributes', async () => {
            const configWithEmptyAttrs: IExportProfileConfig = {
                profileSelected: 'Profile 1',
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

        it('should return undefined and log warning if library properties throw error', async () => {
            const mockLibraryDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: jest.fn().mockRejectedValue(new Error('Library not found'))
            };

            const deps: IExportProfileDomainDeps = {
                'core.domain.library': mockLibraryDomain as ILibraryDomain
            };

            const domain = exportProfileDomain(deps);
            const result = await domain.getColumnsFromProfileConfig('Profile 1', 'test_library', mockCtx);

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Library not found'));
        });
    });
});
