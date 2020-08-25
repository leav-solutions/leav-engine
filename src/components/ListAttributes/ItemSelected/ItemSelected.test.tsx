import {render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttributesChecked} from '../../../_types/types';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import ItemSelected from './ItemSelected';

describe('ItemSelected', () => {
    const mockAttributeChecked: IAttributesChecked = {
        id: 'id',
        library: 'lib',
        label: {
            fr: 'label',
            en: 'label'
        },
        type: AttributeType.simple,
        depth: 0,
        checked: false
    };

    test('should display id', async () => {
        let comp: any;

        await act(async () => {
            comp = render(
                <ItemSelected
                    attributeChecked={mockAttributeChecked}
                    removeAttributeChecked={jest.fn()}
                    stateListAttribute={ListAttributeInitialState}
                />
            );
        });

        expect(comp.text()).toContain('id');
    });
});
