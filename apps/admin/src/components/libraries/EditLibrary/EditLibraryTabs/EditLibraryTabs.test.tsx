import {render, screen, within} from '../../../../_tests/testUtils';
import {mockAttrSimple} from '../../../../__mocks__/attributes';
import {mockLibrary} from '../../../../__mocks__/libraries';
import EditLibraryTabs from '.';
import {
    type GET_LIB_BY_ID_libraries_list,
    type GET_LIB_BY_ID_libraries_list_attributes,
} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {type Mockify} from '../../../../_types/Mockify';

vi.mock('../../../../hooks/useUserData', () => ({
    __esModule: true,
    default: vi.fn(() => ({
        id: 1,
        name: 'Test',
        permissions: {admin_access_forms: true},
    })),
}));

vi.mock('./InfosTab', () => ({
    default: function InfosTab() {
        return <div>InfosTab</div>;
    },
}));
vi.mock('./PermissionsTab', () => ({
    default: function PermissionsTab() {
        return <div>PermissionsTab</div>;
    },
}));
vi.mock('./AttributesTab', () => ({
    default: function AttributesTab() {
        return <div>AttributesTab</div>;
    },
}));
vi.mock('./FormsTab', () => ({
    default: function FormsTab() {
        return <div>FormsTab</div>;
    },
}));

vi.mock('./CustomConfigTab', () => ({
    default: function CustomConfigTab() {
        return <div>CustomConfigTab</div>;
    },
}));

vi.mock('../../../../utils/utils', () => ({
    formatIDString: vi.fn().mockImplementation(s => s),
    localizedLabel: vi.fn().mockImplementation(l => l.fr),
}));

describe('EditLibraryForm', () => {
    const attributes: Mockify<GET_LIB_BY_ID_libraries_list_attributes[]> = [
        {
            ...mockAttrSimple,
            id: 'test_attr',
            label: {fr: 'Test', en: 'Test'},
            description: {fr: 'Test', en: 'Test'},
        },
    ];

    const library: Mockify<GET_LIB_BY_ID_libraries_list> = {
        ...mockLibrary,
        id: 'test',
        label: {fr: 'Test', en: null},
        system: false,
        attributes: attributes as GET_LIB_BY_ID_libraries_list_attributes[],
        recordIdentityConf: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            treeColorPreview: null,
            parentContext: null,
        },
    };

    beforeEach(() => vi.clearAllMocks());

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
                initialEntries: ['/libraries/edit/' + library.id + '#permissions'],
            },
        });

        expect(screen.getByText('PermissionsTab')).toBeInTheDocument();
    });
});
