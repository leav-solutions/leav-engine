import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttribute, ILabel} from '../../../../_types/types';
import {ListAttributeInitialState} from '../../ListAttributesReducer';
import AttributeLinkedTree from './AttributeLinkedTree';

describe('AttributeLinkedTree', () => {
    const mockAttribute: IAttribute = {
        id: 'test',
        library: 'testLib',
        type: AttributeType.tree,
        label: {fr: 'testLabel', en: 'testLabel'},
        isLink: false,
        isMultiple: false,
        linkedTree: 'testLinkedTree'
    };

    test('should contain label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <AttributeLinkedTree
                    attribute={mockAttribute}
                    changeCurrentAccordion={jest.fn()}
                    stateListAttribute={{...ListAttributeInitialState, lang: ['fr']}}
                    dispatchListAttribute={jest.fn()}
                    depth={0}
                    isChecked={true}
                />
            );
        });

        expect(comp.text()).toContain((mockAttribute.label as ILabel).fr);
    });
});
