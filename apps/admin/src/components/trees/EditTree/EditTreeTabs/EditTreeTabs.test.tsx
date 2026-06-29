import {render, screen} from '../../../../_tests/testUtils';
import {mockTree} from '../../../../__mocks__/trees';
import EditTreeTabs from './EditTreeTabs';

vi.mock('../../../../hooks/useLang');

vi.mock('./InfosTab', () => ({
    default: function TreeInfosTab() {
        return <div>TreeInfosTab</div>;
    },
}));

vi.mock('./PermissionsTab', () => ({
    default: function TreePermissionsTab() {
        return <div>TreePermissionsTab</div>;
    },
}));

vi.mock('./CustomConfigTab', () => ({
    default: function CustomConfigTab() {
        return <div>CustomConfigTab</div>;
    },
}));

vi.mock('./TreeStructure', () => ({
    default: function TreeStructure() {
        return <div>TreeStructure</div>;
    },
}));

vi.mock('../../TreeExplorer', () => ({
    default: function TreeExplorer() {
        return <div>TreeExplorer</div>;
    },
}));

describe('EditTreeTabs', () => {
    test('Render test', async () => {
        render(<EditTreeTabs tree={mockTree} readonly={false} />);

        expect(screen.getByText(mockTree.label.fr)).toBeInTheDocument();
        expect(screen.getByText('trees.informations')).toBeInTheDocument();
        expect(screen.getByText('trees.structure')).toBeInTheDocument();
        expect(screen.getByText('trees.explorer')).toBeInTheDocument();
        expect(screen.getByText('trees.permissions')).toBeInTheDocument();
    });
});
