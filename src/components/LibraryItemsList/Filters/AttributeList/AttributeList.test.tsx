import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {List} from 'semantic-ui-react';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import AttributeList from './AttributeList';

describe('AttributeList', () => {
    const libId = 'test';
    const libQueryName = 'test';

    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <AttributeList
                    libId={libId}
                    libQueryName={libQueryName}
                    setFilters={jest.fn()}
                    setShowAttr={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

    test('should have a List', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AttributeList
                        libId={libId}
                        libQueryName={libQueryName}
                        setFilters={jest.fn()}
                        setShowAttr={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(List)).toHaveLength(1);
    });
});
