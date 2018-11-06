import * as React from 'react';
import {create} from 'react-test-renderer';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import EditLibraryForm from './EditLibraryForm';

describe('EditLibraryForm', () => {
    test('Render form', async () => {
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
        const onSubmit = () => null;

        const comp = create(<EditLibraryForm library={library} onSubmit={onSubmit} />);

        expect(comp).toMatchSnapshot();
    });
});
