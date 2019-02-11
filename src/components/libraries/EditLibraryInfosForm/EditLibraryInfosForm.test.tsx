import {shallow} from 'enzyme';
import * as React from 'react';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import {Mockify} from 'src/_types/Mockify';
import EditLibraryInfosForm from './EditLibraryInfosForm';

jest.mock('src/utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

describe('EditLibraryInfosForm', () => {
    const library: Mockify<GET_LIBRARIES_libraries> = {
        id: 'test',
        label: {fr: 'Test', en: null},
        system: false,
        attributes: [
            {
                id: 'test_attr',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test', en: 'Test'},
                linked_tree: null,
                permissionsConf: null
            }
        ]
    };
    const onSubmit = jest.fn();

    test('Render form for existing library', async () => {
        const comp = shallow(<EditLibraryInfosForm onSubmit={onSubmit} library={library as GET_LIBRARIES_libraries} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new library', async () => {
        const comp = shallow(<EditLibraryInfosForm onSubmit={onSubmit} library={null} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });

    test('Autofill ID with label on new lib', async () => {
        const comp = shallow(<EditLibraryInfosForm onSubmit={onSubmit} library={null} />);

        comp.find('FormInput[name="label/fr"]').simulate('change', null, {
            type: 'text',
            name: 'label/fr',
            value: 'labelfr'
        });

        expect(comp.find('FormInput[name="id"]').props().value).toBe('labelfr');
    });

    test('Call submit function on submit', async () => {
        const comp = shallow(<EditLibraryInfosForm onSubmit={onSubmit} library={library as GET_LIBRARIES_libraries} />);
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalledWith(library);
    });
});
