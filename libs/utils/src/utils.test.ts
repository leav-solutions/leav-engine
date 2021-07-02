// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getGraphqlQueryNameFromLibraryName, getGraphqlTypeFromLibraryName} from './utils';

describe('utils', () => {
    describe('getGraphqlQueryNameFromLibraryName', () => {
        test('Should format a string to camelCase', async function () {
            expect(getGraphqlQueryNameFromLibraryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(getGraphqlQueryNameFromLibraryName('Users & Groups')).toEqual('usersGroups');
            expect(getGraphqlQueryNameFromLibraryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });

    describe('getGraphqlTypeFromLibraryName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function () {
            expect(getGraphqlTypeFromLibraryName('not camel_case string!')).toEqual('NotCamelCaseString');
            expect(getGraphqlTypeFromLibraryName('Users & Groups')).toEqual('UsersGroup');
            expect(getGraphqlTypeFromLibraryName('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });
});
