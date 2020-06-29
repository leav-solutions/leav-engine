import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat, IAttribute} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import ListAttributes from './ListAttributes';

describe('ListAttribute', () => {
    test('Snapshot test', async () => {
        const attributesMock: IAttribute[] = [
            {
                id: 'test',
                type: 'test',
                format: AttributeFormat.text,
                label: {
                    fr: 'test',
                    en: 'test'
                }
            }
        ];

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ListAttributes
                        attributes={attributesMock}
                        attributeSelection={'test'}
                        changeSelected={jest.fn()}
                        useCheckbox={false}
                        attributesChecked={[{id: 'test'}]}
                        onCheckboxChange={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Attribute')).toHaveLength(1);
    });
});
