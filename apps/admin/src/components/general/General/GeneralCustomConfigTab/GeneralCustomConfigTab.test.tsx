import {render, screen, waitFor} from '../../../../_tests/testUtils';
import GeneralCustomConfigTab from './GeneralCustomConfigTab';
import {GetGlobalSettingsDocument} from '../../../../_gqlTypes';

vi.mock('jsoneditor-react', () => ({
    JsonEditor() {
        return <div>JsonEditor</div>;
    },
}));

describe('GeneralCustomConfigTab', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: GetGlobalSettingsDocument,
                },
                result: {
                    loading: false,
                    data: {
                        globalSettings: {
                            settings: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            },
        ];
        render(<GeneralCustomConfigTab />, {
            apolloMocks: mocks,
        });
        expect(screen.getByText('admin.loading')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('JsonEditor')).toBeInTheDocument());
    });
});
