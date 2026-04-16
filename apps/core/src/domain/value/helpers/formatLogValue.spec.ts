// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ToAny} from '../../../utils/utils';
import formatLogValue from './formatLogValue';
import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IRecordDomain} from '../../record/recordDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type ITreeDomain} from '../../tree/treeDomain';
import mockLogger from '../../../__tests__/mockers/logger';
import {mockTranslator} from '../../../__tests__/mocks/translator';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type Log} from '../../../_types/log';
import {EventAction} from '@leav/utils';
import {type IDBPayloadData} from '../../../_types/events';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {type IListWithCursor} from '../../../_types/list';
import {AttributeCondition, type IRecord, type IRecordIdentity} from '../../../_types/record';
import {ActionsListEvents} from '../../../_types/actionsList';
import {type Mocked} from 'vitest';

const actionListMock: Mocked<Partial<IActionsListDomain>> = {
    runActionsList: vi.fn(),
};

const recordDomainMock: Mocked<Partial<IRecordDomain>> = {
    find: vi.fn(),
    getRecordIdentity: vi.fn(),
};

const attributeDomainMock: Mocked<Partial<IAttributeDomain>> = {
    getAttributeProperties: vi.fn(),
};

const treeDomainMock: Mocked<Partial<ITreeDomain>> = {
    getRecordByNodeId: vi.fn(),
};

const deps: ToAny<Parameters<typeof formatLogValue>[0]> = {
    'core.domain.actionsList': actionListMock,
    'core.domain.record': recordDomainMock,
    'core.domain.attribute': attributeDomainMock,
    'core.domain.tree': treeDomainMock,
    'core.utils.logger': mockLogger,
    translator: mockTranslator,
};

