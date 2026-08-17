import {type ToAny} from '../../utils/utils';
import {AttributeCondition, CORE_IN_CREATION_BY, type IRecord, type IRecordIdentity} from '../../_types/record';
import jsonschema, {type ValidatorResult} from 'jsonschema';
import sdoDomain, {type ISDODomain, type ISDODomainDeps} from './sdoDomain';
import {mockDTO, mockSDO, mockSDOMapping, sdoGlobalSettings} from '../../__tests__/mocks/sdo/data';
import {
    mockEventsManagerDomain,
    mockGlobalSettingsDomain,
    mockRecordDomain,
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
    type ISDOMappingLibrary,
    sdoPathIdentifierUuid,
    type ISDO,
    type IExtendSDOFunction,
    type ISDOExportMappingFunction,
    NATIVE_SDO_EXPORT_FUNCTIONS,
} from '../../_types/sdo';
import {EventAction} from '@leav/utils';
import {mockSDOUtils} from '../../__tests__/mocks/sdo/domains';
import {type IGlobalSettings} from '../../_types/globalSettings';
import {DTOStatementStatus, type IDTOStatement} from '../../_types/dto';

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
const mockGetRecordUUID = vi.fn();
const mockToIDLabel = vi.fn<ISDOExportMappingFunction>();

