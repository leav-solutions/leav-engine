import {render, screen} from '../../_tests/testUtils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TopBar from './TopBar';

vi.mock('../HeaderInfo', () => ({
    default: function HeaderInfo() {
        return <div>HeaderInfo</div>;
    },
}));

describe('TopBar', () => {
    test('should display HeaderInfo', async () => {
        render(
            <MockedProviderWithFragments>
                <TopBar userPanelVisible={false} toggleUserPanelVisible={vi.fn()} nbNotifs={0} />
            </MockedProviderWithFragments>,
        );

        expect(screen.getByText('HeaderInfo')).toBeInTheDocument();
    });
});
