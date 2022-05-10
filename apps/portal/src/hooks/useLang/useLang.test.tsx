// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LangContext from 'context/LangContext';
import {ILangContext} from 'context/LangContext/LangContext';
import React from 'react';
import {renderHook} from '_tests/testUtils';
import useLang from '.';

describe('useLang', () => {
    const mockLangs: ILangContext = {
        lang: ['fr'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        setLang: jest.fn()
    };

    test('Return user data from context', async () => {
        const {result} = renderHook(() => useLang(), {
            wrapper: ({children}) => <LangContext.Provider value={mockLangs}>{children}</LangContext.Provider>
        });

        expect(result.current).toEqual(mockLangs);
    });

    test('Throw if no context provided', async () => {
        // Prevent Error about missing context type from appearing in the console.
        const errorLogger = console.error;
        console.error = jest.fn();
        expect(() => renderHook(() => useLang())).toThrowError();

        console.error = errorLogger;
    });
});
