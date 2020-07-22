import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import Attribute from './Attribute';

jest.mock(
    '../ListItemAttribute',
    () =>
        function ListItemAttribute() {
            return <>ListItemAttribute</>;
        }
);

jest.mock(
    '../ListItemAttributeLink',
    () =>
        function ListItemAttributeLink() {
            return <>ListItemAttributeLink</>;
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

    test('should call ListItemAttribute', async () => {
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

        expect(comp.find('ListItemAttribute')).toHaveLength(1);
    });

    test('should call ListItemAttributeLink', async () => {
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

        expect(comp.find('ListItemAttributeLink')).toHaveLength(1);
    });
});
