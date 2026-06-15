import {type ConfirmChannel} from 'amqplib';
import {type IRabbitMQ} from '../../../infra/sdo/rabbitMQ/rabbitMQ';

const amqpFn: Mockify<ConfirmChannel> = {
    ack: vi.fn(),
    nack: vi.fn(),
    publish: vi.fn(),
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    waitForConfirms: vi.fn(),
};

const mockRabbitMQService: Mockify<IRabbitMQ> = {
    getSDOExportChannel: vi.fn(),
    getLeavDataEventChannel: vi.fn(),
    getSDOImportChannel: vi.fn(),
};

export function setupMockRabbitMQService() {
    mockRabbitMQService.getSDOExportChannel.mockResolvedValue(amqpFn as ConfirmChannel);
    mockRabbitMQService.getLeavDataEventChannel.mockResolvedValue(amqpFn as ConfirmChannel);
    mockRabbitMQService.getSDOImportChannel.mockResolvedValue(amqpFn as ConfirmChannel);
}

export default mockRabbitMQService;
