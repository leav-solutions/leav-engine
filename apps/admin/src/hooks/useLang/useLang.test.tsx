// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import useLang from '.';
import MockedLangContextProvider from '../../__mocks__/MockedLangContextProvider';

describe('useLang', () => {
    const CompWithLang = () => {
        const lang = useLang();

        return <div className="lang">{lang.lang[0]}</div>;
    };

    test('Return user data from context', async () => {
        const comp = mount(
            <MockedLangContextProvider>
                <CompWithLang />
            </MockedLangContextProvider>
        );

        expect(comp.find('div.lang').text()).toBe('fr');
    });

    test('Throw if no context provided', async () => {
        // Prevent Error about missing context type from appearing in the console.
        const errorLogger = console.error;
        console.error = jest.fn();
        expect(() => mount(<CompWithLang />)).toThrowError();

        console.error = errorLogger;
    });
});
