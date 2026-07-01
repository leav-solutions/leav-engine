import {renderHook} from '_ui/_tests/testUtils';
import useLang from './useLang';
import {MockedLangContextProvider} from '../../testing';

describe('useLang', () => {
    const CompWithLang = () => {
        const lang = useLang();

        return <div className="lang">{lang.lang[0]}</div>;
    };

    test('Return user data from context', async () => {
        const hook = renderHook(() => useLang(), {
            wrapper: ({children}) => <MockedLangContextProvider>{children as JSX.Element}</MockedLangContextProvider>,
        });

        expect(hook.result.current.lang).toEqual(['fr']);
    });

    test('Throw if no context provided', async () => {
        const errorLogger = console.error;
        console.error = vi.fn();
        try {
            renderHook(() => useLang());
        } catch (e) {
            expect(e).toBeDefined();
        }

        console.error = errorLogger;
    });
});
