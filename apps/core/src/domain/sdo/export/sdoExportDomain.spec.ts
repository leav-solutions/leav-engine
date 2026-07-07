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
    });

    afterEach(() => {
        vi.useRealTimers();
        setupMockRabbitMQService();
    });

    const _sdoExportDomain = exportDomain(deps);

    const getValidEvent = (overrides = {}): IDbEvent =>
        ({
            payload: {
                action: 'RECORD_INIT',
                topic: {
                    attribute: 'id',
                    library: 'campaigns',
                    record: {id: 'record123', libraryId: 'campaigns'},
                },
                ...overrides,
            },
        }) as IDbEvent;

    describe('process()', () => {
        it('[+] should buffer valid a new event with timer', async () => {
            const mockProcessCallback = vi.fn().mockResolvedValue(undefined);

            const processPromise = _sdoExportDomain.process(getValidEvent(), timer, mockProcessCallback);

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

            const event = getValidEvent();

            // First call creates the buffer and stores the fake timer
            const firstPromise = _sdoExportDomain.process(event, timer, mockProcessCallback);

            await vi.advanceTimersByTimeAsync(timer * 0.5);

            // Second call should call refresh on the same timer
            const secondPromise = _sdoExportDomain.process(event, timer, mockProcessCallback);

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
            const event = getValidEvent();
            const mockProcessCallback = vi.fn().mockResolvedValue(undefined);

            const processPromise = _sdoExportDomain.process(event, timer, mockProcessCallback);

            // Fast-forward time
            vi.runAllTimers();

            // let callback to be called in setTimeout handler
            await expect(processPromise).resolves.toBeUndefined();

            expect(mockProcessCallback).toHaveBeenCalledWith(
                event.payload.topic.library,
                event.payload.topic.record.id,
            );
        });

        it('[-] Should raise error from callback', async () => {
            const event = getValidEvent();
            const processError = new Error('Process error');
            const mockProcessCallback = vi.fn().mockRejectedValue(processError);

            const processPromise = _sdoExportDomain.process(event, timer, mockProcessCallback);

            // Fast-forward time
            vi.runAllTimers();

            // let callback to be called in setTimeout handler
            await expect(processPromise).rejects.toThrow(processError);

            expect(mockProcessCallback).toHaveBeenCalledWith(
                event.payload.topic.library,
                event.payload.topic.record.id,
            );
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
                mockConfig.sdo.export.exchange,
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

    describe('isSDODataEvent() when empty sdoConfig', () => {
        it('[-] Should return null when event has INVALID_ACTION', async () => {
            const invalidActionEvent = {
                payload: {
                    action: 'INVALID_ACTION',
                },
            } as IDbEvent;

            const isValid = await _sdoExportDomain.getSDODataEvent(invalidActionEvent, mockSDOMapping);

            expect(isValid).toBe(null);
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

            await expect(_sdoExportDomain.getSDODataEvent(undefinedLibraryEvent, mockSDOMapping)).rejects.toThrow(
                'Library name not defined',
            );
        });

        it('[-] Should throw when attribute is not defined for UPDATE action', async () => {
            const undefinedAttributeEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        record: {
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);

            await expect(_sdoExportDomain.getSDODataEvent(undefinedAttributeEvent, mockSDOMapping)).rejects.toThrow(
                '[SDO] Leav Attribute not defined in amqp db event',
            );
        });

        it('[-] Should return false when mapping library is undefined', async () => {
            // getLibraryMapping return undefined
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            const isValid = await _sdoExportDomain.getSDODataEvent(goodEvent, mockSDOMapping);

            expect(isValid).toBe(null);
        });
        it('[-] Should return false when mapping attribute is undefined', async () => {
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);
            // hasSDOAttribute return undefined

            const isValid = await _sdoExportDomain.getSDODataEvent(goodEvent, mockSDOMapping);

            expect(isValid).toBe(null);
        });

        it('[+] Should return true when everything is set and in SDO config for CREATE action', async () => {
            const goodEvent = {
                payload: {
                    action: 'RECORD_INIT',
                    topic: {
                        record: {
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);

            const isValid = await _sdoExportDomain.getSDODataEvent(goodEvent, mockSDOMapping);

            expect(isValid).toBe('CREATE');
        });

        it('[+] Should return true when everything is set and in SDO config for UPDATE action', async () => {
            const goodEvent = {
                payload: {
                    action: 'VALUE_SAVE',
                    topic: {
                        attribute: 'attribute',
                        record: {
                            libraryId: 'campaigns',
                        },
                    },
                },
            } as IDbEvent;

            mockSDOUtils.getLibraryMapping.mockReturnValue({} as ISDOMappingLibrary);
            mockSDOUtils.hasSDOAttribute.mockReturnValue(true);

            const isValid = await _sdoExportDomain.getSDODataEvent(goodEvent, mockSDOMapping);

            expect(isValid).toBe('UPDATE');
        });
    });
});
