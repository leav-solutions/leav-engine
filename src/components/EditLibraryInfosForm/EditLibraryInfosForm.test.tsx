import * as React from 'react';
import {create} from 'react-test-renderer';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import EditLibraryInfosForm from './EditLibraryInfosForm';

describe('EditLibraryInfosForm', () => {
    test('Snapshot test', async () => {
        const library = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: false,
            attributes: [
                {
                    id: 'test_attr',
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    system: false,
                    label: {fr: 'Test', en: 'Test'}
                }
            ]
        };
        const onSubmit = jest.fn();
        const comp = create(<EditLibraryInfosForm onSubmit={onSubmit} library={library} />);

        expect(comp).toMatchSnapshot();
    });
});
