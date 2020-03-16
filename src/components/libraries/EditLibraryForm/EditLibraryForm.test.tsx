import {shallow} from 'enzyme';
import {Location} from 'history';
import React from 'react';
import {GET_LIBRARIES_libraries_list, GET_LIBRARIES_libraries_list_attributes} from '../../../_gqlTypes/GET_LIBRARIES';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes/globalTypes';
import {Mockify} from '../../../_types//Mockify';
import EditLibraryForm from './EditLibraryForm';

describe('EditLibraryForm', () => {
    beforeAll(() => {
        jest.mock('../../../utils/utils', () => ({
            formatIDString: jest.fn().mockImplementation(s => s),
            localizedLabel: jest.fn().mockImplementation(l => l.fr)
        }));
    });

    afterAll(() => {
        jest.unmock('../../../utils/utils');
    });

    test('Render form for existing lib', async () => {
        const attributes: Mockify<GET_LIBRARIES_libraries_list_attributes[]> = [
            {
                id: 'test_attr',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                system: false,
                label: {fr: 'Test', en: 'Test'},
                linked_tree: null,
                permissions_conf: null,
                multiple_values: false,
                metadata_fields: null,
                versions_conf: null,
                linked_library: null
            }
        ];

        const library: Mockify<GET_LIBRARIES_libraries_list> = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: false,
            attributes: attributes as GET_LIBRARIES_libraries_list_attributes[],
            recordIdentityConf: {label: null, color: null, preview: null}
        };
        const onSubmit = jest.fn();

        const onCheckIdExists = async () => true;

        const comp = shallow(
            <EditLibraryForm
                library={library as GET_LIBRARIES_libraries_list}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onSubmit}
                onCheckIdExists={onCheckIdExists}
                readOnly={false}
            />
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test');
    });

    test('Render form for new lib', async () => {
        const onSubmit = jest.fn();
        const onCheckIdExists = async () => true;

        const comp = shallow(
            <EditLibraryForm
                library={null}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onSubmit}
                onCheckIdExists={onCheckIdExists}
                readOnly={false}
            />
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('libraries.new');
    });

    test('should open the tab in anchor', async () => {
        const tabName = 'permissions';
        const mockLocation: Mockify<Location> = {
            hash: '#' + tabName
        };

        const onSubmit = jest.fn();
        const onCheckIdExists = async () => true;

        const comp = shallow(
            <EditLibraryForm
                library={null}
                onSubmit={onSubmit}
                onPermsSettingsSubmit={onSubmit}
                onCheckIdExists={onCheckIdExists}
                readOnly={false}
                location={mockLocation as Location}
            />
        );

        const activeIndex: number = comp.find('Tab').prop('activeIndex');
        const panes: any[] = comp.find('Tab').prop('panes');

        expect(panes.findIndex(p => p.key === tabName)).toBe(activeIndex);
    });
});
