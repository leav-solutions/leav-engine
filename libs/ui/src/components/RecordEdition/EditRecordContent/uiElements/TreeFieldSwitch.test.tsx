import {vi} from 'vitest';
import {mockFormElementTree} from '_ui/__mocks__/common/form';
import {render, screen} from '_ui/_tests/testUtils';
import TreeFieldSwitch from './TreeFieldSwitch';

vi.mock('./TreeField', () => ({
    default: () => <div data-testid="tree-field-v1" />,
}));

vi.mock('./TreeFieldV2', () => ({
    default: () => <div data-testid="tree-field-v2" />,
}));

// Read at call time, so each test can set the flags before rendering
let mockTreeAttributeV2Flags = {loading: false, isFormV2Enabled: false, isModalV2Enabled: false};

vi.mock('_ui/hooks/useTreeAttributeV2Flags', () => ({
    useTreeAttributeV2Flags: () => mockTreeAttributeV2Flags,
}));

const _renderSwitch = () => render(<TreeFieldSwitch element={mockFormElementTree as any} />);

describe('TreeFieldSwitch', () => {
    test('Renders nothing while the flags are loading', () => {
        mockTreeAttributeV2Flags = {loading: true, isFormV2Enabled: false, isModalV2Enabled: false};
        _renderSwitch();

        expect(screen.queryByTestId('tree-field-v1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tree-field-v2')).not.toBeInTheDocument();
    });

    test('Renders the V1 field while both flags are off', () => {
        mockTreeAttributeV2Flags = {loading: false, isFormV2Enabled: false, isModalV2Enabled: false};
        _renderSwitch();

        expect(screen.getByTestId('tree-field-v1')).toBeInTheDocument();
        expect(screen.queryByTestId('tree-field-v2')).not.toBeInTheDocument();
    });

    test('Keeps the V1 field when only the modal flag is on', () => {
        mockTreeAttributeV2Flags = {loading: false, isFormV2Enabled: false, isModalV2Enabled: true};
        _renderSwitch();

        expect(screen.getByTestId('tree-field-v1')).toBeInTheDocument();
    });

    test('Renders the V2 field as soon as the form flag is on', () => {
        mockTreeAttributeV2Flags = {loading: false, isFormV2Enabled: true, isModalV2Enabled: false};
        _renderSwitch();

        expect(screen.getByTestId('tree-field-v2')).toBeInTheDocument();
        expect(screen.queryByTestId('tree-field-v1')).not.toBeInTheDocument();
    });

    test('Renders the V2 field with both flags on', () => {
        mockTreeAttributeV2Flags = {loading: false, isFormV2Enabled: true, isModalV2Enabled: true};
        _renderSwitch();

        expect(screen.getByTestId('tree-field-v2')).toBeInTheDocument();
    });
});
