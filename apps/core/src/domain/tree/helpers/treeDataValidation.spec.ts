// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {PermissionsRelations} from '../../../_types/permissions';
import {mockLibrary} from '../../../__tests__/mocks/library';
import {mockFilesTree, mockTree} from '../../../__tests__/mocks/tree';
import treeDataValidation from './treeDataValidation';

describe('TreeDataValidation', () => {
    describe('Validate', () => {
        const ctx: IQueryInfos = {
            userId: '1'
        };

        const mockUtils: Mockify<IUtils> = {
            isIdValid: jest.fn().mockReturnValue(true)
        };

        const mockLibRepo: Mockify<ILibraryRepo> = {
            getLibraries: global.__mockPromise({
                list: [
                    {...mockLibrary, id: 'lib1'},
                    {...mockLibrary, id: 'lib2'}
                ]
            })
        };

        test('Should throw if ID is invalid', async () => {
            const mockUtilsInvalidId: Mockify<IUtils> = {
                isIdValid: jest.fn().mockReturnValue(false)
            };

            const validationHelper = treeDataValidation({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.utils': mockUtilsInvalidId as IUtils
            });

            await expect(validationHelper.validate({...mockTree, id: 'Invalid ID'}, ctx)).rejects.toThrow(
                ValidationError
            );
        });

        test('Should throw if unkown library', async () => {
            const mockLibRepoNotFound: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: []})
            };

            const validationHelper = treeDataValidation({
                'core.infra.library': mockLibRepoNotFound as ILibraryRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(validationHelper.validate({...mockTree}, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if saving permissions conf on invalid library', async () => {
            const validationHelper = treeDataValidation({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(
                validationHelper.validate(
                    {
                        ...mockTree,
                        permissions_conf: {
                            invalid_lib: {
                                permissionTreeAttributes: ['category'],
                                relation: PermissionsRelations.AND
                            }
                        }
                    },
                    ctx
                )
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if, on files behavior, binding a non-files library', async () => {
            const mockLibRepoNotFiles: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{...mockLibrary, id: 'lib1'}]})
            };
            const validationHelper = treeDataValidation({
                'core.infra.library': mockLibRepoNotFiles as ILibraryRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(validationHelper.validate({...mockFilesTree}, ctx)).rejects.toThrow(ValidationError);
        });
    });
});
