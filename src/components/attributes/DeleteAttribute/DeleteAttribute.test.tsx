import {render} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {Mockify} from '../../../_types//Mockify';
import DeleteAttribute from './DeleteAttribute';

describe('DeleteAttribute', () => {
    test('Snapshot test', async () => {
        const attr: Mockify<GET_ATTRIBUTES_attributes> = {
            label: null,
            system: true
        };

        const comp = render(
            <MockedProvider>
                <DeleteAttribute attribute={attr as GET_ATTRIBUTES_attributes} />
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
