// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen, within} from '_tests/testUtils';
import {mockAttrSimple} from '__mocks__/attributes';
import {mockLibrary} from '__mocks__/libraries';
import EditLibraryTabs from '.';
import {
    GET_LIB_BY_ID_libraries_list,
    GET_LIB_BY_ID_libraries_list_attributes
} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {Mockify} from '../../../../_types/Mockify';

jest.mock('../../../../hooks/useUserData', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        id: 1,
        name: 'Test',
        permissions: {admin_access_forms: true}
    }))
}));

jest.mock('./InfosTab', () => function InfosTab() {
        return <div>InfosTab</div>;
    });
jest.mock('./PermissionsTab', () => function PermissionsTab() {
        return <div>PermissionsTab</div>;
    });
jest.mock('./AttributesTab', () => function AttributesTab() {
        return <div>AttributesTab</div>;
    });
jest.mock('./FormsTab', () => function FormsTab() {
        return <div>FormsTab</div>;
    });

describe('EditLibraryForm', () => {
    const attributes: Mockify<GET_LIB_BY_ID_libraries_list_attributes[]> = [
        {
            ...mockAttrSimple,
            id: 'test_attr',
            label: {fr: 'Test', en: 'Test'},
            description: {fr: 'Test', en: 'Test'}
        }
    ];

    const library: Mockify<GET_LIB_BY_ID_libraries_list> = {
        ...mockLibrary,
        id: 'test',
        label: {fr: 'Test', en: null},
        system: false,
        attributes: attributes as GET_LIB_BY_ID_libraries_list_attributes[],
        recordIdentityConf: {label: null, color: null, preview: null, treeColorPreview: null}
    };

    beforeAll(() => {
        jest.mock('../../../../utils/utils', () => ({
            formatIDString: jest.fn().mockImplementation(s => s),
            localizedLabel: jest.fn().mockImplementation(l => l.fr)
        }));
    });

    afterAll(() => {
        jest.unmock('../../../../utils/utils');
    });

    beforeEach(() => jest.clearAllMocks());

    test('Render tabs for existing lib', async () => {
        render(<EditLibraryTabs library={library as GET_LIB_BY_ID_libraries_list} readOnly={false} />);

        const header = screen.getByRole('heading');

        expect(within(header).getByText('Test')).toBeInTheDocument();

        expect(screen.getByText(/forms/)).toBeInTheDocument();
        expect(screen.getByText(/information/)).toBeInTheDocument();
        expect(screen.getByText(/permissions/)).toBeInTheDocument();
        expect(screen.getByText(/attributes/)).toBeInTheDocument();
    });

    test('Render tabs for new lib', async () => {
        render(<EditLibraryTabs library={null} readOnly={false} />);

        const header = screen.getByRole('heading');

        expect(within(header).getByText('libraries.new')).toBeInTheDocument();
    });

    test('Should open the tab in anchor', async () => {
        render(<EditLibraryTabs library={library as GET_LIB_BY_ID_libraries_list} readOnly={false} />, {
            routerProps: {
                initialEntries: ['/libraries/edit/' + library.id + '#permissions']
            }
        });

        expect(screen.getByText('PermissionsTab')).toBeInTheDocument();
    });
});
