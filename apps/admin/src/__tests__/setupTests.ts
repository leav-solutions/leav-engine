import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

vi.mock('react-i18next', async () => import('../__mocks__/react-i18next'));

vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({}),
    }),
);
