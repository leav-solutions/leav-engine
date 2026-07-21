import {type ToAny} from '../../utils/utils';
import {AttributeCondition, type IRecord, type IRecordIdentity} from '../../_types/record';
import jsonschema, {type ValidatorResult} from 'jsonschema';
import sdoDomain, {type ISDODomain, type ISDODomainDeps} from './sdoDomain';
import {mockSDO, mockSDOMapping, sdoGlobalSettings} from '../../__tests__/mocks/sdo/data';
import {
    mockEventsManagerDomain,
    mockGlobalSettingsDomain,
    mockRecordDomain,
    mockRecordRepo,
    mockSystemQueryContext,
    mockValueDomain,
} from '../../__tests__/mocks/sdo/core';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type IListWithCursor, type IList} from '../../_types/list';
import {type IStandardValue, type ILinkValue, type ITreeValue, type IValue} from '../../_types/value';
import {
    type SDOMappingAttributeFormat,
    type ISDOMapping,
    type ISDOMappingAttribute,
    sdoPathIdentifierUuid,
    type ISDO,
} from '../../_types/sdo';
import {EventAction} from '@leav/utils';
import {SdoAttributes} from '../../_constants/systemAttributes';
import {mockSDOUtils} from '../../__tests__/mocks/sdo/domains';
import {type IGlobalSettings} from '../../_types/globalSettings';

const mockStandardAttributeRecordFieldValues = [
    {
        payload: 'payload',
        raw_payload: 'raw_payload',
    },
];

const mockLinkAttributeRecordFieldValues = [
    {
        payload: {id: 'id'},
    },
];

const mockRecordSystemData = {
    uuid: 'record-uuid',
    active: true,
    created_by: 'creator-id',
    created_at: 1717000000,
    modified_by: 'modificator-id',
    modified_at: 1717100000,
};

const expectedSDOSystemContent = {
    systemId: 'record-uuid',
    systemActive: true,
    systemCreator: 'creator-id',
    systemCreationDate: 1717000000,
    systemLastModificator: 'modificator-id',
    systemLastModifiedDate: 1717100000,
    systemLabel: 'record-label',
};

const mockGetAttributeByPath = vi.fn();

const deps: ToAny<ISDODomainDeps> = {
    'core.utils.sdo': mockSDOUtils,
    'core.domain.attribute.helpers.getAttributeByPath': mockGetAttributeByPath,
    'core.domain.record': mockRecordDomain,
    'core.domain.globalSettings': mockGlobalSettingsDomain,
    'core.domain.eventsManager': mockEventsManagerDomain,
    'core.domain.value': mockValueDomain,
    'core.infra.record': mockRecordRepo,
    config: {sdo: {clientId: 'leav-client', applicationName: 'leav'}},
};

const jsonschemaSpy = vi.spyOn(jsonschema, 'validate');

const uuidAttribute: IAttribute = {id: 'uuid', type: AttributeTypes.SIMPLE};
const mockSDORecordAttributes: IList<IAttribute> = {
    list: [
        uuidAttribute,
        {id: 'simple', type: AttributeTypes.SIMPLE},
        {id: 'simple_link', type: AttributeTypes.SIMPLE_LINK},
        {id: 'advanced', type: AttributeTypes.ADVANCED, multiple_values: true},
        {id: 'advanced_link', type: AttributeTypes.ADVANCED_LINK, multiple_values: true},
    ],
} as IList<IAttribute>;

