import {vi} from 'vitest';

export default function useSaveValueMutation() {
    return {
        saveValue: vi.fn(),
    };
}
