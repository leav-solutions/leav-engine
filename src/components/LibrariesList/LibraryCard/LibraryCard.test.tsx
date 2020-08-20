import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {ILibrary} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryCard from './LibraryCard';

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn
}));

describe('LibraryCard', () => {
    const lib = {
        label: {
            en: 'label',
            fr: 'label'
        },
        id: 'id'
    };

    const mocks = [
        {
            request: {
                query: getLang
            },
            result: {
                data: {
                    lang: 'fr'
                }
            }
        }
    ];

    test('should display id', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <LibraryCard lib={lib as ILibrary} active={true} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain('id');
    });
});
