// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import VersionsPanel from './VersionsPanel';

jest.mock('_ui/components/ValuesVersionConfigurator', () => function ValuesVersionConfigurator() {
        return <div>ValuesVersionConfigurator</div>;
    });

describe('VersionsPanel', () => {
    test('Render test', async () => {
        render(
            <MockSearchContextProvider>
                <VersionsPanel />
            </MockSearchContextProvider>
        );

        expect(await screen.findByText(/ValuesVersionConfigurator/i)).toBeInTheDocument();
    });
});