describe('formatLogValue', () => {
    const _formatLogValue = formatLogValue(deps);

    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeEach(() => {
        vi.resetAllMocks();
        mockTranslator.t.mockImplementation((key: string | string[]) => key as string);
    });

    describe('formatAsString', () => {
        it('Should return unknown value when attribute not found', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const log: Log = {
                action: EventAction.VALUE_SAVE,
                topic: {
                    attribute: 'unknown_attribute',
                },
            } as Log;
            const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                payload: {
                    id: '1',
                    library: 'test',
                },
            };

            attributeDomainMock.getAttributeProperties.mockResolvedValue(null);

            return expect(_formatLogValue.formatAsString(log, rawData, ctx)).resolves.toBe('logs.unknown_value');
        });

        describe('standard attribute', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const log: Log = {
                action: EventAction.VALUE_SAVE,
                topic: {
                    attribute: 'standard_attribute',
                },
            } as Log;

            it('Should return unknown value when log data contains undefined payload', async () => {
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: undefined,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('logs.unknown_value');
            });

            it('Should return standard attribute value as string', async () => {
                const attributeValue = 'Standard attribute value';

                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe(attributeValue);
            });

            it('Should return standard attribute boolean value as string', async () => {
                const attributeValue = true;
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.BOOLEAN,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('global.yes');
            });

            it('Should return standard attribute extends value as string', async () => {
                const attributeValue = {url: 'test'};
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe(JSON.stringify(attributeValue));
            });

            it('Should return standard attribute encrypted value as string', async () => {
                const attributeValue = 'encrypted_value';
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.ENCRYPTED,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('*****');
            });

            it('Should return standard attribute date value as string without getValue action formatDate', async () => {
                const attributeValue = 1756715467760;
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('1756715467760');
                expect(actionListMock.runActionsList).not.toHaveBeenCalled();
            });

            it('Should return standard attribute date value as string with getValue action formatDate', async () => {
                const attributeValue = 1756715467760;
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                const attributeProps: IAttribute = {
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE,
                    actions_list: {
                        getValue: [
                            {
                                id: 'formatDate',
                                name: 'Format date',
                            },
                        ],
                    },
                };
                attributeDomainMock.getAttributeProperties.mockResolvedValue(attributeProps);

                actionListMock.runActionsList.mockResolvedValue([
                    {
                        payload: '2025-09-01', // for instance
                    },
                ]);

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('2025-09-01');
                expect(actionListMock.runActionsList).toHaveBeenCalledWith(
                    [
                        {
                            id: 'formatDate',
                            name: 'Format date',
                        },
                    ],
                    [
                        {
                            raw_payload: attributeValue,
                        },
                    ],
                    {
                        ...ctx,
                        attribute: attributeProps,
                        actionEvent: ActionsListEvents.GET_VALUE,
                    },
                );
            });

            it('Should return standard attribute date range value as string without getValue action formatDateRange', async () => {
                const attributeValue = {
                    from: 1756715467760,
                    to: 1756801867760,
                };
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE_RANGE,
                });

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('labels.date_range');
                expect(actionListMock.runActionsList).not.toHaveBeenCalled();
            });

            it('Should return standard attribute date range value as string with getValue action formatDateRange', async () => {
                const attributeValue = {
                    from: 1756715467760,
                    to: 1756801867760,
                };
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: attributeValue,
                };
                const attributeProps: IAttribute = {
                    id: 'standard_attribute',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE_RANGE,
                    actions_list: {
                        getValue: [
                            {
                                id: 'formatDateRange',
                                name: 'Format date range',
                            },
                        ],
                    },
                };
                attributeDomainMock.getAttributeProperties.mockResolvedValue(attributeProps);

                actionListMock.runActionsList.mockResolvedValue([
                    {
                        payload: {
                            from: '2025-09-01',
                            to: '2025-09-02',
                        },
                    },
                ]);

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('labels.date_range');
                expect(actionListMock.runActionsList).toHaveBeenCalledWith(
                    [
                        {
                            id: 'formatDateRange',
                            name: 'Format date range',
                        },
                    ],
                    [
                        {
                            raw_payload: attributeValue,
                        },
                    ],
                    {
                        ...ctx,
                        attribute: attributeProps,
                        actionEvent: ActionsListEvents.GET_VALUE,
                    },
                );
                expect(mockTranslator.t).toHaveBeenCalledWith(
                    'labels.date_range',
                    expect.objectContaining({
                        from: '2025-09-01',
                        to: '2025-09-02',
                    }),
                );
            });
        });

        describe('link attribute', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const log: Log = {
                action: EventAction.VALUE_SAVE,
                topic: {
                    attribute: 'link_attribute',
                },
            } as Log;

            it('Should return linked record name', async () => {
                const linkedRecordId = '7';
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: {
                        id: linkedRecordId,
                        library: 'test_link',
                    },
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'link_attribute',
                    type: AttributeTypes.SIMPLE_LINK,
                });

                recordDomainMock.find.mockResolvedValue({
                    list: [
                        {
                            id: linkedRecordId,
                        },
                    ],
                } as IListWithCursor<IRecord>);

                recordDomainMock.getRecordIdentity.mockResolvedValue({
                    getLabel: async () => 'Linked record name',
                } as IRecordIdentity);

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('Linked record name');
                expect(attributeDomainMock.getAttributeProperties).toHaveBeenCalledWith({id: 'link_attribute', ctx});
                expect(recordDomainMock.find).toHaveBeenCalledWith({
                    params: {
                        library: 'test_link',
                        filters: [
                            {
                                field: 'id',
                                value: linkedRecordId,
                                condition: AttributeCondition.EQUAL,
                            },
                        ],
                        retrieveInactive: true,
                        ignorePermissions: true,
                        withCount: false,
                    },
                    ctx,
                });
                expect(recordDomainMock.getRecordIdentity).toHaveBeenCalledWith({id: linkedRecordId}, ctx);
            });

            it('Should return fallback string when record not exists anymore', async () => {
                const linkedRecordId = 'not-exists';
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: {
                        id: 'not-exists',
                        library: 'test_link',
                    },
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'link_attribute',
                    type: AttributeTypes.SIMPLE_LINK,
                });

                recordDomainMock.find.mockResolvedValue({
                    list: [],
                } as IListWithCursor<IRecord>);

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe(`test_link/${linkedRecordId} [logs.deleted_record]`);
                expect(attributeDomainMock.getAttributeProperties).toHaveBeenCalledWith({id: 'link_attribute', ctx});
                expect(recordDomainMock.find).toHaveBeenCalledWith({
                    params: {
                        library: 'test_link',
                        filters: [
                            {
                                field: 'id',
                                value: linkedRecordId,
                                condition: AttributeCondition.EQUAL,
                            },
                        ],
                        retrieveInactive: true,
                        ignorePermissions: true,
                        withCount: false,
                    },
                    ctx,
                });
            });

            it('Should return recordLabel from metadata when record fetch fails', async () => {
                const rawData: IDBPayloadData<EventAction.VALUE_DELETE> = {
                    payload: {
                        id: 'purged-record',
                        library: 'test_link',
                    },
                };

                const logWithMetadata: Log = {
                    action: EventAction.VALUE_DELETE,
                    topic: {attribute: 'link_attribute'},
                    metadata: {recordLabel: 'Purged Record Label'},
                } as Log;

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'link_attribute',
                    type: AttributeTypes.SIMPLE_LINK,
                });

                recordDomainMock.find.mockRejectedValue(new Error('DB error'));

                const result = await _formatLogValue.formatAsString(logWithMetadata, rawData, ctx);

                expect(result).toBe('Purged Record Label [logs.deleted_record]');
            });

            it('Should return fallback string when record fetch fails and no metadata', async () => {
                const rawData: IDBPayloadData<EventAction.VALUE_DELETE> = {
                    payload: {
                        id: 'purged-record',
                        library: 'test_link',
                    },
                };

                const logWithoutMetadata: Log = {
                    action: EventAction.VALUE_DELETE,
                    topic: {attribute: 'link_attribute'},
                } as Log;

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'link_attribute',
                    type: AttributeTypes.SIMPLE_LINK,
                });

                recordDomainMock.find.mockRejectedValue(new Error('DB error'));

                const result = await _formatLogValue.formatAsString(logWithoutMetadata, rawData, ctx);

                expect(result).toBe('test_link/purged-record [logs.deleted_record]');
            });
        });

        describe('tree attribute', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const log: Log = {
                action: EventAction.VALUE_SAVE,
                topic: {
                    attribute: 'tree_attribute',
                },
            } as Log;

            it('Should return tree node record name', async () => {
                const linkedNodeId = '42';
                const nodeRecordId = '100';

                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: {
                        id: linkedNodeId,
                    },
                    treeId: 'tree_1',
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'tree_attribute',
                    type: AttributeTypes.TREE,
                });

                treeDomainMock.getRecordByNodeId.mockResolvedValue({
                    id: nodeRecordId,
                } as IRecord);

                recordDomainMock.getRecordIdentity.mockResolvedValue({
                    getLabel: async () => 'Tree node record name',
                } as IRecordIdentity);

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe('Tree node record name');
                expect(attributeDomainMock.getAttributeProperties).toHaveBeenCalledWith({id: 'tree_attribute', ctx});
                expect(treeDomainMock.getRecordByNodeId).toHaveBeenCalledWith({
                    nodeId: linkedNodeId,
                    treeId: 'tree_1',
                    ctx,
                });
                expect(recordDomainMock.getRecordIdentity).toHaveBeenCalledWith({id: nodeRecordId}, ctx);
            });

            it('Should return fallback string when node not exists anymore', async () => {
                const linkedNodeId = '42';
                const rawData: IDBPayloadData<EventAction.VALUE_SAVE> = {
                    payload: {
                        id: linkedNodeId,
                    },
                    treeId: 'tree_1',
                };

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'tree_attribute',
                    type: AttributeTypes.TREE,
                });

                treeDomainMock.getRecordByNodeId.mockResolvedValue(null);

                const result = await _formatLogValue.formatAsString(log, rawData, ctx);

                expect(result).toBe(`tree_1/${linkedNodeId} [logs.deleted_record]`);
                expect(attributeDomainMock.getAttributeProperties).toHaveBeenCalledWith({id: 'tree_attribute', ctx});
                expect(treeDomainMock.getRecordByNodeId).toHaveBeenCalledWith({
                    nodeId: linkedNodeId,
                    treeId: 'tree_1',
                    ctx,
                });
            });

            it('Should return recordLabel from metadata when tree node fetch fails', async () => {
                const rawData: IDBPayloadData<EventAction.VALUE_DELETE> = {
                    payload: {id: '42'},
                    treeId: 'tree_1',
                };

                const logWithMetadata: Log = {
                    action: EventAction.VALUE_DELETE,
                    topic: {attribute: 'tree_attribute'},
                    metadata: {recordLabel: 'Purged Tree Node Label'},
                } as Log;

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'tree_attribute',
                    type: AttributeTypes.TREE,
                });

                treeDomainMock.getRecordByNodeId.mockRejectedValue(new Error('Tree error'));

                const result = await _formatLogValue.formatAsString(logWithMetadata, rawData, ctx);

                expect(result).toBe('Purged Tree Node Label [logs.deleted_record]');
            });

            it('Should return fallback string when tree node fetch fails and no metadata', async () => {
                const rawData: IDBPayloadData<EventAction.VALUE_DELETE> = {
                    payload: {id: '42'},
                    treeId: 'tree_1',
                };

                const logWithoutMetadata: Log = {
                    action: EventAction.VALUE_DELETE,
                    topic: {attribute: 'tree_attribute'},
                } as Log;

                attributeDomainMock.getAttributeProperties.mockResolvedValue({
                    id: 'tree_attribute',
                    type: AttributeTypes.TREE,
                });

                treeDomainMock.getRecordByNodeId.mockRejectedValue(new Error('Tree error'));

                const result = await _formatLogValue.formatAsString(logWithoutMetadata, rawData, ctx);

                expect(result).toBe('tree_1/42 [logs.deleted_record]');
            });
        });
    });
});
