import exportDomain, {type ISDOExportDomainDeps} from './sdoExportDomain';
import {type IDbEvent, EventAction} from '@leav/utils';
import {type ToAny} from '../../../utils/utils';
import mockRabbitMQService, {setupMockRabbitMQService} from '../../../__tests__/mocks/sdo/rabbitMQ';
import {mockConfig} from '../../../__tests__/mocks/sdo/config';
import {mockSDO, mockSDOMapping} from '../../../__tests__/mocks/sdo/data';
import {mockRecordSDORepo, mockSDOUtils, mockSdoDomain} from '../../../__tests__/mocks/sdo/domains';
import {type ISDOMappingLibrary} from '../../../_types/sdo';
import {mockSystemQueryContext} from '../../../__tests__/mocks/shared';

const deps: ToAny<ISDOExportDomainDeps> = {
    'core.infra.sdo.rabbitMQ': mockRabbitMQService,
    config: mockConfig,
    'core.utils.sdo': mockSDOUtils,
    'core.infra.sdo.recordsSDORepo': mockRecordSDORepo,
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
    'core.domain.sdo': mockSdoDomain,
};

const timer = 120000;

describe('sdoExportDomain', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.spyOn(global, 'setTimeout');
        mockSdoDomain.resolveAdditionalLibraryTriggerTargets.mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
        setupMockRabbitMQService();
    });

    const _sdoExportDomain = exportDomain(deps);

    describe('process()', () => {
        it('[+] should buffer a new call with timer', async () => {
            const mockProcessCallback = vi.fn().mockResolvedValue(undefined);

            const processPromise = _sdoExportDomain.process('campaigns', 'record123', timer, mockProcessCallback);

            await vi.advanceTimersByTimeAsync(timer * 0.5);
            // buffer timer not yet finished
            expect(mockProcessCallback).toHaveBeenCalledTimes(0);

            await vi.advanceTimersByTimeAsync(timer * 0.6);

            await expect(processPromise).resolves.toBeUndefined();
            expect(mockProcessCallback).toHaveBeenCalledTimes(1);
            expect(mockProcessCallback).toHaveBeenNthCalledWith(1, 'campaigns', 'record123');
        });

        it('[+] should refresh existing buffer timer', async () => {
            const mockProcessCallback = vi.fn().mockResolvedValue(undefined);

            // First call creates the buffer and stores the fake timer
            const firstPromise = _sdoExportDomain.process('campaigns', 'record123', timer, mockProcessCallback);

            await vi.advanceTimersByTimeAsync(timer * 0.5);

            // Second call should call refresh on the same timer
            const secondPromise = _sdoExportDomain.process('campaigns', 'record123', timer, mockProcessCallback);

            // First promise resolves just after refresh buffer timer
            await expect(firstPromise).resolves.toBeUndefined();

            // Check buffer timer still pending
            await vi.advanceTimersByTimeAsync(timer * 0.9);
            expect(mockProcessCallback).toHaveBeenCalledTimes(0);

            // Let buffer timer to be triggered
            await vi.advanceTimersByTimeAsync(timer * 0.2);

            await expect(secondPromise).resolves.toBeUndefined();

            expect(mockProcessCallback).toHaveBeenCalledTimes(1);
            expect(mockProcessCallback).toHaveBeenNthCalledWith(1, 'campaigns', 'record123');
        });

        it('[+] Should call process callback after setTimeout delay', async () => {
            const mockProcessCallback = vi.fn().mockResolvedValue(undefined);

            const processPromise = _sdoExportDomain.process('campaigns', 'record123', timer, mockProcessCallback);

            // Fast-forward time
            vi.runAllTimers();

            // let callback to be called in setTimeout handler
            await expect(processPromise).resolves.toBeUndefined();

            expect(mockProcessCallback).toHaveBeenCalledWith('campaigns', 'record123');
        });

        it('[+] buffers different targets independently', async () => {
            const mockProcessCallback = vi.fn().mockResolvedValue(undefined);

            const firstPromise = _sdoExportDomain.process('campaigns', 'record123', timer, mockProcessCallback);
            const secondPromise = _sdoExportDomain.process('structure_items', 'record456', timer, mockProcessCallback);

            vi.runAllTimers();

            await expect(firstPromise).resolves.toBeUndefined();
            await expect(secondPromise).resolves.toBeUndefined();

            expect(mockProcessCallback).toHaveBeenCalledTimes(2);
            expect(mockProcessCallback).toHaveBeenCalledWith('campaigns', 'record123');
            expect(mockProcessCallback).toHaveBeenCalledWith('structure_items', 'record456');
        });

        it('[-] Should raise error from callback', async () => {
            const processError = new Error('Process error');
            const mockProcessCallback = vi.fn().mockRejectedValue(processError);

            const processPromise = _sdoExportDomain.process('campaigns', 'record123', timer, mockProcessCallback);

            // Fast-forward time
            vi.runAllTimers();

            // let callback to be called in setTimeout handler
            await expect(processPromise).rejects.toThrow(processError);

            expect(mockProcessCallback).toHaveBeenCalledWith('campaigns', 'record123');
        });
    });

    describe('sendSDO', () => {
        beforeEach(() => {
            mockSDOUtils.getRecordUUIDFromSDO.mockReturnValue('uuid-1');
        });

        it('[+] Should send SDO to RabbitMQ, persist the content and log the export when content changed', async () => {
            mockRecordSDORepo.getContent.mockResolvedValueOnce({system: {systemId: 'uuid-1', old: true}}); // different -> export

            await _sdoExportDomain.sendSDO('libraryId', 'recordId', mockSDO);

            // Verify RabbitMQ publish was called
            expect((await mockRabbitMQService.getSDOExportChannel()).publish).toHaveBeenCalledWith(
                mockConfig.sdo.exchange,
                '',
                Buffer.from(JSON.stringify(mockSDO)),
            );

            expect(mockRecordSDORepo.upsertContent).toHaveBeenCalledWith({
                recordUUID: 'uuid-1',
                libraryId: 'libraryId',
                recordId: 'recordId',
                content: mockSDO.content,
                ctx: mockSystemQueryContext,
            });

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.SDO_LOG_EXPORT_RECORD,
                record: {id: 'recordId', libraryId: 'libraryId'},
                sdo: mockSDO,
                ctx: mockSystemQueryContext,
            });
        });

        it('[+] Should skip export when the SDO content is unchanged', async () => {
            mockRecordSDORepo.getContent.mockResolvedValueOnce(mockSDO.content); // identical -> skip

            await _sdoExportDomain.sendSDO('libraryId', 'recordId', mockSDO);

            expect((await mockRabbitMQService.getSDOExportChannel()).publish).not.toHaveBeenCalled();
            expect(mockRecordSDORepo.upsertContent).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).not.toHaveBeenCalled();
        });
    });

    describe('getSDOExportTargets()', () => {
        it('[-] Should return [] when event has INVALID_ACTION', async () => {
            const invalidActionEvent = {
                payload: {
                    action: 'INVALID_ACTION',
                },
            } as IDbEvent;

            const targets = await _sdoExportDomain.getSDOExportTargets(
                invalidActionEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([]);
        });

        it('[-] Should throw when libraryId is not defined', async () => {
            const undefinedLibraryEvent = {
                payload: {
                    action: 'RECORD_INIT',
                    topic: {
                        attribute: 'attribute',
                    },
                },
            } as IDbEvent;

            await expect(
                _sdoExportDomain.getSDOExportTargets(undefinedLibraryEvent, mockSDOMapping, mockSystemQueryContext),
            ).rejects.toThrow('Library name not defined');
        });

        it('[-] Should throw when attribute is not defined for UPDATE action on a directly mapped library', async () => {
            const undefinedAttributeEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        record: {
                            id: 'record123',
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);

            await expect(
                _sdoExportDomain.getSDOExportTargets(undefinedAttributeEvent, mockSDOMapping, mockSystemQueryContext),
            ).rejects.toThrow('[SDO] Leav Attribute not defined in amqp db event');
        });

        it('[-] Should return [] when there is no direct mapping and no additional trigger resolves anything', async () => {
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            id: 'record123',
                            libraryId: 'structure_items',
                        },
                    },
                },
            } as IDbEvent;

            // getLibraryMapping returns undefined by default (no direct mapping)
            const targets = await _sdoExportDomain.getSDOExportTargets(
                goodEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([]);
        });

        it('[-] Should return [] when mapping attribute is not part of the direct mapping', async () => {
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            id: 'record123',
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);
            mockSDOUtils.hasSDOAttribute.mockReturnValue(false);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                goodEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([]);
        });

        it('[+] Should return the direct match target for a CREATE action', async () => {
            const goodEvent = {
                payload: {
                    action: 'RECORD_INIT',
                    topic: {
                        record: {
                            id: 'record123',
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                goodEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'record123', action: 'CREATE'}]);
        });

        it('[+] Should return the direct match target for an UPDATE action when the attribute is mapped', async () => {
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            id: 'record123',
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);
            mockSDOUtils.hasSDOAttribute.mockReturnValue(true);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                goodEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'record123', action: 'UPDATE'}]);
        });

        it('[+] Should include both the direct match target and a resolved additional-trigger target', async () => {
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            id: 'record123',
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);
            mockSDOUtils.hasSDOAttribute.mockReturnValue(true);
            mockSdoDomain.resolveAdditionalLibraryTriggerTargets.mockResolvedValueOnce([
                {leavLibraryId: 'map', recordId: 'map1'},
            ]);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                goodEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual(
                expect.arrayContaining([
                    {leavLibraryId: 'campaigns', recordId: 'record123', action: 'UPDATE'},
                    {leavLibraryId: 'map', recordId: 'map1', action: 'UPDATE'},
                ]),
            );
            expect(mockSdoDomain.resolveAdditionalLibraryTriggerTargets).toHaveBeenCalledWith(
                mockSDOMapping,
                'campaigns',
                'record123',
                mockSystemQueryContext,
            );
        });

        it('[+] Should not throw on a missing attribute when there is no direct mapping but additional triggers resolve targets', async () => {
            const recordSaveEvent = {
                payload: {
                    action: 'RECORD_SAVE',
                    topic: {
                        record: {
                            id: 'structureItem123',
                            libraryId: 'structure_items',
                        },
                    },
                },
            } as IDbEvent;

            // No direct mapping for structure_items
            mockSDOUtils.getLibraryMapping.mockReturnValueOnce(undefined);
            mockSdoDomain.resolveAdditionalLibraryTriggerTargets.mockResolvedValueOnce([
                {leavLibraryId: 'campaigns', recordId: 'campaign1'},
            ]);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                recordSaveEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'campaign1', action: 'UPDATE'}]);
        });

        it('[+] Should force the action to UPDATE for additional-trigger targets even when the originating event is a CREATE', async () => {
            const createEvent = {
                payload: {
                    action: 'RECORD_INIT',
                    topic: {
                        record: {
                            id: 'structureItem123',
                            libraryId: 'structure_items',
                        },
                    },
                },
            } as IDbEvent;

            // No direct mapping for structure_items
            mockSDOUtils.getLibraryMapping.mockReturnValueOnce(undefined);
            mockSdoDomain.resolveAdditionalLibraryTriggerTargets.mockResolvedValueOnce([
                {leavLibraryId: 'campaigns', recordId: 'campaign1'},
            ]);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                createEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'campaign1', action: 'UPDATE'}]);
        });

        it('[+] Should dedupe when the direct match and an additional trigger resolve to the same target, keeping the direct match action', async () => {
            const createEvent = {
                payload: {
                    action: 'RECORD_INIT',
                    topic: {
                        record: {
                            id: 'campaign1',
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);
            mockSdoDomain.resolveAdditionalLibraryTriggerTargets.mockResolvedValueOnce([
                {leavLibraryId: 'campaigns', recordId: 'campaign1'},
            ]);

            const targets = await _sdoExportDomain.getSDOExportTargets(
                createEvent,
                mockSDOMapping,
                mockSystemQueryContext,
            );

            expect(targets).toEqual([{leavLibraryId: 'campaigns', recordId: 'campaign1', action: 'CREATE'}]);
        });
    });
});
