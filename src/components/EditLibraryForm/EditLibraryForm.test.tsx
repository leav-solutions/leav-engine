import * as React from 'react';
import {create} from 'react-test-renderer';
import EditLibraryForm from './EditLibraryForm';

describe('EditLibraryForm', () => {
    test('Render form', async () => {
        const library = {id: 'test', label: {fr: 'Test', en: null}, system: false};
        const onSubmit = () => null;

        const comp = create(<EditLibraryForm library={library} onSubmit={onSubmit} />);

        expect(comp).toMatchSnapshot();
    });
});
