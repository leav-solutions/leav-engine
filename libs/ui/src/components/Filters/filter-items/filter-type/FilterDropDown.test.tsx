import {render, screen} from '_ui/_tests/testUtils';
import {FilterDropDown} from './FilterDropDown';
import {type UIFilter} from '../../_types';
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

// Mock the useSharedTranslation hook
jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn(),
}));

describe('FilterDropDown', () => {
    const mockFilter: UIFilter = {
        id: 'test',
        attribute: {
            id: 'test_filter',
            label: 'test filter',
            format: AttributeFormat.text,
            type: AttributeType.simple,
        },
        field: 'test',
        value: null,
        condition: RecordFilterCondition.CONTAINS,
    };

    // Mock translation function
    const mockT = jest.fn(key => key);

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup translation mock
        (useSharedTranslation as jest.Mock).mockReturnValue({
            t: mockT,
            i18n: {language: 'en'},
        });
    });

    test('should not show delete button when canRemove is false', async () => {
        render(<FilterDropDown filter={mockFilter} canRemove={false} canReset={true} />);

        expect(screen.queryByText('global.delete')).not.toBeInTheDocument();
    });

    test('should show delete button when enableConfigureView is true', async () => {
        render(<FilterDropDown filter={mockFilter} canRemove={true} canReset={true} />);

        expect(screen.getByText('global.delete')).toBeInTheDocument();
    });

    test('should not show reset button when canReset is false', async () => {
        render(<FilterDropDown filter={mockFilter} canRemove={true} canReset={false} />);

        expect(screen.queryByText('global.reset')).not.toBeInTheDocument();
    });

    test('should show reset button when canReset is true', async () => {
        render(<FilterDropDown filter={mockFilter} canRemove={true} canReset={true} />);

        expect(screen.getByText('global.reset')).toBeInTheDocument();
    });
});
