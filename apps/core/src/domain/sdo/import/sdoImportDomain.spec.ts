import {type ToAny} from '../../../utils/utils';
import importDomain, {type ISDOImportDomainDeps} from './sdoImportDomain';
import {mockSDO, mockSDOMapping, sdoGlobalSettings} from '../../../__tests__/mocks/sdo/data';
import sdoUtils from '../../../utils/sdo';
import {mockExportDomain, mockSdoDomain} from '../../../__tests__/mocks/sdo/domains';
import {
    mockAttributeDomain,
    mockLogger,
    mockRecordDomain,
    mockSystemQueryContext,
    mockTreeDomain,
    mockValueDomain,
} from '../../../__tests__/mocks/sdo/core';
import {Operator, type IRecord} from '../../../_types/record';
import {type IListWithCursor} from '../../../_types/list';
import {AttributeTypes} from '../../../_types/attribute';
import {sdoPathIdentifierUuid, type ISDOMapping, type ISDO} from '../../../_types/sdo';
import {type ITreeLibrarySettings} from '../../../_types/tree';
import {type ILinkValue, type IStandardValue, type ITreeValue} from '../../../_types/value';
import {type ISaveBatchValueResult} from '../../value/valueDomain';
import {type ICreateRecordResult} from '../../record/_types';

const deps: ToAny<ISDOImportDomainDeps> = {
    'core.utils.logger': mockLogger,
    'core.domain.sdo.export': mockExportDomain,
    'core.domain.record': mockRecordDomain,
    'core.utils.sdo': sdoUtils(),
    'core.domain.sdo': mockSdoDomain,
    'core.domain.value': mockValueDomain,
    'core.domain.attribute': mockAttributeDomain,
    'core.domain.tree': mockTreeDomain,
};

const treeIdForLink = 'treeId';
const libIdForLink = 'libId';
const _mockSDOMapping: ISDOMapping = {
    ['test']: {
        leavLibraryId: 'leavLibraryId',
        sdoAttributes: {
            ...mockSDOMapping.test.sdoAttributes,
            tree_mono: {
                leavAttributeId: 'tree_mono',
                valueRequired: false,
                format: 'string',
            },
            tree_multiple: {
                leavAttributeId: 'tree_multiple',
                valueRequired: false,
                format: 'array',
            },
        },
    },
    [libIdForLink]: {
        leavLibraryId: libIdForLink,
        sdoAttributes: {
            [sdoPathIdentifierUuid]: {leavAttributeId: 'uuid', valueRequired: true, format: 'string'},
        },
    },
} satisfies ISDOMapping;
const uuidNameLibTest = _mockSDOMapping.test.sdoAttributes[sdoPathIdentifierUuid].leavAttributeId;
const uuidNameLibIdForLink = _mockSDOMapping[libIdForLink].sdoAttributes[sdoPathIdentifierUuid].leavAttributeId;

