import {type Mock} from 'vitest';

const amqp: {consumer: {channel: {ack: Mock}}} = {
    consumer: {
        channel: {
            ack: vi.fn(),
        },
    },
};

export default amqp;
