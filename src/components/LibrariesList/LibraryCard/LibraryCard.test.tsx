import {Button} from 'antd';
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
    test('Card should have actions', async () => {
        const lib = {
            label: {}
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

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <LibraryCard lib={lib as ILibrary} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Button.Group)).toHaveLength(1);
    });
});