const deps: ToAny<ISDODomainDeps> = {
    'core.utils.sdo': mockSDOUtils,
    'core.domain.attribute.helpers.getAttributeByPath': mockGetAttributeByPath,
    'core.domain.record': mockRecordDomain,
    'core.domain.globalSettings': mockGlobalSettingsDomain,
    'core.domain.eventsManager': mockEventsManagerDomain,
    'core.domain.value': mockValueDomain,
    'core.domain.sdo.helpers.getRecordUUID': mockGetRecordUUID,
    'core.domain.sdo.export.exportFunctions.toIDLabel': mockToIDLabel,
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
        mockGetRecordUUID.mockImplementation(async (_libraryId: string, recordId: string) => recordId);
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

        it('[+] should return null if the record is still in creation', async () => {
            // A record is born inactive and flagged until activateNewRecord() clears the flag: the front
            // creates the shell to display the creation form, then activates it on submit. Exporting at
            // that point would push an empty/partial object for a record the user may still abandon.
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'record123', ...mockRecordSystemData, [CORE_IN_CREATION_BY]: 'userId'}],
            } as unknown as IListWithCursor<IRecord>);

            await expect(
                _sdoDomain.getRecordSDO(
                    mockSDOMapping[mockSDO.name].leavLibraryId,
                    'record123',
                    mockSDOMapping,
                    'CREATE',
                    mockSystemQueryContext,
                ),
            ).resolves.toBeNull();
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            // Short-circuited before any mapping work
            expect(mockRecordDomain.getRecordFieldValue).not.toHaveBeenCalled();
            expect(jsonschemaSpy).not.toHaveBeenCalled();
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

        it('[+] Should map attribute with export mappingFunction, handing it the RAW values', async () => {
            // Declaring an exportFunction short-circuits _mapRecordAttributeValue: the function gets the
            // ITreeValue as leav returns it — with its IRecord payload — not the uuid the generic
            // mapping would have exported. Without that, a function needing getRecordIdentity is stuck.
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            const treeValues = [{payload: {record: {id: '1000', library: 'statuses'}}} as ITreeValue];
            mockRecordDomain.getRecordFieldValue.mockResolvedValueOnce(treeValues);

            const treeAttribute = {id: 'treeAttribute', type: AttributeTypes.TREE, linked_tree: 'my_status_tree'};
            const statusTree = vi.fn<ISDOExportMappingFunction>().mockResolvedValueOnce({
                id: 1000,
                value: 'A valider',
            });
            _sdoDomain.registerSDOExportMappingFunctions({statusTree});

            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute, treeAttribute].find(a => a.id === attributePath),
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

            expect(statusTree).toHaveBeenCalledWith({
                record: expect.objectContaining({id: 'entity'}),
                values: treeValues,
                attributeProps: treeAttribute,
                format: 'object',
                config: undefined,
                ctx: mockSystemQueryContext,
            });

            // The uuid resolution the generic mapping performs was skipped entirely: the only calls left
            // are the two system ones (creator / last modificator).
            expect(mockGetRecordUUID).not.toHaveBeenCalledWith('statuses', '1000', expect.anything());

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

        it('[+] Should still map the generic value when another SDO path exports the same attribute directly', async () => {
            // The short-circuit is per attribute, not per entry: as soon as ONE path exports the
            // attribute without a function, the mapped form is still needed.
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue.mockResolvedValueOnce([
                {payload: {id: '1000', library: 'statuses'}} as ILinkValue,
            ]);

            const linkAttribute = {id: 'linkAttribute', type: AttributeTypes.SIMPLE_LINK, linked_library: 'statuses'};
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute, linkAttribute].find(a => a.id === attributePath),
            );

            _sdoDomain.registerSDOExportMappingFunctions({
                pairs: vi.fn<ISDOExportMappingFunction>().mockResolvedValue({id: 'uuid-1000', label: 'A valider'}),
            });

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                {
                    [mockSDO.name]: {
                        ...mockSDOMapping[mockSDO.name],
                        sdoAttributes: {
                            'info.statusUuid': {
                                leavAttributeId: 'linkAttribute',
                                valueRequired: false,
                                format: 'string',
                            },
                            'info.status': {
                                leavAttributeId: 'linkAttribute',
                                valueRequired: false,
                                format: 'object',
                                exportFunction: 'pairs',
                            },
                        },
                    },
                },
                'CREATE',
                mockSystemQueryContext,
            );

            // Resolved once for both entries, and the uuid mapping did run for the direct one.
            const attributeReads = mockRecordDomain.getRecordFieldValue.mock.calls.filter(
                ([{attributePath}]) => attributePath === 'linkAttribute',
            );
            expect(attributeReads).toHaveLength(1);
            expect((sdo as ISDO).content).toMatchObject({
                info: {statusUuid: '1000', status: {id: 'uuid-1000', label: 'A valider'}},
            });
        });

        it('[-] Should refuse to let a plugin override a native export function', async () => {
            // Shadowing a native name would silently change what every mapping naming it exports.
            expect(() =>
                _sdoDomain.registerSDOExportMappingFunctions({
                    [NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL]: vi.fn<ISDOExportMappingFunction>(),
                }),
            ).toThrow('toIDLabel is a native SDO export function');
        });

        it('[+] Should pre-register the native export functions, callable without any plugin', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            const linkValues = [{payload: {id: '1000', library: 'statuses'}} as ILinkValue];
            mockRecordDomain.getRecordFieldValue.mockResolvedValueOnce(linkValues);

            const linkAttribute = {id: 'linkAttribute', type: AttributeTypes.SIMPLE_LINK, linked_library: 'statuses'};
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute, linkAttribute].find(a => a.id === attributePath),
            );
            mockToIDLabel.mockResolvedValueOnce({id: 'uuid-1000', label: 'A valider'});

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                {
                    [mockSDO.name]: {
                        ...mockSDOMapping[mockSDO.name],
                        sdoAttributes: {
                            'info.status': {
                                leavAttributeId: 'linkAttribute',
                                valueRequired: false,
                                format: 'object',
                                exportFunction: NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL,
                            },
                        },
                    },
                },
                'CREATE',
                mockSystemQueryContext,
            );

            expect(mockToIDLabel).toHaveBeenCalledWith(
                expect.objectContaining({values: linkValues, attributeProps: linkAttribute, format: 'object'}),
            );
            expect((sdo as ISDO).content).toMatchObject({info: {status: {id: 'uuid-1000', label: 'A valider'}}});
        });

        it('[+] Should export null for a declared but unmapped SDO path, without an export function', async () => {
            // A mapping entry with neither leavAttributeId nor exportFunction is a placeholder: an SDO
            // path listed in the config whose leav attribute has not been chosen yet. It must not break
            // the whole library's export.
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

            const sdoUnmappedPathMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        ...mockSDOMapping[mockSDO.name].sdoAttributes,
                        treeMapping: {
                            leavAttributeId: '',
                            valueRequired: true,
                            format: 'number' as SDOMappingAttributeFormat,
                        },
                    },
                },
            };
            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                sdoUnmappedPathMapping,
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

        it('[+] Should run an export function on an entry with no leavAttributeId, and hand it its config', async () => {
            // A computed SDO path: the function builds the value off the record alone, so the entry
            // designates no source attribute — hence no `value` and no `attributeProps`.
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute].find(a => a.id === attributePath),
            );

            const computedFunction = vi.fn<ISDOExportMappingFunction>(async ({record}) => ({
                computedFrom: record.id,
            }));
            _sdoDomain.registerSDOExportMappingFunctions({computed: computedFunction});

            const exportFunctionConfig = {someInstanceTable: ['a', 'b']};
            const computedMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        computedBlock: {
                            valueRequired: false,
                            format: 'object',
                            exportFunction: 'computed',
                            exportFunctionConfig,
                        },
                    },
                },
            };

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'entity',
                computedMapping,
                'CREATE',
                mockSystemQueryContext,
            );

            expect(computedFunction).toHaveBeenCalledWith({
                record: expect.objectContaining({id: 'entity'}),
                format: 'object',
                config: exportFunctionConfig,
                ctx: mockSystemQueryContext,
            });
            expect((sdo as ISDO).content).toMatchObject({computedBlock: {computedFrom: 'entity'}});
        });

        it('[-] Should throw when an export function is referenced but not registered, even with no leavAttributeId', async () => {
            // Exporting null on a typo would hide the misconfiguration.
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', ...mockRecordSystemData}],
            } as unknown as IListWithCursor<IRecord>);
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) =>
                [uuidAttribute].find(a => a.id === attributePath),
            );

            const unknownFunctionMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        computedBlock: {valueRequired: false, format: 'object', exportFunction: 'notRegistered'},
                    },
                },
            };

            await expect(
                _sdoDomain.getRecordSDO(
                    mockSDOMapping[mockSDO.name].leavLibraryId,
                    'entity',
                    unknownFunctionMapping,
                    'CREATE',
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow('Unknown mapping function notRegistered');
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

            const extendFunction = vi.fn<IExtendSDOFunction>(async (record, sdo) => ({
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

    describe('getRecordSDOIdentifier', () => {
        const libId = 'campaigns';
        const record: IRecord = {id: 'campaign1', library: libId, ...mockRecordSystemData};

        const _mappingLibrary = (sdoAttributes: Record<string, ISDOMappingAttribute>): ISDOMappingLibrary => ({
            leavLibraryId: libId,
            sdoAttributes,
        });

        beforeEach(() => {
            mockGetAttributeByPath.mockImplementation(async ({attributePath}) => ({
                id: attributePath,
                type: AttributeTypes.SIMPLE,
            }));
        });

        it('[+] should build the identifier block from the mapping entries targeting it', async () => {
            mockRecordDomain.getRecordFieldValue.mockImplementation(async ({attributePath}) =>
                attributePath === 'campaigns_id_pac'
                    ? ([{raw_payload: 'pac-42'}] as IStandardValue[])
                    : ([{raw_payload: 'internal-code'}] as IStandardValue[]),
            );

            const identifier = await _sdoDomain.getRecordSDOIdentifier(
                _mappingLibrary({
                    'identifier.pacId': {leavAttributeId: 'campaigns_id_pac', valueRequired: false, format: 'string'},
                    'identifier.customerInternalCode': {
                        leavAttributeId: 'campaigns_customer_internal_code',
                        valueRequired: false,
                        format: 'string',
                    },
                    'info.label': {leavAttributeId: 'campaigns_label', valueRequired: false, format: 'string'},
                }),
                record,
                mockSystemQueryContext,
            );

            // `info.*` entries are left out: only the identifier block is read
            expect(identifier).toEqual({pacId: 'pac-42', customerInternalCode: 'internal-code'});
            expect(mockRecordDomain.getRecordFieldValue).toHaveBeenCalledTimes(2);
        });

        it('[+] should apply the format declared by the mapping entry', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{raw_payload: '2026'}] as IStandardValue[]);

            const identifier = await _sdoDomain.getRecordSDOIdentifier(
                _mappingLibrary({
                    'identifier.year': {leavAttributeId: 'campaigns_year', valueRequired: false, format: 'integer'},
                }),
                record,
                mockSystemQueryContext,
            );

            expect(identifier).toEqual({year: 2026});
        });

        it('[+] should return an empty object without any read when the mapping targets no identifier', async () => {
            const identifier = await _sdoDomain.getRecordSDOIdentifier(
                _mappingLibrary({
                    'info.label': {leavAttributeId: 'campaigns_label', valueRequired: false, format: 'string'},
                }),
                record,
                mockSystemQueryContext,
            );

            expect(identifier).toEqual({});
            expect(mockRecordDomain.getRecordFieldValue).not.toHaveBeenCalled();
            expect(mockGetAttributeByPath).not.toHaveBeenCalled();
        });

        it('[+] should not mutate the record it is given', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{raw_payload: 'pac-42'}] as IStandardValue[]);
            const recordSnapshot = {...record};

            await _sdoDomain.getRecordSDOIdentifier(
                _mappingLibrary({
                    'identifier.pacId': {leavAttributeId: 'campaigns_id_pac', valueRequired: false, format: 'string'},
                }),
                record,
                mockSystemQueryContext,
            );

            expect(record).toEqual(recordSnapshot);
        });

        it('[-] should throw when a mapped attribute does not exist in LEAV', async () => {
            mockGetAttributeByPath.mockRejectedValue(new Error('not found'));

            await expect(
                _sdoDomain.getRecordSDOIdentifier(
                    _mappingLibrary({
                        'identifier.pacId': {leavAttributeId: 'unknown_attr', valueRequired: false, format: 'string'},
                    }),
                    record,
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow('attribute unknown_attr not found in LEAV');
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
        const mockStatement: IDTOStatement = {
            operationId: 'a1559880-b232-449d-8027-b7e02faac354',
            requestId: '0f8c1aa3-6351-4578-ace6-1fd6b55e4944',
            dataModelRelease: 'dataModelRelease',
            correlationId: 'b3ae252d-7a24-4109-a75d-28dc1007032d',
            payloadType: 'test',
            method: 'UPDATE',
            status: DTOStatementStatus.SUCCESS,
            details: null,
            sdo_identifier: null,
            date: 1728294761,
        };

        it('[+] should send sdo log', async () => {
            await sdoDomain(deps).sendLog({
                action: EventAction.SDO_IMPORT_SUCCESS,
                record: {
                    id: 'recordId',
                    libraryId: 'libraryId',
                },
                sdo: mockSDO,
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.SDO_IMPORT_SUCCESS,
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
                action: EventAction.SDO_EXPORT_ERROR,
                error: 'Error message',
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.SDO_EXPORT_ERROR,
                    topic: {},
                    metadata: {error: 'Error message'},
                },
                mockSystemQueryContext,
            );
        });

        it('[+] should include the DTO statement in the event metadata', async () => {
            await sdoDomain(deps).sendLog({
                action: EventAction.DTO_IMPORT_SUCCESS,
                dto: mockDTO,
                statement: mockStatement,
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.DTO_IMPORT_SUCCESS,
                    topic: {},
                    metadata: {dto: mockDTO, statement: mockStatement},
                },
                mockSystemQueryContext,
            );
        });

        it('[+] should build the metadata block when only the statement is truthy', async () => {
            await sdoDomain(deps).sendLog({
                action: EventAction.DTO_IMPORT_SUCCESS,
                statement: mockStatement,
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventAction.DTO_IMPORT_SUCCESS,
                    topic: {},
                    metadata: {statement: mockStatement},
                },
                mockSystemQueryContext,
            );
        });
    });
});
