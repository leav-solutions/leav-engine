import utils from './utils';

describe('Utils', () => {
    describe('libNameToQueryName', () => {
        test('Should format a string to camelCase', async function() {
            const utilsModule = utils();
            expect(utilsModule.libNameToQueryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(utilsModule.libNameToQueryName('Users & Groups')).toEqual('usersGroups');
            expect(utilsModule.libNameToQueryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });
    describe('libNameToTypeName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function() {
            const utilsModule = utils();
            expect(utilsModule.libNameToTypeName('not camel_case string!')).toEqual('NotCamelCaseString');
            expect(utilsModule.libNameToTypeName('Users & Groups')).toEqual('UsersGroup');
            expect(utilsModule.libNameToTypeName('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });
});