describe('sdoDomain', () => {
    let _sdoDomain: ISDODomain;
    beforeEach(() => {
        vi.clearAllMocks();

        mockGlobalSettingsDomain.getSettings.mockResolvedValue({
            settings: {sdo: sdoGlobalSettings},
        } as unknown as IGlobalSettings);
        mockEventsManagerDomain.sendDatabaseEvent.mockResolvedValue(undefined);
        mockRecordDomain.find.mockResolvedValue({list: []} as IListWithCursor<IRecord>);
        mockSDOUtils.tmpRecordIdToUuid.mockImplementation((recordId: string) => recordId);
        mockRecordRepo.getRecord.mockImplementation(async ({recordId}) => ({uuid: recordId}));
        mockRecordDomain.getRecordIdentity.mockResolvedValue({
            getLabel: vi.fn().mockResolvedValue('record-label'),
        } as unknown as IRecordIdentity);
        _sdoDomain = sdoDomain(deps);
    });

    describe('schemaValidation', () => {
        it('[-] should throw an error when missing field', async () => {
            const mockSDOMissingField = {
                system: {systemId: '1'},
            };

            await expect(_sdoDomain.schemaValidation(mockSDOMissingField as ISDO['content'])).rejects.toThrow();
            expect(jsonschemaSpy).toHaveBeenCalled();
        });

        it('[+] should NOT throw an error when validate', async () => {
            // Core validates against the generic schema (system + info required)
            await expect(
                _sdoDomain.schemaValidation({
                    system: {
                        systemId: '1',
                        systemActive: true,
                        systemCreator: 'created_id',
                        systemCreationDate: Date.now(),
                        systemLastModificator: 'modificator_id',
                        systemLastModifiedDate: Date.now(),
                        systemLabel: 'my label',
                    },
                    info: {},
                }),
            ).resolves.not.toThrow();
            expect(jsonschemaSpy).toHaveBeenCalled();
        });
    });

    describe('getRecordSDO', () => {
        it('[-] should throw if the record is not found', async () => {
            await expect(
                _sdoDomain.getRecordSDO(
                    mockSDOMapping[mockSDO.name].leavLibraryId,
                    'entity123',
                    mockSDOMapping,
                    'CREATE',
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow(/Export sdo record not found/);
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            expect(mockRecordDomain.find).toHaveBeenNthCalledWith(1, {
                params: {
                    library: mockSDOMapping[mockSDO.name].leavLibraryId,
                    filters: [
                        {
                            field: 'id',
                            value: 'entity123',
                            condition: AttributeCondition.EQUAL,
                        },
                    ],
                    retrieveInactive: true,
                },
                ctx: mockSystemQueryContext,
            });
            expect(mockRecordDomain.getRecordFieldValue).not.toHaveBeenCalled();
            expect(mockValueDomain.saveValue).not.toHaveBeenCalled();
        });

        it('[-] should throw an error if the jsonschema invalidate the data', async () => {
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'record123', attribute: 'test value'}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                {
                    payload: 'attribute value',
                },
            ]);
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [
                    {id: 'wrong', type: AttributeTypes.SIMPLE},
                    {id: 'uuid', type: AttributeTypes.SIMPLE},
                ].find(a => a.id === attributePath),
            );

            const wrongSchemaMapping = {
                campaign: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        'wrong.mapping': {
                            leavAttributeId: 'wrong',
                            valueRequired: true,
                            format: 'string' as SDOMappingAttributeFormat,
                        },
                        [sdoPathIdentifierUuid]: {
                            leavAttributeId: 'uuid',
                            valueRequired: true,
                            format: 'string' as SDOMappingAttributeFormat,
                        },
                    },
                },
            };

            await expect(
                _sdoDomain.getRecordSDO(
                    mockSDOMapping[mockSDO.name].leavLibraryId,
                    'entity123',
                    wrongSchemaMapping,
                    'CREATE',
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow();
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            // 2 mapped attributes ("wrong", "uuid") + 2 application-traceability lookups in _createSDO.
            expect(mockRecordDomain.getRecordFieldValue).toHaveBeenCalledTimes(4);
            expect(jsonschemaSpy).toHaveBeenCalled();
            expect(mockValueDomain.saveValue).not.toHaveBeenCalled();
        });

        describe('values to sdo', () => {
            const sdoMappingName = 'test';
            const attributeId = 'attributeId';
            const libId = 'libId';
            beforeEach(() => {
                jsonschemaSpy.mockReturnValue({} as ValidatorResult);
                mockRecordDomain.find.mockResolvedValue({
                    list: [{id: 'entity', ...mockRecordSystemData}],
                } as IListWithCursor<IRecord>);
            });

            function simplifySdoMapping(sdoKey: string, sdoMapping: ISDOMappingAttribute): ISDOMapping {
                return {
                    [sdoMappingName]: {
                        leavLibraryId: libId,
                        sdoAttributes: {
                            [sdoKey]: sdoMapping,
                        },
                    },
                };
            }

            async function assertSdoExport(
                value: IValue[],
                format: SDOMappingAttributeFormat,
                expectedValue: unknown,
            ): Promise<void> {
                mockRecordDomain.getRecordFieldValue.mockResolvedValueOnce(value);
                const mapping = simplifySdoMapping(attributeId, {
                    leavAttributeId: attributeId,
                    valueRequired: false,
                    format,
                });
                expect(
                    await _sdoDomain.getRecordSDO(libId, 'entity', mapping, 'CREATE', mockSystemQueryContext),
                ).toMatchObject({
                    content: {
                        system: {systemId: 'record-uuid'},
                        [attributeId]: expectedValue,
                    },
                });
            }

            describe('simple attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.SIMPLE}].find(
                            a => a.id === attributePath,
                        ),
                    );
                });

                it('should set string', async () => {
                    await assertSdoExport([{raw_payload: '42'}] as IStandardValue[], 'string', '42');
                });

                it('should set boolean', async () => {
                    await assertSdoExport([{raw_payload: false}] as IStandardValue[], 'boolean', false);
                });

                it('should set integer', async () => {
                    await assertSdoExport([{raw_payload: 42}] as IStandardValue[], 'integer', 42);
                });

                it('should set number', async () => {
                    await assertSdoExport([{raw_payload: 42.5}] as IStandardValue[], 'number', 42.5);
                });

                it('should unset with null', async () => {
                    await assertSdoExport([], 'string', null);
                    await assertSdoExport([], 'boolean', null);
                    await assertSdoExport([], 'integer', null);
                    await assertSdoExport([], 'number', null);
                });
            });

            describe('advanced mono attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.ADVANCED}].find(
                            a => a.id === attributePath,
                        ),
                    );
                });

                it('should set string', async () => {
                    await assertSdoExport([{raw_payload: '42'}] as IStandardValue[], 'string', '42');
                });

                it('should set boolean', async () => {
                    await assertSdoExport([{raw_payload: false}] as IStandardValue[], 'boolean', false);
                });

                it('should set integer', async () => {
                    await assertSdoExport([{raw_payload: 42}] as IStandardValue[], 'integer', 42);
                });

                it('should set number', async () => {
                    await assertSdoExport([{raw_payload: 42.5}] as IStandardValue[], 'number', 42.5);
                });

                it('should unset with null', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([] as IStandardValue[]);

                    await assertSdoExport([], 'string', null);
                    await assertSdoExport([], 'boolean', null);
                    await assertSdoExport([], 'integer', null);
                    await assertSdoExport([], 'number', null);
                });
            });

            describe('advanced multiple attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.ADVANCED, multiple_values: true}].find(
                            a => a.id === attributePath,
                        ),
                    );
                });

                it('should set array string one element', async () => {
                    await assertSdoExport([{raw_payload: '42'}] as IStandardValue[], 'array', ['42']);
                });

                it('should set array string with many elements', async () => {
                    await assertSdoExport([{raw_payload: '42'}, {raw_payload: '43'}] as IStandardValue[], 'array', [
                        '42',
                        '43',
                    ]);
                });

                it('should set array boolean', async () => {
                    await assertSdoExport([{raw_payload: false}, {raw_payload: true}] as IStandardValue[], 'array', [
                        false,
                        true,
                    ]);
                });

                it('should set array integer', async () => {
                    await assertSdoExport(
                        [{raw_payload: 42}, {raw_payload: 43}] as IStandardValue[],
                        'array',
                        [42, 43],
                    );
                });

                it('should set array number', async () => {
                    await assertSdoExport(
                        [{raw_payload: 42.5}, {raw_payload: 43.5}] as IStandardValue[],
                        'array',
                        [42.5, 43.5],
                    );
                });

                it('should unset with empty array', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([] as IStandardValue[]);

                    await assertSdoExport([], 'array', []);
                });
            });

            describe('simple link attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.SIMPLE_LINK}].find(
                            a => a.id === attributePath,
                        ),
                    );
                });

                it('should set with record uuid string', async () => {
                    await assertSdoExport([{payload: {id: '42'}}] as ILinkValue[], 'string', '42');
                });

                it('should unset with null', async () => {
                    await assertSdoExport([], 'string', null);
                });
            });

            describe('advanced link mono attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.ADVANCED_LINK}].find(
                            a => a.id === attributePath,
                        ),
                    );
                });

                it('should set with record uuid string', async () => {
                    await assertSdoExport([{payload: {id: '42'}}] as ILinkValue[], 'string', '42');
                });

                it('should unset with null', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([] as IStandardValue[]);

                    await assertSdoExport([], 'string', null);
                });
            });

            describe('advanced link multiple attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [
                            uuidAttribute,
                            {id: attributeId, type: AttributeTypes.ADVANCED_LINK, multiple_values: true},
                        ].find(a => a.id === attributePath),
                    );
                });

                it('should set array record uuid one element', async () => {
                    await assertSdoExport([{payload: {id: '42'}}] as ILinkValue[], 'array', ['42']);
                });

                it('should set array record uuid many elements', async () => {
                    await assertSdoExport([{payload: {id: '42'}}, {payload: {id: '43'}}] as ILinkValue[], 'array', [
                        '42',
                        '43',
                    ]);
                });

                it('should unset with empty array', async () => {
                    await assertSdoExport([], 'array', []);
                });
            });

            describe('tree mono attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.TREE}].find(a => a.id === attributePath),
                    );
                });

                it('should set with record uuid string', async () => {
                    await assertSdoExport([{payload: {record: {id: '42'}}}] as ITreeValue[], 'string', '42');
                });

                it('should unset with null', async () => {
                    await assertSdoExport([], 'string', null);
                });
            });

            describe('tree multiple attribute', () => {
                beforeEach(() => {
                    mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                        [uuidAttribute, {id: attributeId, type: AttributeTypes.TREE, multiple_values: true}].find(
                            a => a.id === attributePath,
                        ),
                    );
                });

                it('should set array record uuid one element', async () => {
                    await assertSdoExport([{payload: {record: {id: '42'}}}] as ITreeValue[], 'array', ['42']);
                });

                it('should set array record uuid many elements', async () => {
                    await assertSdoExport(
                        [{payload: {record: {id: '42'}}}, {payload: {record: {id: '43'}}}] as ITreeValue[],
                        'array',
                        ['42', '43'],
                    );
                });

                it('should unset with empty array', async () => {
                    await assertSdoExport([], 'array', []);
                });
            });
        });

        it('[+] Should map simple, advanced, simpleLink and advancedLink attributes', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue.mockImplementation(async ({attributePath}) => {
                switch (attributePath) {
                    case uuidAttribute.id:
                        return [
                            {
                                raw_payload: 'test-uuid',
                            } as IStandardValue,
                        ];
                    case 'simpleAttribute':
                        return [
                            {
                                raw_payload: true,
                            } as IStandardValue,
                        ];
                    case 'advancedAttribute':
                        return [
                            {
                                raw_payload: 'red',
                            } as IStandardValue,
                            {
                                raw_payload: 'blue',
                            } as IStandardValue,
                        ];
                    case 'simpleLinkAttribute':
                        return [
                            {
                                payload: {id: '55'},
                            } as ILinkValue,
                        ];
                    case 'advancedLinkAttribute':
                        return [
                            {
                                payload: {id: '98'},
                            } as ILinkValue,
                            {
                                payload: {id: '99'},
                            } as ILinkValue,
                        ];
                    case 'treeAttribute':
                        return [
                            {
                                payload: {record: {id: '1000'}},
                            } as ITreeValue,
                            {
                                payload: {record: {id: '1001'}},
                            } as ITreeValue,
                        ];
                }
                throw new Error(`Unknown attributeId ${attributePath}`);
            });
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [
                    uuidAttribute,
                    {id: 'simpleAttribute', type: AttributeTypes.SIMPLE},
                    {id: 'advancedAttribute', type: AttributeTypes.ADVANCED, multiple_values: true},
                    {id: 'simpleLinkAttribute', type: AttributeTypes.SIMPLE_LINK},
                    {id: 'advancedLinkAttribute', type: AttributeTypes.ADVANCED_LINK, multiple_values: true},
                    {id: 'treeAttribute', type: AttributeTypes.TREE, multiple_values: true},
                ].find(a => a.id === attributePath),
            );

            const simpleLinkSchemaMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        simpleMapping: {
                            leavAttributeId: 'simpleAttribute',
                            valueRequired: true,
                            format: 'boolean',
                        },
                        advancedMapping: {
                            leavAttributeId: 'advancedAttribute',
                            valueRequired: true,
                            format: 'array',
                        },
                        simpleLinkMapping: {
                            leavAttributeId: 'simpleLinkAttribute',
                            valueRequired: true,
                            format: 'number',
                        },
                        advancedLinkMapping: {
                            leavAttributeId: 'advancedLinkAttribute',
                            valueRequired: true,
                            format: 'array',
                        },
                        treeMapping: {
                            leavAttributeId: 'treeAttribute',
                            valueRequired: true,
                            format: 'array',
                        },
                    },
                },
            };
            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                simpleLinkSchemaMapping,
                'CREATE',
                mockSystemQueryContext,
            );
            expect(sdo).toMatchObject({
                name: mockSDO.name,
                action: 'CREATE',
                content: {
                    system: expectedSDOSystemContent,
                    simpleMapping: true,
                    advancedMapping: ['red', 'blue'],
                    simpleLinkMapping: 55,
                    advancedLinkMapping: ['98', '99'],
                    treeMapping: ['1000', '1001'],
                },
            });
        });

        it('[+] Should map attribute with export mappingFunction', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue.mockResolvedValueOnce([
                {
                    payload: {record: {id: '1000'}},
                } as ITreeValue,
            ]);

            _sdoDomain.registerSDOExportMappingFunctions({
                statusTree: vi.fn().mockResolvedValueOnce({
                    id: 1000,
                    value: 'A valider',
                }),
            });

            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute, {id: 'treeAttribute', type: AttributeTypes.TREE, linked_tree: 'my_status_tree'}].find(
                    a => a.id === attributePath,
                ),
            );

            const simpleLinkSchemaMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        treeMapping: {
                            leavAttributeId: 'treeAttribute',
                            valueRequired: true,
                            format: 'object',
                            exportFunction: 'statusTree',
                        },
                    },
                },
            };

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                simpleLinkSchemaMapping,
                'CREATE',
                mockSystemQueryContext,
            );

            expect(sdo).toMatchObject({
                name: mockSDO.name,
                action: 'CREATE',
                content: {
                    treeMapping: {
                        id: 1000,
                        value: 'A valider',
                    },
                },
            });
        });

        it('[+] Should not throw error when attribute undefined and function defined', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);

            mockRecordDomain.getRecordFieldValue
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues);
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                mockSDORecordAttributes.list.find(a => a.id === attributePath),
            );

            const sdoUnknownSchemaMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        ...mockSDOMapping[mockSDO.name].sdoAttributes,
                        treeMapping: {
                            leavAttributeId: '',
                            valueRequired: true,
                            format: 'number' as SDOMappingAttributeFormat,
                            exportFunction: 'statusTree',
                        },
                    },
                },
            };
            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                sdoUnknownSchemaMapping,
                'CREATE',
                mockSystemQueryContext,
            );
            expect(sdo).toBeDefined();
            expect((sdo as ISDO).content).toEqual({
                system: {
                    ...expectedSDOSystemContent,
                    applicationIds: {leav: 'entity'},
                    // No stored creator clientId → falls back to config.sdo.clientId
                    systemCreatorClientId: 'leav-client',
                    systemLastModificatorClientId: 'leav-client',
                },
                simple: 'raw_payload',
                simple_link: 'id',
                advanced: ['raw_payload'],
                advanced_link: ['id'],
                treeMapping: null,
            });
        });

        it('[+] Should extend the whole SDO with a registered extend SDO function', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue.mockResolvedValueOnce(mockStandardAttributeRecordFieldValues);
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute, {id: 'simpleAttribute', type: AttributeTypes.SIMPLE}].find(a => a.id === attributePath),
            );

            const extendFunction = vi.fn(async (record: IRecord, sdo: ISDO) => ({
                ...sdo,
                content: {...sdo.content, extendedFrom: record.id},
            }));
            _sdoDomain.registerExtendSDOFunctions({extendSdo: extendFunction});

            const mappingWithExtendFunction: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    extendSDOFunction: 'extendSdo',
                    sdoAttributes: {
                        simpleMapping: {leavAttributeId: 'simpleAttribute', valueRequired: false, format: 'string'},
                    },
                },
            };

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                mappingWithExtendFunction,
                'CREATE',
                mockSystemQueryContext,
            );

            // The function receives the full record and the SDO built from the generic mapping.
            expect(extendFunction).toHaveBeenCalledWith(
                expect.objectContaining({id: 'entity'}),
                expect.objectContaining({name: mockSDO.name, action: 'CREATE'}),
                mockSystemQueryContext,
            );
            expect((sdo as ISDO).content).toMatchObject({extendedFrom: 'entity'});
        });

        it('[-] Should throw when extendSDOFunction is referenced but not registered', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute].find(a => a.id === attributePath),
            );

            const mappingWithUnknownFunction: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    extendSDOFunction: 'notRegistered',
                    sdoAttributes: {},
                },
            };

            await expect(
                _sdoDomain.getRecordSDO(
                    mockSDOMapping[mockSDO.name].leavLibraryId,
                    'entity',
                    mappingWithUnknownFunction,
                    'CREATE',
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow('Unknown extend SDO function');
        });

        it('[-] Should throw error when attribute is not in LEAV', async () => {
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value'}],
            } as unknown as IListWithCursor<IRecord>);

            mockGetAttributeByPath.mockRejectedValue(new Error('unknown attribute'));

            const sdoUnknownSchemaMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        treeMapping: {
                            leavAttributeId: 'unkownLEAVAttribute',
                            valueRequired: true,
                            format: 'number' as SDOMappingAttributeFormat,
                        },
                        [sdoPathIdentifierUuid]: {
                            leavAttributeId: 'uuid',
                            valueRequired: true,
                            format: 'string' as SDOMappingAttributeFormat,
                        },
                    },
                },
            };
            await expect(
                _sdoDomain.getRecordSDO(
                    mockSDOMapping[mockSDO.name].leavLibraryId,
                    'entity',
                    sdoUnknownSchemaMapping,
                    'CREATE',
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow(
                `attribute ${sdoUnknownSchemaMapping[mockSDO.name].sdoAttributes.treeMapping.leavAttributeId} not found in LEAV`,
            );
        });
    });

    describe('resolveAdditionalLibraryTriggerTargets', () => {
        const sourceLibraryId = 'structure_items';
        const sourceRecordId = 'structureItem123';

        it('[-] returns an empty array when no trigger matches the source library', async () => {
            mockSDOUtils.getAdditionalLibraryTriggers.mockReturnValueOnce([]);

            const targets = await _sdoDomain.resolveAdditionalLibraryTriggerTargets(
                mockSDOMapping,
                sourceLibraryId,
                sourceRecordId,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([]);
            expect(mockValueDomain.getRecordFieldValue).not.toHaveBeenCalled();
        });

        it('[+] resolves a single-hop link value via payload.id', async () => {
            mockSDOUtils.getAdditionalLibraryTriggers.mockReturnValueOnce([
                {targetLeavLibraryId: 'campaigns', attributePathToTarget: 'structure_items_campaign'},
            ]);
            mockValueDomain.getRecordFieldValue.mockResolvedValueOnce([
                {payload: {id: 'campaign1', library: 'campaigns'}},
            ] as ILinkValue[]);

            const targets = await _sdoDomain.resolveAdditionalLibraryTriggerTargets(
                mockSDOMapping,
                sourceLibraryId,
                sourceRecordId,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'campaign1'}]);
        });

        it('[+] resolves a terminal tree value via payload.record.id, not the tree node id', async () => {
            mockSDOUtils.getAdditionalLibraryTriggers.mockReturnValueOnce([
                {targetLeavLibraryId: 'campaigns', attributePathToTarget: 'structure_items_categories_thematic'},
            ]);
            mockValueDomain.getRecordFieldValue.mockResolvedValueOnce([
                {payload: {id: 'treeNode1', record: {id: 'campaign1', library: 'campaigns'}}},
            ] as ITreeValue[]);

            const targets = await _sdoDomain.resolveAdditionalLibraryTriggerTargets(
                mockSDOMapping,
                sourceLibraryId,
                sourceRecordId,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'campaign1'}]);
        });

        it('[+] resolves multiple values for a single trigger', async () => {
            mockSDOUtils.getAdditionalLibraryTriggers.mockReturnValueOnce([
                {targetLeavLibraryId: 'campaigns', attributePathToTarget: 'structure_items_campaign'},
            ]);
            mockValueDomain.getRecordFieldValue.mockResolvedValueOnce([
                {payload: {id: 'campaign1', library: 'campaigns'}},
                {payload: {id: 'campaign2', library: 'campaigns'}},
            ] as ILinkValue[]);

            const targets = await _sdoDomain.resolveAdditionalLibraryTriggerTargets(
                mockSDOMapping,
                sourceLibraryId,
                sourceRecordId,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([
                {leavLibraryId: 'campaigns', recordId: 'campaign1'},
                {leavLibraryId: 'campaigns', recordId: 'campaign2'},
            ]);
        });

        it('[+] resolves multiple triggers pointing at different target libraries', async () => {
            mockSDOUtils.getAdditionalLibraryTriggers.mockReturnValueOnce([
                {targetLeavLibraryId: 'campaigns', attributePathToTarget: 'structure_items_campaign'},
                {targetLeavLibraryId: 'map', attributePathToTarget: 'structure_items_map'},
            ]);
            mockValueDomain.getRecordFieldValue
                .mockResolvedValueOnce([{payload: {id: 'campaign1', library: 'campaigns'}}] as ILinkValue[])
                .mockResolvedValueOnce([{payload: {id: 'map1', library: 'map'}}] as ILinkValue[]);

            const targets = await _sdoDomain.resolveAdditionalLibraryTriggerTargets(
                mockSDOMapping,
                sourceLibraryId,
                sourceRecordId,
                mockSystemQueryContext,
            );

            expect(targets).toEqual(
                expect.arrayContaining([
                    {leavLibraryId: 'campaigns', recordId: 'campaign1'},
                    {leavLibraryId: 'map', recordId: 'map1'},
                ]),
            );
        });

        it('[-] rethrows when the path resolution fails', async () => {
            mockSDOUtils.getAdditionalLibraryTriggers.mockReturnValueOnce([
                {targetLeavLibraryId: 'campaigns', attributePathToTarget: 'structure_items_campaign'},
            ]);
            mockValueDomain.getRecordFieldValue.mockRejectedValueOnce(new Error('bad path'));

            await expect(
                _sdoDomain.resolveAdditionalLibraryTriggerTargets(
                    mockSDOMapping,
                    sourceLibraryId,
                    sourceRecordId,
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow(/failed to resolve path/);
        });
    });

    describe('getSDOGlobalSettings', () => {
        it('[-] should return a default global settings not available', async () => {
            mockGlobalSettingsDomain.getSettings.mockResolvedValueOnce({settings: {}} as IGlobalSettings);
            expect(await _sdoDomain.getSDOGlobalSettings(mockSystemQueryContext)).toStrictEqual({
                importEnable: false,
                exportEnable: false,
                mapping: {},
            });
        });

        it('[+] should return sdoGlobalSettings when found', async () => {
            expect(await _sdoDomain.getSDOGlobalSettings(mockSystemQueryContext)).toBe(sdoGlobalSettings);
        });
    });

    describe('sendLog', () => {
        it('[+] should send sdo log', async () => {
            await sdoDomain(deps).sendLog({
                action: EventAction.SDO_LOG_IMPORT_RECORD,
                record: {
                    id: 'recordId',
                    libraryId: 'libraryId',
                },
                sdo: mockSDO,
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.SDO_LOG_IMPORT_RECORD,
                    topic: {
                        record: {
                            id: 'recordId',
                            libraryId: 'libraryId',
                        },
                    },
                    metadata: {sdo: mockSDO},
                },
                mockSystemQueryContext,
            );
        });

        it('[+] should send error log', async () => {
            await sdoDomain(deps).sendLog({
                action: EventAction.SDO_LOG_ERROR,
                error: 'Error message',
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.SDO_LOG_ERROR,
                    topic: {},
                    metadata: {error: 'Error message'},
                },
                mockSystemQueryContext,
            );
        });
    });
});
