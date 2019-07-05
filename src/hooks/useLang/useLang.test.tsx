import {mount} from 'enzyme';
import React from 'react';
import useLang from '.';
import MockedLangContextProvider from '../../__mocks__/MockedLangContextProvider';

describe('useLang', () => {
    /* tslint:disable-next-line:variable-name */
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
        console.error = () => {}; // tslint:disable-line
        expect(() => mount(<CompWithLang />)).toThrowError();

        console.error = errorLogger;
    });
});
