import {mount} from 'enzyme';
import React from 'react';
import {AttributeType} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import AttributeExtends from './AttributeExtends';

describe('AttributeExtends', () => {
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

    test('Snapshot test', async () => {
        const comp = mount(
            <AttributeExtends
                stateListAttribute={ListAttributeInitialState}
                dispatchListAttribute={jest.fn()}
                attribute={mockAttribute}
                handleCheckboxChange={jest.fn()}
                handleRadioChange={jest.fn()}
            />
        );

        expect(comp.find('ListItem')).toHaveLength(1);
    });
});
