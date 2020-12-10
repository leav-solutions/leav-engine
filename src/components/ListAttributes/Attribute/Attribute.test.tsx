// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat, AttributeType} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import Attribute from './Attribute';

jest.mock(
    '../AttributeBasic',
    () =>
        function AttributeBasic() {
            return <>AttributeBasic</>;
        }
);

jest.mock(
    '../AttributeLink',
    () =>
        function AttributeLink() {
            return <>AttributeLink</>;
        }
);

jest.mock(
    '../AttributeExtended',
    () =>
        function AttributeExtended() {
            return <>AttributeExtended</>;
        }
);

describe('Attribute', () => {
    const mockAttribute = {
        id: 'test',
        library: 'test_library',
        type: AttributeType.simple,
        label: {
            fr: 'test',
            en: 'test'
        },
        isLink: false,
        isMultiple: false
    };

    test('should call AttributeBasic', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <Attribute
                    stateListAttribute={ListAttributeInitialState}
                    dispatchListAttribute={jest.fn()}
                    attribute={mockAttribute}
                    depth={0}
                />
            );
        });

        expect(comp.find('AttributeBasic')).toHaveLength(1);
    });

    test('should call AttributeLink', async () => {
        const mockAttributeLinkedLibrary = {
            ...mockAttribute,
            linkedLibrary: 'test_linked_library'
        };

        let comp: any;

        await act(async () => {
            comp = mount(
                <Attribute
                    stateListAttribute={ListAttributeInitialState}
                    dispatchListAttribute={jest.fn()}
                    attribute={mockAttributeLinkedLibrary}
                    depth={0}
                />
            );
        });

        expect(comp.find('AttributeLink')).toHaveLength(1);
    });

    test('should call AttributeExtended', async () => {
        const mockAttributeLinkedLibrary = {
            ...mockAttribute,
            format: AttributeFormat.extended
        };

        let comp: any;

        await act(async () => {
            comp = mount(
                <Attribute
                    stateListAttribute={ListAttributeInitialState}
                    dispatchListAttribute={jest.fn()}
                    attribute={mockAttributeLinkedLibrary}
                    depth={0}
                />
            );
        });

        expect(comp.find('AttributeExtended')).toHaveLength(1);
    });
});
