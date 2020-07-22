import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttributesChecked} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import ListItemAttributeLink from './ListItemAttributeLink';

describe('ListItemAttributeLink', () => {
    test('Snapshot test', async () => {
        const mockAttribute = {
            id: 'test',
            library: 'test_library',
            type: AttributeType.simple,
            label: {
                fr: 'test',
                en: 'test'
            },
            isLink: false,
            isMultiple: false,
            linkedLibrary: 'test_linked_library'
        };

        const mockAttributeChecked: IAttributesChecked = {
            id: 'test',
            library: 'test_library',
            depth: 0,
            checked: true
        };

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ListItemAttributeLink
                        stateListAttribute={{...ListAttributeInitialState, useCheckbox: true}}
                        dispatchListAttribute={jest.fn()}
                        attribute={mockAttribute}
                        depth={0}
                        itemClick={jest.fn()}
                        attributeChecked={mockAttributeChecked}
                        handleCheckboxChange={jest.fn()}
                        handleRadioChange={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Checkbox')).toHaveLength(1);
    });
});
