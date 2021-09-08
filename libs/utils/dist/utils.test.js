"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const utils_1 = require("./utils");
describe('utils', () => {
    describe('getGraphqlQueryNameFromLibraryName', () => {
        test('Should format a string to camelCase', async function () {
            expect(utils_1.getGraphqlQueryNameFromLibraryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(utils_1.getGraphqlQueryNameFromLibraryName('Users & Groups')).toEqual('usersGroups');
            expect(utils_1.getGraphqlQueryNameFromLibraryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });
    describe('getGraphqlTypeFromLibraryName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function () {
            expect(utils_1.getGraphqlTypeFromLibraryName('not camel_case string!')).toEqual('NotCamelCaseString');
            expect(utils_1.getGraphqlTypeFromLibraryName('Users & Groups')).toEqual('UsersGroup');
            expect(utils_1.getGraphqlTypeFromLibraryName('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });
});
//# sourceMappingURL=utils.test.js.map