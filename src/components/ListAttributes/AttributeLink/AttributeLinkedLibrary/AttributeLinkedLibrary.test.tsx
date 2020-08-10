import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType, IAttribute, ILabel} from '../../../../_types/types';
import {ListAttributeInitialState} from '../../ListAttributesReducer';
import AttributeLinkedLibrary from './AttributeLinkedLibrary';

describe('AttributeLinkedLibrary', () => {
    const mockAttribute: IAttribute = {
        id: 'test',
        library: 'testLib',
        type: AttributeType.simple_link,
        label: {fr: 'testLabel', en: 'testLabel'},
        isLink: false,
        isMultiple: false,
        linkedTree: 'testLinkedTree'
    };

    test('should contain mockAttribute label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <AttributeLinkedLibrary
                    attribute={mockAttribute}
                    changeCurrentAccordion={jest.fn()}
                    stateListAttribute={{...ListAttributeInitialState, lang: ['fr', 'fr']}}
                    dispatchListAttribute={jest.fn()}
                    depth={0}
                    isChecked={false}
                />
            );
        });

        expect(comp.text()).toContain((mockAttribute.label as ILabel).fr);
    });
});
