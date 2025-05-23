// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitFor} from '_tests/testUtils';
import GeneralCustomConfigTab from './GeneralCustomConfigTab';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';

jest.mock('jsoneditor-react', () => ({
    JsonEditor() {
        return <div>JsonEditor</div>;
    }
}));

describe('GeneralCustomConfigTab', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: getGlobalSettingsQuery
                },
                result: {
                    loading: false,
                    data: {
                        globalSettings: {
                            settings: {
                                foo: 'bar'
                            }
                        }
                    }
                }
            }
        ];
        render(<GeneralCustomConfigTab />, {
            apolloMocks: mocks
        });
        expect(screen.getByText('admin.loading')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('JsonEditor')).toBeInTheDocument());
    });
});
