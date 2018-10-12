import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {create} from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {Mockify} from 'src/_types/Mockify';
import DeleteAttribute from './DeleteAttribute';

describe('DeleteAttribute', () => {
    test('Snapshot test', async () => {
        const attr: Mockify<GET_ATTRIBUTES_attributes> = {
            label: null
        };
        const comp = create(
            <MockedProvider>
                <DeleteAttribute attribute={attr as GET_ATTRIBUTES_attributes} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
