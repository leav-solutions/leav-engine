import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import {act} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {Mockify} from '../../../_types//Mockify';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import DeleteAttribute from './DeleteAttribute';

describe('DeleteAttribute', () => {
    test('Snapshot test', async () => {
        const attr: Mockify<GET_ATTRIBUTES_attributes_list> = {
            ...mockAttrSimple,
            system: true
        };

        let comp;
        act(() => {
            comp = render(
                <MockedProvider>
                    <DeleteAttribute attribute={attr as GET_ATTRIBUTES_attributes_list} />
                </MockedProvider>
            );
        });

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
