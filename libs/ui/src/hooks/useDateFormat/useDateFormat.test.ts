import {renderHook} from '_ui/_tests/testUtils';
import useLang from '_ui/hooks/useLang/useLang';
import {useDateFormat} from './useDateFormat';

vi.mock('_ui/hooks/useLang/useLang', () => ({default: vi.fn()}));

describe('useDateFormat', () => {
    it('should return the french date format when current lang is fr', () => {
        vi.mocked(useLang).mockReturnValue({
            lang: ['fr', 'en'],
            availableLangs: ['fr', 'en'],
            defaultLang: 'fr',
            setLang: vi.fn(),
        });

        const {result} = renderHook(() => useDateFormat());

        expect(result.current).toBe('DD/MM/YYYY');
    });

    it('should return the default date format for any other lang', () => {
        vi.mocked(useLang).mockReturnValue({
            lang: ['en', 'fr'],
            availableLangs: ['fr', 'en'],
            defaultLang: 'fr',
            setLang: vi.fn(),
        });

        const {result} = renderHook(() => useDateFormat());

        expect(result.current).toBe('MM/DD/YYYY');
    });
});
