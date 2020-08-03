import {mount} from 'enzyme';
import React from 'react';
import {AttributeType} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import AttributeBasic from './AttributeBasic';

describe('AttributeBasic', () => {
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
            <AttributeBasic
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
