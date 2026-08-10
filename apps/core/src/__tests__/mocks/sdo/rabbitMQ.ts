import {type IAmqpChannel} from '@leav/message-broker';
import {type IRabbitMQ} from '../../../infra/sdo/sdoRabbitMQ';

const makeMockChannel = (): Mockify<IAmqpChannel> => ({
    ack: vi.fn(),
    nack: vi.fn(),
    consume: vi.fn(),
    publish: vi.fn(),
    cancel: vi.fn(),
    close: vi.fn(),
});

const sdoExportChannel = makeMockChannel();
const sdoImportChannel = makeMockChannel();
const dtoImportChannel = makeMockChannel();
export const dtoStatementChannel = makeMockChannel();
const leavDataEventChannel = makeMockChannel();

const mockRabbitMQService: Mockify<IRabbitMQ> = {
    getSDOExportChannel: vi.fn(),
    getLeavDataEventChannel: vi.fn(),
    getSDOImportChannel: vi.fn(),
    getDTOImportChannel: vi.fn(),
    getDTOStatementChannel: vi.fn(),
    close: vi.fn(),
};

export function setupMockRabbitMQService() {
    mockRabbitMQService.getSDOExportChannel.mockResolvedValue(sdoExportChannel as IAmqpChannel);
    mockRabbitMQService.getLeavDataEventChannel.mockResolvedValue(leavDataEventChannel as IAmqpChannel);
    mockRabbitMQService.getSDOImportChannel.mockResolvedValue(sdoImportChannel as IAmqpChannel);
    mockRabbitMQService.getDTOImportChannel.mockResolvedValue(dtoImportChannel as IAmqpChannel);
    mockRabbitMQService.getDTOStatementChannel.mockResolvedValue(dtoStatementChannel as IAmqpChannel);
}

export default mockRabbitMQService;
