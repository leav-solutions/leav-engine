import {mount} from 'enzyme';
import React from 'react';
import {AttributeType} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import ListItemAttribute from './ListItemAttribute';

describe('ListItemAttribute', () => {
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
            isMultiple: false
        };

        const comp = mount(
            <ListItemAttribute
                attribute={mockAttribute}
                stateListAttribute={{...ListAttributeInitialState, useCheckbox: true}}
                dispatchListAttribute={jest.fn()}
                handleCheckboxChange={jest.fn()}
                handleRadioChange={jest.fn()}
            />
        );

        expect(comp.find('Checkbox')).toHaveLength(1);
    });
});
