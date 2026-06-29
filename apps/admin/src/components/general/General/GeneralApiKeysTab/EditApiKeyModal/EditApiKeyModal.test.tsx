import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../../../_tests/testUtils';
import {mockApiKey} from '../../../../../__mocks__/common/apiKeys';
import EditApiKeyModal from './EditApiKeyModal';
import {SaveApiKeyDocument} from '../../../../../_gqlTypes';

vi.mock('../../../../shared/RecordSelector', () => ({
    default: function RecordSelector() {
        return <div>RecordSelector</div>;
    },
}));

describe('EditApiKeyModal', () => {
    test('Render form', async () => {
        const saveApiKeyMock = {
            request: {query: SaveApiKeyDocument},
            result: {
                data: {
                    saveApiKey: {...mockApiKey, expiresAt: null},
                },
            },
        };

        render(<EditApiKeyModal apiKey={{...mockApiKey, expiresAt: null}} onClose={vi.fn()} />, {
            apolloMocks: [saveApiKeyMock],
        });

        expect(screen.getByText(mockApiKey.label)).toBeInTheDocument();
        expect(screen.getByText('RecordSelector')).toBeInTheDocument();
        expect(screen.getByText(/never/)).toBeInTheDocument();

        // Edit expiration date
        await userEvent.click(screen.getByText(/edit_expiration/));
        const customOption = await screen.findByText(/custom/);
        await userEvent.click(customOption);

        expect(screen.getByTestId('custom-date-input')).toBeInTheDocument();
    });
});
