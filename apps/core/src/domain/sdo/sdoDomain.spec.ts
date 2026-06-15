import {type ToAny} from '../../utils/utils';
import {AttributeCondition, type IRecord} from '../../_types/record';
import jsonschema, {type ValidatorResult} from 'jsonschema';
import sdoDomain, {hashSDOAttributeId, type ISDODomainDeps} from './sdoDomain';
import {mockSDO, mockSDOMapping, sdoGlobalSettings} from '../../__tests__/mocks/sdo/data';
import {
    mockAttributeDomain,
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
} from '../../_types/sdo';
import {EventActionSDO} from '@leav/utils';
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

const deps: ToAny<ISDODomainDeps> = {
    'core.utils.sdo': mockSDOUtils,
    'core.domain.attribute': mockAttributeDomain,
    'core.domain.record': mockRecordDomain,
    'core.domain.globalSettings': mockGlobalSettingsDomain,
    'core.domain.eventsManager': mockEventsManagerDomain,
    'core.domain.value': mockValueDomain,
    'core.infra.record': mockRecordRepo,
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
    beforeEach(() => {
        vi.clearAllMocks();

        mockGlobalSettingsDomain.getSettings.mockResolvedValue({
            settings: {sdo: sdoGlobalSettings},
        } as unknown as IGlobalSettings);
        mockEventsManagerDomain.sendDatabaseEvent.mockResolvedValue(undefined);
        mockRecordDomain.find.mockResolvedValue({list: []} as IListWithCursor<IRecord>);
        mockSDOUtils.tmpRecordIdToUuid.mockImplementation((recordId: string) => recordId);
        mockSDOUtils.getLibraryUUIDAttributeID.mockReturnValue('uuid');
        mockRecordRepo.getRecord.mockImplementation(async ({recordId}) => ({uuid: recordId}));
    });

    const _sdoDomain = sdoDomain(deps);

    describe('schemaValidation', () => {
        it('[-] should throw an error when missing field', async () => {
            const mockSDOMissingField = {
                identifier: {uuid: '1'},
            };

            await expect(_sdoDomain.schemaValidation(mockSDOMissingField)).rejects.toThrow();
            expect(jsonschemaSpy).toHaveBeenCalled();
        });

        it('[+] should NOT throw an error when validate', async () => {
            // Core validates against the generic schema (system + info required)
            await expect(_sdoDomain.schemaValidation({system: {systemId: 1}, info: {}})).resolves.not.toThrow();
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
            mockAttributeDomain.getAttributes.mockResolvedValueOnce({
                list: [
                    {id: 'wrong', type: AttributeTypes.SIMPLE},
                    {id: 'uuid', type: AttributeTypes.SIMPLE},
                ],
            } as IList<IAttribute>);

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
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow();
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            expect(mockRecordDomain.getRecordFieldValue).toHaveBeenCalledTimes(2);
            expect(jsonschemaSpy).toHaveBeenCalled();
            expect(mockValueDomain.saveValue).not.toHaveBeenCalled();
        });

        it('[+] Should return undefined if the record hash SDO is same', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockSDOUtils.createHash.mockReturnValue('existing-hash');
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity123', hash_sdo: 'existing-hash'}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues);
            mockAttributeDomain.getAttributes.mockResolvedValueOnce(mockSDORecordAttributes);

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'record123',
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(sdo).toBeUndefined();
            expect(mockRecordDomain.find).toHaveBeenCalledWith({
                params: {
                    library: mockSDOMapping[mockSDO.name].leavLibraryId,
                    filters: [
                        {
                            field: 'id',
                            value: 'record123',
                            condition: AttributeCondition.EQUAL,
                        },
                    ],
                    retrieveInactive: true,
                },
                ctx: mockSystemQueryContext,
            });
            expect(mockRecordDomain.getRecordFieldValue).toHaveBeenCalledTimes(
                Object.keys(mockSDOMapping[mockSDO.name].sdoAttributes).length,
            );
            expect(jsonschemaSpy).toHaveBeenCalled();
            expect(mockValueDomain.saveValue).not.toHaveBeenCalled();
        });

        it('[+] Should return the record SDO object with CREATE action when hash sdo undefined', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockSDOUtils.createHash.mockReturnValue('new-hash');
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity123', attribute: 'attribute value'}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues);
            mockAttributeDomain.getAttributes.mockResolvedValueOnce(mockSDORecordAttributes);

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'record123',
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(sdo).toMatchObject({
                name: mockSDO.name,
                date: expect.any(Number),
                action: 'CREATE',
                content: {
                    identifier: {
                        uuid: 'raw_payload',
                    },
                    simple: 'raw_payload',
                    simple_link: 'id',
                    advanced: ['raw_payload'],
                    advanced_link: ['id'],
                },
            });

            expect(mockRecordDomain.find).toHaveBeenCalledWith({
                params: {
                    library: mockSDOMapping[mockSDO.name].leavLibraryId,
                    filters: [
                        {
                            field: 'id',
                            value: 'record123',
                            condition: AttributeCondition.EQUAL,
                        },
                    ],
                    retrieveInactive: true,
                },
                ctx: mockSystemQueryContext,
            });
            expect(mockRecordDomain.getRecordFieldValue).toHaveBeenCalledTimes(5);
            expect(jsonschemaSpy).toHaveBeenCalled();
            expect(mockValueDomain.saveValue).toHaveBeenNthCalledWith(1, {
                library: mockSDOMapping[mockSDO.name].leavLibraryId,
                recordId: 'record123',
                attribute: hashSDOAttributeId,
                value: {
                    payload: 'new-hash',
                },
                ctx: mockSystemQueryContext,
            });
        });

        it('[+] Should return the record SDO object with UPDATE action when hash sdo exists', async () => {
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockSDOUtils.createHash.mockReturnValue('new-hash');
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity123', attribute: 'attribute value', hash_sdo: 'existing-hash'}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockStandardAttributeRecordFieldValues)
                .mockResolvedValueOnce(mockLinkAttributeRecordFieldValues);
            mockAttributeDomain.getAttributes.mockResolvedValueOnce(mockSDORecordAttributes);

            const sdo = await _sdoDomain.getRecordSDO(
                mockSDOMapping[mockSDO.name].leavLibraryId,
                'record123',
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(sdo).toMatchObject({
                name: mockSDO.name,
                action: 'UPDATE',
                content: {
                    identifier: {
                        uuid: 'raw_payload',
                    },
                    simple: 'raw_payload',
                    simple_link: 'id',
                    advanced: ['raw_payload'],
                    advanced_link: ['id'],
                },
            });
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            expect(mockRecordDomain.getRecordFieldValue).toHaveBeenCalledTimes(5);
            expect(jsonschemaSpy).toHaveBeenCalled();
            expect(mockValueDomain.saveValue).toHaveBeenNthCalledWith(1, {
                library: mockSDOMapping[mockSDO.name].leavLibraryId,
                recordId: 'record123',
                attribute: hashSDOAttributeId,
                value: {
                    payload: 'new-hash',
                },
                ctx: mockSystemQueryContext,
            });
        });

        describe('values to sdo', () => {
            const sdoMappingName = 'test';
            const attributeId = 'attributeId';
            const libId = 'libId';
            beforeEach(() => {
                jsonschemaSpy.mockReturnValue({} as ValidatorResult);
                mockRecordDomain.find.mockResolvedValue({
                    list: [{id: 'entity'}],
                } as IListWithCursor<IRecord>);
                mockSDOUtils.createHash.mockReturnValue('new-hash');
            });

            function simplifySdoMapping(sdoKey: string, sdoMapping: ISDOMappingAttribute): ISDOMapping {
                return {
                    [sdoMappingName]: {
                        leavLibraryId: libId,
                        sdoAttributes: {
                            [sdoPathIdentifierUuid]: {
                                leavAttributeId: 'uuid',
                                valueRequired: true,
                                format: 'string' as SDOMappingAttributeFormat,
                            },
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
                mockRecordDomain.getRecordFieldValue
                    .mockResolvedValueOnce([{raw_payload: 'test-uuid'}] as IStandardValue[])
                    .mockResolvedValueOnce(value);
                const mapping = simplifySdoMapping(attributeId, {
                    leavAttributeId: attributeId,
                    valueRequired: false,
                    format,
                });
                expect(await _sdoDomain.getRecordSDO(libId, 'entity', mapping, mockSystemQueryContext)).toMatchObject({
                    content: {
                        identifier: {uuid: 'test-uuid'},
                        [attributeId]: expectedValue,
                    },
                });
            }

            describe('simple attribute', () => {
                beforeEach(() => {
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.SIMPLE}],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.ADVANCED}],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.ADVANCED, multiple_values: true}],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.SIMPLE_LINK}],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.ADVANCED_LINK}],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [
                            uuidAttribute,
                            {id: attributeId, type: AttributeTypes.ADVANCED_LINK, multiple_values: true},
                        ],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.TREE}],
                    } as IList<IAttribute>);
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
                    mockAttributeDomain.getAttributes.mockResolvedValue({
                        list: [uuidAttribute, {id: attributeId, type: AttributeTypes.TREE, multiple_values: true}],
                    } as IList<IAttribute>);
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
            mockSDOUtils.createHash.mockReturnValue('new-hash');
            jsonschemaSpy.mockReturnValueOnce({} as ValidatorResult);
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value'}],
            } as unknown as IListWithCursor<IRecord>);
            mockRecordDomain.getRecordFieldValue.mockImplementation(async ({attributeId}) => {
                switch (attributeId) {
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
                throw new Error(`Unknown attributeId ${attributeId}`);
            });
            mockAttributeDomain.getAttributes.mockResolvedValueOnce({
                list: [
                    uuidAttribute,
                    {id: 'simpleAttribute', type: AttributeTypes.SIMPLE},
                    {id: 'advancedAttribute', type: AttributeTypes.ADVANCED, multiple_values: true},
                    {id: 'simpleLinkAttribute', type: AttributeTypes.SIMPLE_LINK},
                    {id: 'advancedLinkAttribute', type: AttributeTypes.ADVANCED_LINK, multiple_values: true},
                    {id: 'treeAttribute', type: AttributeTypes.TREE, multiple_values: true},
                ],
            } as IList<IAttribute>);

            const simpleLinkSchemaMapping: ISDOMapping = {
                [mockSDO.name]: {
                    ...mockSDOMapping[mockSDO.name],
                    sdoAttributes: {
                        [sdoPathIdentifierUuid]: {
                            leavAttributeId: 'uuid',
                            valueRequired: true,
                            format: 'string' as SDOMappingAttributeFormat,
                        },
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
                mockSystemQueryContext,
            );
            expect(sdo).toMatchObject({
                name: mockSDO.name,
                action: 'CREATE',
                content: {
                    identifier: {
                        uuid: 'test-uuid',
                    },
                    simpleMapping: true,
                    advancedMapping: ['red', 'blue'],
                    simpleLinkMapping: 55,
                    advancedLinkMapping: ['98', '99'],
                    treeMapping: ['1000', '1001'],
                },
            });
        });

        it('[-] Should throw error when attribute is not in LEAV', async () => {
            mockRecordDomain.find.mockResolvedValueOnce({
                list: [{id: 'entity', attribute: 'attribute value'}],
            } as unknown as IListWithCursor<IRecord>);

            mockAttributeDomain.getAttributes.mockResolvedValueOnce({
                list: [],
            } as IList<IAttribute>);

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
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow(
                `attribute ${sdoUnknownSchemaMapping[mockSDO.name].sdoAttributes.treeMapping.leavAttributeId} not found in LEAV`,
            );
        });
    });

    describe('getSDOGlobalSettings', () => {
        it('[-] should throw an error when global settings not available', async () => {
            mockGlobalSettingsDomain.getSettings.mockResolvedValueOnce({settings: {}} as IGlobalSettings);
            await expect(_sdoDomain.getSDOGlobalSettings(mockSystemQueryContext)).rejects.toThrow();
        });

        it('[+] should return sdoGlobalSettings when found', async () => {
            expect(await _sdoDomain.getSDOGlobalSettings(mockSystemQueryContext)).toBe(sdoGlobalSettings);
        });
    });

    describe('sendLog', () => {
        it('[+] should send sdo log', async () => {
            await sdoDomain(deps).sendLog({
                action: EventActionSDO.SDO_LOG_IMPORT_RECORD,
                record: {
                    id: 'recordId',
                    libraryId: 'libraryId',
                },
                sdo: mockSDO,
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventActionSDO.SDO_LOG_IMPORT_RECORD,
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
                action: EventActionSDO.SDO_LOG_ERROR,
                error: 'Error message',
                ctx: mockSystemQueryContext,
            });

            expect(mockEventsManagerDomain.sendDatabaseEvent).toHaveBeenCalledWith(
                {
                    action: EventActionSDO.SDO_LOG_ERROR,
                    topic: {},
                    metadata: {error: 'Error message'},
                },
                mockSystemQueryContext,
            );
        });
    });
});
