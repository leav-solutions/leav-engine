// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents, ActionsListIOTypes} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {AppPermissionsActions} from '../../_types/permissions';
import {mockAttrAdv, mockAttrAdvVersionable, mockAttrSimple, mockAttrTree} from '../../__tests__/mocks/attribute';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import attributeDomain from './attributeDomain';

describe('attributeDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'attributeDomainTest'
    };
    const mockConf = {
        lang: {
            default: 'fr'
        }
    };

    const mockAppPermDomain = {
        getAppPermission: global.__mockPromise(true)
    };

    const mockAppPermDomainForbidden = {
        getAppPermission: global.__mockPromise(false)
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAttributes', () => {
        test('Should return a list of attributes', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                config: mockConf
            });
            const attr = await attrDomain.getAttributes({ctx});

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(attr.list.length).toBe(2);
        });

        test('Should add default sort', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                config: mockConf
            });
            const attr = await attrDomain.getAttributes({ctx});

            expect(mockAttrRepo.getAttributes.mock.calls[0][0].params.sort).toMatchObject({field: 'id', order: 'asc'});
        });
    });

    describe('getLibraryAttributes', () => {
        test('Should return library attributes with all details', async () => {
            const attrs = [
                {
                    id: 'id',
                    format: 'text',
                    label: {en: 'ID'},
                    system: true,
                    type: 'link'
                },
                {
                    id: 'created_at',
                    format: 'numeric',
                    label: {en: 'Creation date'},
                    system: true,
                    type: 'index'
                },
                {
                    id: 'modified_at',
                    format: 'numeric',
                    label: {en: 'Modification date'},
                    system: true,
                    type: 'index'
                }
            ];

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: true}], totalCount: 0})
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getLibraryAttributes: global.__mockPromise(attrs)
            };

            const attrDomain = attributeDomain({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo
            });
            const libAttrs = await attrDomain.getLibraryAttributes('test', ctx);

            expect(mockAttrRepo.getLibraryAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getLibraryAttributes.mock.calls[0][0].libraryId).toBe('test');
            expect(libAttrs).toEqual(attrs);
        });

        test('Should throw if unknown library', async function () {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const attrDomain = attributeDomain({'core.infra.library': mockLibRepo as ILibraryRepo});

            await expect(attrDomain.getLibraryAttributes('test', ctx)).rejects.toThrow();
        });
    });

    describe('getLibraryFullTextAttributes', () => {
        test('Should return library full text attributes with all details', async () => {
            const attrs = [
                {
                    id: 'id',
                    format: 'text',
                    label: {en: 'ID'},
                    system: true,
                    type: 'link'
                }
            ];

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: true}], totalCount: 0})
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getLibraryFullTextAttributes: global.__mockPromise(attrs)
            };

            const attrDomain = attributeDomain({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo
            });
            const libAttrs = await attrDomain.getLibraryFullTextAttributes('test', ctx);

            expect(mockAttrRepo.getLibraryFullTextAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getLibraryFullTextAttributes.mock.calls[0][0].libraryId).toBe('test');
            expect(libAttrs).toEqual(attrs);
        });

        test('Should throw if unknown library', async function () {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const attrDomain = attributeDomain({'core.infra.library': mockLibRepo as ILibraryRepo});

            await expect(attrDomain.getLibraryFullTextAttributes('test', ctx)).rejects.toThrow();
        });
    });

    describe('getAttributeProperties', () => {
        test('Should return a list of attributes', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                config: mockConf
            });
            const attr = await attrDomain.getAttributeProperties({id: 'test', ctx});

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getAttributes).toBeCalledWith({
                params: {filters: {id: 'test'}, strictFilters: true},
                ctx
            });
            expect(attr).toMatchObject({id: 'test'});
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                config: mockConf
            });

            await expect(attrDomain.getAttributeProperties({id: 'test', ctx})).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        const mockALDomain: Mockify<IActionsListDomain> = {
            getAvailableActions: jest.fn().mockReturnValue([
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    output_types: ['string', 'number']
                },
                {
                    id: 'toNumber',
                    name: 'To Number',
                    output_types: ['number']
                },
                {
                    id: 'toJSON',
                    name: 'To JSON',
                    output_types: ['string']
                }
            ])
        };

        const mockUtils: Mockify<IUtils> = {
            isIdValid: jest.fn().mockReturnValue(true),
            mergeConcat: jest.fn().mockImplementation(o => o),
            getDefaultActionsList: jest.fn().mockReturnValue({
                [ActionsListEvents.SAVE_VALUE]: [
                    {
                        id: 'validateFormat',
                        name: 'Action name',
                        is_system: true
                    }
                ]
            })
        };

        test('Should save a new attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0}),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{}]);

            const newAttr = await attrDomain.saveAttribute({
                attrData: {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Test'}
                },
                ctx
            });

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(1);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(0);
            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.CREATE_ATTRIBUTE
            );

            expect(newAttr).toMatchObject({
                attrData: {
                    actions_list: {saveValue: [{is_system: true, id: 'validateFormat'}]},
                    format: 'text',
                    id: 'test',
                    type: 'advanced'
                },
                ctx
            });
        });

        test('Should throw a validation error if the attribute:id is forbidden', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0}),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{}]);

            await expect(
                attrDomain.saveAttribute({
                    attrData: {
                        id: 'whoAmI',
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.TEXT,
                        label: {fr: 'quiJeSuis', en: 'whoAmI'}
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            await expect(
                attrDomain.saveAttribute({
                    attrData: {
                        id: 'property',
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.TEXT,
                        label: {fr: 'propriété', en: 'property'}
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should update an attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const updatedLib = await attrDomain.saveAttribute({
                attrData: {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    actions_list: {saveValue: [{is_system: true, id: 'validateFormat', name: 'Validate Format'}]},
                    label: {fr: 'Test'}
                },
                ctx
            });

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(0);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(1);
            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.EDIT_ATTRIBUTE
            );

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should read data from DB for fields not specified in save', async function () {
            const attrData = {...mockAttrAdvVersionable};

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({
                    list: [attrData],
                    totalCount: 1
                }),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise(attrData)
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const updatedAttr = await attrDomain.saveAttribute({
                attrData: {
                    id: mockAttrAdvVersionable.id,
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.NUMERIC,
                    versions_conf: null
                },
                ctx
            });

            expect(mockAttrRepo.updateAttribute).toBeCalledWith({
                attrData: {
                    _key: '',
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
                    versions_conf: null,
                    values_list: {
                        enable: false
                    }
                },
                ctx
            });
        });

        test('When saving actions list, keep saved system actions', async () => {
            const attrData = {
                ...mockAttrAdv,
                actions_list: {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {id: 'validateFormat', name: 'Validate Format', is_system: true},
                        {id: 'toNumber', name: 'To Number', is_system: false}
                    ],
                    [ActionsListEvents.GET_VALUE]: [{id: 'toNumber', name: 'To Number', is_system: true}],
                    [ActionsListEvents.DELETE_VALUE]: []
                }
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({
                    list: [attrData],
                    totalCount: 1
                }),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise(attrData)
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const updatedAttr = await attrDomain.saveAttribute({
                attrData: {
                    id: mockAttrAdvVersionable.id,
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.NUMERIC,
                    actions_list: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {id: 'toJSON', name: 'To JSON'},
                            {
                                id: 'validateFormat',
                                is_system: true,
                                name: 'Validate Format',
                                params: [{name: 'myParam', value: 'param_value'}]
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [{id: 'toNumber', is_system: true, name: 'To Number'}],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                },
                ctx
            });

            expect(mockAttrRepo.updateAttribute.mock.calls[0][0].attrData.actions_list).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [
                    {id: 'toJSON', name: 'To JSON', is_system: false},
                    {
                        id: 'validateFormat',
                        is_system: true,
                        name: 'Validate Format',
                        params: [{name: 'myParam', value: 'param_value'}]
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [{id: 'toNumber', is_system: true, name: 'To Number'}],
                [ActionsListEvents.DELETE_VALUE]: []
            });
        });

        test('Should throw if actions list type is invalid', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {
                    saveValue: [
                        {is_system: true, id: 'validateFormat', name: 'Validate Format'},
                        {is_system: false, id: 'toNumber', name: 'To Number'}
                    ]
                },
                label: {fr: 'Test'}
            };

            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if invalid ID', async function () {
            const mockUtilsInvalidID: Mockify<IUtils> = {
                isIdValid: jest.fn().mockReturnValue(false)
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {saveValue: [{is_system: true, id: 'toJSON', name: 'To JSON'}]},
                label: {fr: 'Test'}
            };

            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if system action list is missing', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                label: {fr: 'Test'},
                actions_list: {saveValue: [{is_system: true, id: 'toJSON', name: 'To JSON'}]}
            };

            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if forbidden action', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomainForbidden as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                actions_list: {saveValue: [{is_system: true, id: 'toJSON', name: 'To JSON'}]},
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(PermissionError);
        });

        test('Should throw if multiple values on simple or simple link attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createAttribute: jest.fn(),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSaveSimple = {
                id: 'test',
                type: AttributeTypes.SIMPLE,
                label: {fr: 'Test'},
                multiple_values: true
            };
            await expect(attrDomain.saveAttribute({attrData: attrToSaveSimple, ctx})).rejects.toThrow(ValidationError);

            const attrToSaveSimpleLink = {
                id: 'test',
                type: AttributeTypes.SIMPLE_LINK,
                label: {fr: 'Test'},
                multiple_values: true
            };
            await expect(attrDomain.saveAttribute({attrData: attrToSaveSimpleLink, ctx})).rejects.toThrow(
                ValidationError
            );
        });

        test('Should throw if using invalid tree on versions conf', async function () {
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

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                config: mockConf
            });

            attrDomain.getAttributes = global.__mockPromise([{}]);

            await expect(attrDomain.saveAttribute({attrData: mockAttrAdvVersionable, ctx})).rejects.toThrow(
                ValidationError
            );
        });

        test('Check required fields at creation', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                config: mockConf
            });

            const attrWithNoType: Partial<IAttribute> = {
                id: 'test_attr',
                format: AttributeFormats.TEXT,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoType as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );

            const attrWithNoFormat: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoFormat as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLabel: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoLabel as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLinkedLibrary: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE_LINK,
                label: {fr: 'Test'}
            };
            await expect(
                attrDomain.saveAttribute({attrData: attrWithNoLinkedLibrary as IAttribute, ctx})
            ).rejects.toThrow(ValidationError);

            const attrWithNoLinkedTree: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.TREE,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoLinkedTree as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );
        });

        describe('Metadata', () => {
            test('Should throw if saving metadata on simple attribute', async () => {
                const mockAttrRepo: Mockify<IAttributeRepo> = {
                    getAttributes: global.__mockPromise({list: [{...mockAttrSimple}]})
                };

                const attrDomain = attributeDomain({
                    'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils,
                    config: mockConf
                });

                attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

                await expect(
                    attrDomain.saveAttribute({
                        attrData: {
                            ...mockAttrSimple,
                            id: 'metadata_attribute',
                            metadata_fields: ['some_simple_attribute']
                        },
                        ctx
                    })
                ).rejects.toThrow(ValidationError);
            });

            test('Should throw if invalid metadata attribute', async () => {
                const mockAttrRepo: Mockify<IAttributeRepo> = {
                    getAttributes: jest
                        .fn()
                        .mockImplementation(({params: {filters}, ctx: ct}) =>
                            filters.id === 'metadata_attribute'
                                ? {list: [{...mockAttrAdv, id: 'metadata_attribute'}]}
                                : {list: []}
                        )
                };

                const attrDomain = attributeDomain({
                    'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils,
                    config: mockConf
                });

                attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

                await expect(
                    attrDomain.saveAttribute({
                        attrData: {
                            ...mockAttrAdv,
                            id: 'metadata_attribute',
                            metadata_fields: ['some_invalid_attribute']
                        },
                        ctx
                    })
                ).rejects.toThrow(ValidationError);
            });
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {id: 'test_attribute', system: false, label: {fr: 'Test'}, format: 'text', type: 'index'};

        test('Should delete an attribute and return deleted attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise(attrData)};
            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain
            });
            attrDomain.getAttributes = global.__mockPromise({list: [attrData], totalCount: 1});

            const deleteRes = await attrDomain.deleteAttribute({id: attrData.id, ctx});

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.DELETE_ATTRIBUTE
            );
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain({'core.infra.attribute': mockAttrRepo as IAttributeRepo});
            attrDomain.getAttributes = global.__mockPromise([]);

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow();
        });

        test('Should throw if system attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain({'core.infra.attribute': mockAttrRepo as IAttributeRepo});
            attrDomain.getAttributes = global.__mockPromise({list: [{system: true}], totalCount: 1});

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow();
        });

        test('Should throw if forbidden action', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain({
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.domain.permission.app': mockAppPermDomainForbidden as IAppPermissionDomain
            });
            attrDomain.getAttributes = global.__mockPromise({list: [], totalCount: 0});

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow(PermissionError);
        });
    });

    describe('getInputType', () => {
        const attrDomain = attributeDomain();
        test('Return input type by format', async () => {
            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.TEXT}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });
            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.DATE}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });
            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.ENCRYPTED}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });

            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.NUMERIC}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });

            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.BOOLEAN}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            });

            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.EXTENDED}, ctx})
            ).toEqual(
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
            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.TEXT}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });
            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.DATE}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });
            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.ENCRYPTED}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });

            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.NUMERIC}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });

            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.BOOLEAN}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            });

            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.EXTENDED}, ctx})
            ).toEqual(
                {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.OBJECT],
                    [ActionsListEvents.GET_VALUE]: [
                        ActionsListIOTypes.STRING,
                        ActionsListIOTypes.NUMBER,
                        ActionsListIOTypes.OBJECT,
                        ActionsListIOTypes.BOOLEAN
                    ],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.OBJECT]
                } // json
            );
        });
    });
});
