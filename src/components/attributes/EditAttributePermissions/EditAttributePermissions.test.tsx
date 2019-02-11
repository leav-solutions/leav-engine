import {render} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import EditAttributePermissions from './EditAttributePermissions';

describe('EditAttributePermissions', () => {
    test('Snapshot test', async () => {
        const attr = {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null},
            linked_tree: null,
            permissionsConf: null
        };
        const onSubmit = jest.fn();

        const comp = render(
            <MockedProvider>
                <EditAttributePermissions attribute={attr} onSubmitSettings={onSubmit} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
