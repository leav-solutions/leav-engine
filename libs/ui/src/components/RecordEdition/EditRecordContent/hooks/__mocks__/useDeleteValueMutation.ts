import {vi} from 'vitest';

export default function useDeleteValueMutation() {
    return {
        deleteValue: vi.fn(),
    };
}