describe('importDomain', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({
            ...sdoGlobalSettings,
            mapping: _mockSDOMapping,
        });
    });
    const _importDomain = importDomain(deps);

    describe('create', () => {
        it('[-] should return if record already exists', async () => {
            mockRecordDomain.find.mockResolvedValue({list: [{id: 'existing record'}]} as IListWithCursor<IRecord>);

            await _importDomain.create(mockSDO, mockSystemQueryContext);
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringMatching(/Record .* already exists, import create skipped/),
            );
            expect(mockRecordDomain.find).toHaveBeenNthCalledWith(1, {
                params: {
                    library: mockSDOMapping[mockSDO.name].leavLibraryId,
                    filters: [
                        {
                            condition: 'EQUAL',
                            field: uuidNameLibTest,
                            value: mockSDO.content.identifier.uuid,
                        },
                    ],
                    retrieveInactive: true,
                },
                ctx: mockSystemQueryContext,
            });
        });

        it('[+] should create record', async () => {
            mockRecordDomain.find.mockResolvedValue({list: []} as IListWithCursor<IRecord>);
            mockRecordDomain.createRecord.mockResolvedValue({});
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({type: AttributeTypes.SIMPLE});

            await expect(
                _importDomain.create(
                    // force use simple attribute
                    simplifiedMockSdo({[mockSDOMapping.test.sdoAttributes.simple.leavAttributeId]: '12'}),
                    mockSystemQueryContext,
                ),
            ).resolves.not.toThrow();
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
            expect(mockRecordDomain.createRecord).toHaveBeenCalledTimes(1);
        });

        it('[-] should throw if createRecord returns error', async () => {
            mockRecordDomain.createRecord.mockResolvedValue({
                valuesErrors: [{attribute: 'attr', message: 'msg'}],
            } as ICreateRecordResult);
            mockRecordDomain.find.mockResolvedValue({list: []} as IListWithCursor<IRecord>);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({type: AttributeTypes.SIMPLE});

            await expect(
                _importDomain.create(
                    // force use simple attribute
                    simplifiedMockSdo({[mockSDOMapping.test.sdoAttributes.simple.leavAttributeId]: '12'}),
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow('Error while creating a record');
        });
    });

    describe('update', () => {
        beforeEach(() => {
            mockValueDomain.saveValueBatch.mockResolvedValue({} as ISaveBatchValueResult);
        });

        it('[-] should throw if record not found', async () => {
            mockRecordDomain.find.mockResolvedValue({list: []} as IListWithCursor<IRecord>);

            await expect(_importDomain.update(mockSDO, mockSystemQueryContext)).rejects.toThrow();
            expect(mockRecordDomain.find).toHaveBeenCalledTimes(1);
        });

        it('[+] should update record', async () => {
            mockRecordDomain.find.mockResolvedValue({list: [{id: 'existing record'}]} as IListWithCursor<IRecord>);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({type: AttributeTypes.SIMPLE});

            await expect(
                _importDomain.update(
                    // force use simple attribute
                    simplifiedMockSdo({[mockSDOMapping.test.sdoAttributes.simple.leavAttributeId]: '12'}),
                    mockSystemQueryContext,
                ),
            ).resolves.not.toThrow();

            expect(mockValueDomain.saveValueBatch).toHaveBeenCalledTimes(1);
            expect(mockRecordDomain.find).toHaveBeenNthCalledWith(1, {
                params: {
                    library: mockSDOMapping[mockSDO.name].leavLibraryId,
                    filters: [
                        {
                            condition: 'EQUAL',
                            field: uuidNameLibTest,
                            value: mockSDO.content.identifier.uuid,
                        },
                    ],
                    retrieveInactive: true,
                },
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should throw if saveValueBatch returns error', async () => {
            mockValueDomain.saveValueBatch.mockResolvedValue({
                errors: [{attribute: 'attr', message: 'msg'}],
            } as ISaveBatchValueResult);
            mockRecordDomain.find.mockResolvedValue({list: [{id: 'existing record'}]} as IListWithCursor<IRecord>);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({type: AttributeTypes.SIMPLE});

            await expect(
                _importDomain.update(
                    // force use simple attribute
                    simplifiedMockSdo({[mockSDOMapping.test.sdoAttributes.simple.leavAttributeId]: '12'}),
                    mockSystemQueryContext,
                ),
            ).rejects.toThrow('Error while updating a record');
        });

        describe('sdo to save values', () => {
            const recordId = 'existing record';

            beforeEach(() => {
                mockRecordDomain.find.mockResolvedValueOnce({
                    list: [{id: recordId}],
                } as IListWithCursor<IRecord>);
            });

            describe('simple', () => {
                const attributeName = mockSDOMapping.test.sdoAttributes.simple.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE});
                });

                it('[+] Set text value', async () => {
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '1234'}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '1234',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set boolean value', async () => {
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: false}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'false',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set number value', async () => {
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: 0}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '0',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset value', async () => {
                    await _importDomain.update(simplifiedMockSdo({simple: null}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set array value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: ['42']}), mockSystemQueryContext),
                    ).rejects.toThrow(`Simple attribute ${attributeName} expects a single value`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('simple link', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.simple_link.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.SIMPLE_LINK,
                            linked_library: libIdForLink,
                        });
                });

                it('[+] Set with found linked record', async () => {
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext);

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 42',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset link value', async () => {
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: null}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set with not found linked record', async () => {
                    mockRecordDomain.find.mockResolvedValueOnce({list: []} as IListWithCursor<IRecord>);
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(`Records with 42 UUID for library ${libIdForLink} not found`);

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('advanced mono valued', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.advanced.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.ADVANCED,
                        });
                });

                it('[+] Set text value, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '42',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set number value, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: 42}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '42',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set boolean value, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: false}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'false',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set boolean value, one existing value', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: 'false', id_value: 'edge bool'},
                    ] as IStandardValue[]);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: true}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'true',
                                },
                            ]),
                        }),
                    );
                    // Important to not do delete before add in case of mono value required attribute
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.not.arrayContaining([
                                {
                                    id_value: 'edge bool',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset boolean values, one existing value', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: 'false', id_value: 'edge bool'},
                    ] as IStandardValue[]);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: null}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge bool',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set array value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: ['42']}), mockSystemQueryContext),
                    ).rejects.toThrow(`Advanced attribute ${attributeName} expects a single value`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('advanced multi valued', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.advanced.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.ADVANCED,
                            multiple_values: true,
                        });
                });

                it('[+] Set text values, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '43']}),
                        mockSystemQueryContext,
                    );

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '42',
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '43',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set number values, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: [42, 43]}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '42',
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '43',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set boolean values, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: [false, true]}),
                        mockSystemQueryContext,
                    );

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'false',
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'true',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set text values, one existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: '42', id_value: 'edge 42'},
                    ] as IStandardValue[]);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '43']}),
                        mockSystemQueryContext,
                    );

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '43',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set and unset text values, existing multiple values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: '42', id_value: 'edge 42'},
                        {payload: '43', id_value: 'edge 43'},
                    ] as IStandardValue[]);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '44']}),
                        mockSystemQueryContext,
                    );

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: '44',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset text values, existing multiple values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: '42', id_value: 'edge 42'},
                        {payload: '43', id_value: 'edge 43'},
                    ] as IStandardValue[]);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: []}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge 42',
                                    attribute: attributeName,
                                    payload: null,
                                },
                                {
                                    id_value: 'edge 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set single value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(`Advanced attribute ${attributeName} expects an array of values`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('advanced link mono valued', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.advanced_link.leavAttributeId;

                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.ADVANCED_LINK,
                            linked_library: libIdForLink,
                        });
                });

                it('[+] Set with found linked record, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext);

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 42',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set with found linked record, one existing value', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked record 43'}, id_value: 'edge record 43'},
                    ] as ILinkValue[]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext);

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 42',
                                },
                            ]),
                        }),
                    );
                    // Important to not do delete before add in case of mono value required attribute
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.not.arrayContaining([
                                {
                                    id_value: 'edge record 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset link values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked record 43'}, id_value: 'edge record 43'},
                    ] as ILinkValue[]);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: null}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge record 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set array value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: ['42']}), mockSystemQueryContext),
                    ).rejects.toThrow(`Advanced link attribute ${attributeName} expects a single string value`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });

                it('[-] Set with not found linked record', async () => {
                    mockRecordDomain.find.mockResolvedValueOnce({list: []} as IListWithCursor<IRecord>);
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(`Records with 42 UUID for library ${libIdForLink} not found`);

                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('advanced link multi valued', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.advanced_link.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.ADVANCED_LINK,
                            linked_library: libIdForLink,
                            multiple_values: true,
                        });
                });

                it('[+] Set with found linked records, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}, {id: 'linked record 43'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '43']}),
                        mockSystemQueryContext,
                    );

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                    {operator: Operator.OR},
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '43',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 42',
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 43',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set with found linked records, one existing value', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked record 43'}},
                    ] as ILinkValue[]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}, {id: 'linked record 43'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '43']}),
                        mockSystemQueryContext,
                    );

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                    {operator: Operator.OR},
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '43',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 42',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set and unset link values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked record 42'}, id_value: 'edge record 42'},
                        {payload: {id: 'linked record 43'}, id_value: 'edge record 43'},
                    ] as ILinkValue[]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}, {id: 'linked record 44'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '44']}),
                        mockSystemQueryContext,
                    );

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge record 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'linked record 44',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset link values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked record 42'}, id_value: 'edge record 42'},
                        {payload: {id: 'linked record 43'}, id_value: 'edge record 43'},
                    ]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked record 42'}, {id: 'linked record 43'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: []}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge record 42',
                                    attribute: attributeName,
                                    payload: null,
                                },
                                {
                                    id_value: 'edge record 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set single value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(`Advanced link attribute ${attributeName} expects an array of string values`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });

                it('[-] Set with not found linked record', async () => {
                    mockRecordDomain.find.mockResolvedValueOnce({list: []} as IListWithCursor<IRecord>);
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: ['42']}), mockSystemQueryContext),
                    ).rejects.toThrow(`Records with 42 UUID for library ${libIdForLink} not found`);

                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('tree mono valued', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.tree_mono.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.TREE,
                            linked_tree: treeIdForLink,
                        });
                    mockTreeDomain.getTreeProperties.mockResolvedValue({
                        libraries: {[libIdForLink]: {} as ITreeLibrarySettings},
                    });
                });

                it('[+] Set with found linked node record, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked node 42'}],
                    } as IListWithCursor<IRecord>);
                    mockTreeDomain.getNodesByRecord.mockResolvedValue(['node 42']);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext);

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 42',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'node 42',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set with found linked node record, one existing node value', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked node 43'}, id_value: 'edge node 43'},
                    ] as ITreeValue[]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked node 42'}],
                    } as IListWithCursor<IRecord>);
                    mockTreeDomain.getNodesByRecord.mockResolvedValue(['node 42']);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext);

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 42',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'node 42',
                                },
                            ]),
                        }),
                    );
                    // Important to not do delete before add in case of mono value required attribute
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.not.arrayContaining([
                                {
                                    id_value: 'edge node 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset link values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked node 43'}, id_value: 'edge node 43'},
                    ] as ITreeValue[]);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: null}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge node 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set array value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: ['42']}), mockSystemQueryContext),
                    ).rejects.toThrow(`Tree attribute ${attributeName} expects a single string value`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });

                it('[-] Set with not found node linked record', async () => {
                    mockRecordDomain.find.mockResolvedValueOnce({list: []} as IListWithCursor<IRecord>);
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(`Records with 42 UUID for library ${libIdForLink} not found`);

                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });

                it('[-] Set with not found linked node record should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked node 42'}],
                    } as IListWithCursor<IRecord>);
                    mockTreeDomain.getNodesByRecord.mockResolvedValue([]);
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(
                        `Tree attribute ${attributeName} expects at least one node, found none for records ["42"]`,
                    );

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 42',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });

            describe('tree multi valued', () => {
                const attributeName = _mockSDOMapping.test.sdoAttributes.tree_multiple.leavAttributeId;
                beforeEach(() => {
                    mockAttributeDomain.getAttributeProperties
                        .mockResolvedValueOnce({type: AttributeTypes.SIMPLE}) // first call for systemId
                        .mockResolvedValueOnce({
                            type: AttributeTypes.TREE,
                            linked_tree: treeIdForLink,
                            multiple_values: true,
                        });
                    mockTreeDomain.getTreeProperties.mockResolvedValue({
                        libraries: {[libIdForLink]: {} as ITreeLibrarySettings},
                    });
                });

                it('[+] Set with found tree nodes, not existing values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked node 42'}, {id: 'linked node 43'}],
                    } as IListWithCursor<IRecord>);
                    mockTreeDomain.getNodesByRecord.mockResolvedValue(['node 42', 'node 43']);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '43']}),
                        mockSystemQueryContext,
                    );

                    expect(mockRecordDomain.find).toHaveBeenNthCalledWith(
                        2,
                        expect.objectContaining({
                            params: {
                                library: libIdForLink,
                                filters: [
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '42',
                                    },
                                    {operator: Operator.OR},
                                    {
                                        condition: 'EQUAL',
                                        field: uuidNameLibIdForLink,
                                        value: '43',
                                    },
                                ],
                                retrieveInactive: true,
                            },
                        }),
                    );
                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 42',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 43',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'node 42',
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'node 43',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Set and unset tree values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked node 42'}, id_value: 'edge node 42'},
                        {payload: {id: 'linked node 43'}, id_value: 'edge node 43'},
                    ] as ITreeValue[]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked node 42'}, {id: 'linked node 44'}],
                    } as IListWithCursor<IRecord>);
                    mockTreeDomain.getNodesByRecord
                        .mockResolvedValueOnce(['node 42'])
                        .mockResolvedValueOnce(['node 44']);
                    await _importDomain.update(
                        simplifiedMockSdo({[attributeName]: ['42', '44']}),
                        mockSystemQueryContext,
                    );

                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 42',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockTreeDomain.getNodesByRecord).toHaveBeenCalledWith(
                        expect.objectContaining({
                            treeId: treeIdForLink,
                            record: {
                                id: 'linked node 44',
                                library: libIdForLink,
                            },
                        }),
                    );
                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge node 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                                {
                                    id_value: null,
                                    attribute: attributeName,
                                    payload: 'node 44',
                                },
                            ]),
                        }),
                    );
                });

                it('[+] Unset tree values', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([
                        {payload: {id: 'linked node 42'}, id_value: 'edge node 42'},
                        {payload: {id: 'linked node 43'}, id_value: 'edge node 43'},
                    ] as ITreeValue[]);
                    mockRecordDomain.find.mockResolvedValueOnce({
                        list: [{id: 'linked node 42'}, {id: 'linked node 43'}],
                    } as IListWithCursor<IRecord>);
                    await _importDomain.update(simplifiedMockSdo({[attributeName]: []}), mockSystemQueryContext);

                    expect(mockValueDomain.saveValueBatch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            recordId,
                            values: expect.arrayContaining([
                                {
                                    id_value: 'edge node 42',
                                    attribute: attributeName,
                                    payload: null,
                                },
                                {
                                    id_value: 'edge node 43',
                                    attribute: attributeName,
                                    payload: null,
                                },
                            ]),
                        }),
                    );
                });

                it('[-] Set single value should throw', async () => {
                    mockRecordDomain.getRecordFieldValue.mockResolvedValue([]); // no existing values
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: '42'}), mockSystemQueryContext),
                    ).rejects.toThrow(`Tree attribute ${attributeName} expects an array of string values`);
                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });

                it('[-] Set with not found node linked record', async () => {
                    mockRecordDomain.find.mockResolvedValueOnce({list: []} as IListWithCursor<IRecord>);
                    await expect(
                        _importDomain.update(simplifiedMockSdo({[attributeName]: ['42']}), mockSystemQueryContext),
                    ).rejects.toThrow(`Records with 42 UUID for library ${libIdForLink} not found`);

                    expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
                });
            });
        });
    });

    function simplifiedMockSdo(content: Record<string, unknown>): ISDO {
        return {
            ...mockSDO,
            content: {
                identifier: {
                    uuid: '1',
                },
                ...content,
            },
        };
    }
});
