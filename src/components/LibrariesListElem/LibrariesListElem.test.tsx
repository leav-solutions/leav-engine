import {shallow} from 'enzyme';
import * as React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {create} from 'react-test-renderer';
import {List} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';
import {Mockify} from '../../_types/Mockify';
import LibrariesListElem from './LibrariesListElem';

describe('LibrariesListElem', () => {
    const mockLib: Mockify<GET_LIBRARIES_libraries> = {
        id: 'test_lib',
        label: {
            fr: 'TEST',
            en: 'FR'
        }
    };

    test('Snapshot test', async () => {
        const comp = create(
            <Router>
                <LibrariesListElem library={mockLib as GET_LIBRARIES_libraries} />
            </Router>
        );

        expect(comp).toMatchSnapshot();
    });

    test('Render label', async () => {
        const mockLibFr = {
            ...mockLib,
            label: {
                fr: 'Test FR',
                en: 'Test EN'
            }
        };
        const shallowComp = shallow(<LibrariesListElem library={mockLibFr as GET_LIBRARIES_libraries} />);
        const listItem = shallowComp.find(List.Item).first();

        expect(listItem).toBeTruthy();
        expect(
            listItem
                .find(List.Header)
                .first()
                .props().children
        ).toEqual('Test FR');
    });

    test('Render fallback language label', async () => {
        const mockLibEn = {
            ...mockLib,
            label: {
                fr: null,
                en: 'Test EN'
            }
        };
        const shallowComp = shallow(<LibrariesListElem library={mockLibEn as GET_LIBRARIES_libraries} />);
        const listItem = shallowComp.find(List.Item).first();

        expect(
            listItem
                .find(List.Header)
                .first()
                .props().children
        ).toEqual('Test EN');
    });

    test('Render Id as label', async () => {
        const mockLibId = {
            ...mockLib,
            label: {
                fr: null,
                en: null
            }
        };
        const shallowComp = shallow(<LibrariesListElem library={mockLibId as GET_LIBRARIES_libraries} />);
        const listItem = shallowComp.find(List.Item).first();

        expect(
            listItem
                .find(List.Header)
                .first()
                .props().children
        ).toEqual('test_lib');
    });
});
