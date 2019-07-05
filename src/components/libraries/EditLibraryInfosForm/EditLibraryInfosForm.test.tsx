import {shallow} from 'enzyme';
import React from 'react';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes/globalTypes';
import {Mockify} from '../../../_types//Mockify';
import EditLibraryInfosForm from './EditLibraryInfosForm';

jest.mock('../../../utils/utils', () => ({
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
                permissions_conf: null
            }
        ]
    };
    const onSubmit = jest.fn();

    test('Render form for existing library', async () => {
        const comp = shallow(
            <EditLibraryInfosForm onSubmit={onSubmit} library={library as GET_LIBRARIES_libraries} readonly={false} />
        );
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(true);
    });

    test('Render form for new library', async () => {
        const comp = shallow(<EditLibraryInfosForm onSubmit={onSubmit} library={null} readonly={false} />);
        expect(comp.find('FormInput[name="id"]').props().disabled).toBe(false);
    });

    // TODO: uncomment when shallow works properly with hooks
    // test('Autofill ID with label on new lib', async () => {
    //     const comp = shallow(<EditLibraryInfosForm onSubmit={onSubmit} library={null} />);

    //     comp.find('FormInput[name="label/fr"]').simulate('change', null, {
    //         type: 'text',
    //         name: 'label/fr',
    //         value: 'labelfr'
    //     });

    //     expect(comp.find('FormInput[name="id"]').props().value).toBe('labelfr');
    // });

    test('Call submit function on submit', async () => {
        const comp = shallow(
            <EditLibraryInfosForm onSubmit={onSubmit} library={library as GET_LIBRARIES_libraries} readonly={false} />
        );
        comp.find('Form').simulate('submit');

        expect(onSubmit).toBeCalledWith(library);
    });
});
