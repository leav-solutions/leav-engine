import {type IAmqpChannel} from '@leav/message-broker';
import {type ConfirmChannel} from 'amqplib';
import {type IRabbitMQ} from '../../../infra/sdo/sdoRabbitMQ';

const sdoConnectionChannel: Mockify<ConfirmChannel> = {
    ack: vi.fn(),
    nack: vi.fn(),
    publish: vi.fn(),
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    waitForConfirms: vi.fn(),
};

const leavDataEventChannel: Mockify<IAmqpChannel> = {
    ack: vi.fn(),
    nack: vi.fn(),
    consume: vi.fn(),
    publish: vi.fn(),
    cancel: vi.fn(),
    close: vi.fn(),
};

const mockRabbitMQService: Mockify<IRabbitMQ> = {
    getSDOExportChannel: vi.fn(),
    getLeavDataEventChannel: vi.fn(),
    getSDOImportChannel: vi.fn(),
};

export function setupMockRabbitMQService() {
    mockRabbitMQService.getSDOExportChannel.mockResolvedValue(sdoConnectionChannel as ConfirmChannel);
    mockRabbitMQService.getLeavDataEventChannel.mockResolvedValue(leavDataEventChannel as IAmqpChannel);
    mockRabbitMQService.getSDOImportChannel.mockResolvedValue(sdoConnectionChannel as ConfirmChannel);
}

export default mockRabbitMQService;
