import {type Mock} from 'vitest';

const logger: {info: Mock; warn: Mock; error: Mock; debug: Mock} = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

export default logger;
