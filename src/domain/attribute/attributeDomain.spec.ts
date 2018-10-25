import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import {AdminPermisisonsActions} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import attributeDomain from './attributeDomain';

describe('attributeDomain', () => {
    const queryInfos = {userId: 1};

    describe('getAttributes', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test'}, {id: 'test2'}])
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            const attr = await attrDomain.getAttributes();

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(attr.length).toBe(2);
        });
    });

    describe('getAttributeProperties', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test'}])
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            const attr = await attrDomain.getAttributeProperties('test');

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getAttributes).toBeCalledWith({id: 'test'}, true);
            expect(attr).toMatchObject({id: 'test'});
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([])
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);

            await expect(attrDomain.getAttributeProperties('test')).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        const mockALDomain: Mockify<IActionsListDomain> = {
            getAvailableActions: jest.fn().mockReturnValue([
                {
                    name: 'validateFormat',
                    outputTypes: ['string']
                },
                {
                    name: 'toNumber',
                    outputTypes: ['number']
                },
                {
                    name: 'toJSON',
                    outputTypes: ['string']
                }
            ])
        };

        test('Should save a new attribute', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([]),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain
            );

            attrDomain.getAttributes = global.__mockPromise([{}]);

            const newAttr = await attrDomain.saveAttribute(
                {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT
                },
                queryInfos
            );

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(1);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(0);
            expect(mockPermDomain.getAdminPermission).toBeCalled();
            expect(mockPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermisisonsActions.CREATE_ATTRIBUTE);

            expect(newAttr).toMatchObject({
                actions_list: {saveValue: [{isSystem: true, name: 'validateFormat'}]},
                format: 'text',
                id: 'test',
                type: 'advanced'
            });
        });

        test('Should update an attribute', async function() {
            const mockPermDomain = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test', system: false}]),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const updatedLib = await attrDomain.saveAttribute(
                {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    actions_list: {saveValue: [{isSystem: true, name: 'validateFormat'}]}
                },
                queryInfos
            );

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(0);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(1);
            expect(mockPermDomain.getAdminPermission).toBeCalled();
            expect(mockPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermisisonsActions.EDIT_ATTRIBUTE);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should throw if actions list type is invalid', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test', system: false}]),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {
                    saveValue: [{isSystem: true, name: 'validateFormat'}, {isSystem: false, name: 'toNumber'}]
                }
            };

            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Should throw if system action list is missing', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test', system: false}]),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {saveValue: [{isSystem: true, name: 'toJSON'}]}
            };

            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Should throw if forbidden action', async function() {
            const mockPermDomain = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test', system: false}]),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {saveValue: [{isSystem: true, name: 'toJSON'}]}
            };
            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(PermissionError);
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {id: 'test_attribute', system: false, label: {fr: 'Test'}, format: 'text', type: 'index'};

        test('Should delete an attribute and return deleted attribute', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise(attrData)};
            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                null,
                mockPermDomain as IPermissionDomain
            );
            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const deleteRes = await attrDomain.deleteAttribute(attrData.id, queryInfos);

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
            expect(mockPermDomain.getAdminPermission).toBeCalled();
            expect(mockPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermisisonsActions.DELETE_ATTRIBUTE);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            attrDomain.getAttributes = global.__mockPromise([]);

            await expect(attrDomain.deleteAttribute(attrData.id, queryInfos)).rejects.toThrow();
        });

        test('Should throw if system attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            attrDomain.getAttributes = global.__mockPromise([{system: true}]);

            await expect(attrDomain.deleteAttribute(attrData.id, queryInfos)).rejects.toThrow();
        });

        test('Should throw if forbidden action', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                null,
                mockPermDomain as IPermissionDomain
            );
            attrDomain.getAttributes = global.__mockPromise([]);

            await expect(attrDomain.deleteAttribute(attrData.id, queryInfos)).rejects.toThrow(PermissionError);
        });
    });
});
