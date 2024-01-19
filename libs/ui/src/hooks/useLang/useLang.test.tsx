// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import useLang from '.';
import {MockedLangContextProvider} from '../../testing';

describe('useLang', () => {
    const CompWithLang = () => {
        const lang = useLang();

        return <div className="lang">{lang.lang[0]}</div>;
    };

    test('Return user data from context', async () => {
        const hook = renderHook(() => useLang(), {
            wrapper: ({children}) => <MockedLangContextProvider>{children as JSX.Element}</MockedLangContextProvider>
        });

        expect(hook.result.current.lang).toEqual(['fr']);
    });

    test('Throw if no context provided', async () => {
        const errorLogger = console.error;
        console.error = jest.fn();
        try {
            renderHook(() => useLang());
        } catch (e) {
            expect(e).toBeDefined();
        }

        console.error = errorLogger;
    });
});
