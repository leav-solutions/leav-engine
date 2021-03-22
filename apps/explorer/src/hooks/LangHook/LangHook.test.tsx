// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IGetLangAll} from '../../graphQL/queries/cache/lang/getLangQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {useLang} from './LangHook';

describe('LangHook', () => {
    const mockLang: IGetLangAll = {
        lang: ['fr'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'en'
    };

    test('should get anything if no lang set', async () => {
        let givenLang: any;

        const ComponentUsingNotification = () => {
            const [lang] = useLang();

            givenLang = lang;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenLang).toEqual({
            lang: [],
            availableLangs: [],
            defaultLang: ''
        });
    });

    test('should get lang', async () => {
        let givenLang: any;

        const ComponentUsingNotification = () => {
            const [lang, updateLang] = useLang();

            updateLang(mockLang);

            givenLang = lang;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenLang).toEqual(mockLang);
    });
});
