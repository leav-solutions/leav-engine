import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import AttributeLink from './AttributeLink';

jest.mock(
    './AttributeLinkedLibrary',
    () =>
        function AttributeLinkedLibrary() {
            return <div>AttributeLinkedLibrary</div>;
        }
);

jest.mock(
    './AttributeLinkedTree',
    () =>
        function AttributeLinkedTree() {
            return <div>AttributeLinkedTree</div>;
        }
);

describe('AttributeLink', () => {
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

    test('should call AttributeLinkedLibrary', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AttributeLink
                        attribute={mockAttribute}
                        stateListAttribute={{...ListAttributeInitialState, useCheckbox: true}}
                        dispatchListAttribute={jest.fn()}
                        depth={0}
                        type="library"
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AttributeLinkedLibrary')).toHaveLength(1);
    });

    test('should call AttributeLinkedTree', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AttributeLink
                        attribute={mockAttribute}
                        stateListAttribute={{...ListAttributeInitialState, useCheckbox: true}}
                        dispatchListAttribute={jest.fn()}
                        depth={0}
                        type="tree"
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AttributeLinkedTree')).toHaveLength(1);
    });
});
