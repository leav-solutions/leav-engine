import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttribute} from '../../../../_types/types';
import {ListAttributeInitialState} from '../../ListAttributesReducer';
import AttributeLinkedLibrary from './AttributeLinkedLibrary';

describe('AttributeLinkedLibrary', () => {
    const mockAttribute: IAttribute = {
        id: 'test',
        library: 'testLib',
        type: AttributeType.tree,
        label: 'testLabel',
        isLink: false,
        isMultiple: false,
        linkedTree: 'testLinkedTree'
    };
    test('Snapshot test', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <AttributeLinkedLibrary
                    attribute={mockAttribute}
                    changeCurrentAccordion={jest.fn()}
                    stateListAttribute={ListAttributeInitialState}
                    dispatchListAttribute={jest.fn()}
                    depth={0}
                    isChecked={false}
                />
            );
        });

        expect(comp).toMatchSnapshot();
    });
});
