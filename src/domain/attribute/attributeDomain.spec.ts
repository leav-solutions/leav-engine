import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents, ActionsListIOTypes} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {AdminPermissionsActions} from '../../_types/permissions';
import {mockAttrAdvVersionable, mockAttrSimple, mockAttrTree} from '../../__tests__/mocks/attribute';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import attributeDomain from './attributeDomain';

describe('attributeDomain', () => {
    const queryInfos = {userId: 1};
    const mockConf = {
        lang: {
            default: 'fr'
        }
    };

    describe('getAttributes', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 0})
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo, null, null, null, null, mockConf);
            const attr = await attrDomain.getAttributes();

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(attr.list.length).toBe(2);
        });

        test('Should add default sort', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 0})
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo, null, null, null, null, mockConf);
            const attr = await attrDomain.getAttributes();

            expect(mockAttrRepo.getAttributes.mock.calls[0][0].sort).toMatchObject({field: 'id', order: 'asc'});
        });
    });

    describe('getAttributeProperties', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}], totalCount: 0})
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo, null, null, null, null, mockConf);
            const attr = await attrDomain.getAttributeProperties('test');

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getAttributes).toBeCalledWith({filters: {id: 'test'}, strictFilters: true});
            expect(attr).toMatchObject({id: 'test'});
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo, null, null, null, null, mockConf);

            await expect(attrDomain.getAttributeProperties('test')).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        const mockALDomain: Mockify<IActionsListDomain> = {
            getAvailableActions: jest.fn().mockReturnValue([
                {
                    name: 'validateFormat',
                    output_types: ['string']
                },
                {
                    name: 'toNumber',
                    output_types: ['number']
                },
                {
                    name: 'toJSON',
                    output_types: ['string']
                }
            ])
        };

        const mockUtils: Mockify<IUtils> = {
            validateID: jest.fn().mockReturnValue(true),
            mergeConcat: jest.fn().mockImplementation(o => o)
        };

        test('Should save a new attribute', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0}),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{}]);

            const newAttr = await attrDomain.saveAttribute(
                {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Test'}
                },
                queryInfos
            );

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(1);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(0);
            expect(mockPermDomain.getAdminPermission).toBeCalled();
            expect(mockPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermissionsActions.CREATE_ATTRIBUTE);

            expect(newAttr).toMatchObject({
                actions_list: {saveValue: [{is_system: true, name: 'validateFormat'}]},
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
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const updatedLib = await attrDomain.saveAttribute(
                {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    actions_list: {saveValue: [{is_system: true, name: 'validateFormat'}]},
                    label: {fr: 'Test'}
                },
                queryInfos
            );

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(0);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(1);
            expect(mockPermDomain.getAdminPermission).toBeCalled();
            expect(mockPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermissionsActions.EDIT_ATTRIBUTE);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should read data from DB for fields not specified in save', async function() {
            const mockPermDomain = {
                getAdminPermission: global.__mockPromise(true)
            };

            const attrData = {...mockAttrAdvVersionable};

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({
                    list: [attrData],
                    totalCount: 1
                }),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise(attrData)
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const updatedAttr = await attrDomain.saveAttribute(
                {
                    id: mockAttrAdvVersionable.id,
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.NUMERIC,
                    versions_conf: null
                },
                queryInfos
            );

            expect(mockAttrRepo.updateAttribute).toBeCalledWith({
                id: 'advanced_attribute',
                label: {
                    fr: 'Mon Attribut',
                    en: 'My Attribute'
                },
                type: 'advanced',
                format: 'numeric',
                multiple_values: false,
                system: false,
                linked_library: null,
                linked_tree: null,
                embedded_fields: null,
                actions_list: null,
                permissions_conf: null,
                versions_conf: null
            });
        });

        test('Should throw if actions list type is invalid', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {
                    saveValue: [{is_system: true, name: 'validateFormat'}, {is_system: false, name: 'toNumber'}]
                },
                label: {fr: 'Test'}
            };

            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Should throw if invalid ID', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockUtilsInvalidID: Mockify<IUtils> = {
                validateID: jest.fn().mockReturnValue(false)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {saveValue: [{is_system: true, name: 'toJSON'}]},
                label: {fr: 'Test'}
            };

            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Should throw if system action list is missing', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                label: {fr: 'Test'},
                actions_list: {saveValue: [{is_system: true, name: 'toJSON'}]}
            };

            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Should throw if forbidden action', async function() {
            const mockPermDomain = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                actions_list: {saveValue: [{is_system: true, name: 'toJSON'}]},
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute(attrToSave, queryInfos)).rejects.toThrow(PermissionError);
        });

        test('Should throw if multiple values on simple or simple link attribute', async function() {
            const mockPermDomain = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                null,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                null,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSaveSimple = {
                id: 'test',
                type: AttributeTypes.SIMPLE,
                label: {fr: 'Test'},
                multiple_values: true
            };
            await expect(attrDomain.saveAttribute(attrToSaveSimple, queryInfos)).rejects.toThrow(ValidationError);

            const attrToSaveSimpleLink = {
                id: 'test',
                type: AttributeTypes.SIMPLE_LINK,
                label: {fr: 'Test'},
                multiple_values: true
            };
            await expect(attrDomain.saveAttribute(attrToSaveSimpleLink, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Should throw if using invalid tree on versions conf', async function() {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: jest.fn().mockImplementation(filters => {
                    const list = filters.type === AttributeTypes.TREE ? [mockAttrTree] : [];
                    return Promise.resolve({list, totalCount: list.length});
                }),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                mockTreeRepo as ITreeRepo,
                mockConf
            );

            attrDomain.getAttributes = global.__mockPromise([{}]);

            await expect(attrDomain.saveAttribute(mockAttrAdvVersionable, queryInfos)).rejects.toThrow(ValidationError);
        });

        test('Check required fields at creation', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain(
                mockAttrRepo as IAttributeRepo,
                mockALDomain as IActionsListDomain,
                mockPermDomain as IPermissionDomain,
                mockUtils as IUtils,
                mockTreeRepo as ITreeRepo,
                mockConf
            );

            const attrWithNoType: Partial<IAttribute> = {
                id: 'test_attr',
                format: AttributeFormats.TEXT,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute(attrWithNoType as IAttribute, queryInfos)).rejects.toThrow(
                ValidationError
            );

            const attrWithNoFormat: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute(attrWithNoFormat as IAttribute, queryInfos)).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLabel: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Test'}
            };
            await expect(attrDomain.saveAttribute(attrWithNoLabel as IAttribute, queryInfos)).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLinkedLibrary: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE_LINK,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute(attrWithNoLinkedLibrary as IAttribute, queryInfos)).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLinkedTree: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.TREE,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute(attrWithNoLinkedTree as IAttribute, queryInfos)).rejects.toThrow(
                ValidationError
            );
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
            attrDomain.getAttributes = global.__mockPromise({list: [attrData], totalCount: 1});

            const deleteRes = await attrDomain.deleteAttribute(attrData.id, queryInfos);

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
            expect(mockPermDomain.getAdminPermission).toBeCalled();
            expect(mockPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermissionsActions.DELETE_ATTRIBUTE);
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
            attrDomain.getAttributes = global.__mockPromise({list: [{system: true}], totalCount: 1});

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
            attrDomain.getAttributes = global.__mockPromise({list: [], totalCount: 0});

            await expect(attrDomain.deleteAttribute(attrData.id, queryInfos)).rejects.toThrow(PermissionError);
        });
    });

    describe('getInputType', () => {
        const attrDomain = attributeDomain();
        test('Return input type by format', async () => {
            expect(attrDomain.getInputTypes({...mockAttrSimple, format: AttributeFormats.TEXT})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });
            expect(attrDomain.getInputTypes({...mockAttrSimple, format: AttributeFormats.DATE})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });
            expect(attrDomain.getInputTypes({...mockAttrSimple, format: AttributeFormats.ENCRYPTED})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });

            expect(attrDomain.getInputTypes({...mockAttrSimple, format: AttributeFormats.NUMERIC})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });

            expect(attrDomain.getInputTypes({...mockAttrSimple, format: AttributeFormats.BOOLEAN})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            });

            expect(attrDomain.getInputTypes({...mockAttrSimple, format: AttributeFormats.EXTENDED})).toEqual(
                {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
                } // json
            );
        });
    });

    describe('getOutputType', () => {
        const attrDomain = attributeDomain();
        test('Return output type by format', async () => {
            expect(attrDomain.getOutputTypes({...mockAttrSimple, format: AttributeFormats.TEXT})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });
            expect(attrDomain.getOutputTypes({...mockAttrSimple, format: AttributeFormats.DATE})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });
            expect(attrDomain.getOutputTypes({...mockAttrSimple, format: AttributeFormats.ENCRYPTED})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });

            expect(attrDomain.getOutputTypes({...mockAttrSimple, format: AttributeFormats.NUMERIC})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });

            expect(attrDomain.getOutputTypes({...mockAttrSimple, format: AttributeFormats.BOOLEAN})).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            });

            expect(attrDomain.getOutputTypes({...mockAttrSimple, format: AttributeFormats.EXTENDED})).toEqual(
                {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.GET_VALUE]: [
                        ActionsListIOTypes.STRING,
                        ActionsListIOTypes.NUMBER,
                        ActionsListIOTypes.OBJECT,
                        ActionsListIOTypes.BOOLEAN
                    ],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
                } // json
            );
        });
    });
});
