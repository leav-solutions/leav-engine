// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import VersionsPanel from './VersionsPanel';

jest.mock('hooks/ActiveLibHook/ActiveLibHook');

jest.mock('components/shared/ValuesVersionConfigurator', () => {
    return function ValuesVersionConfigurator() {
        return <div>ValuesVersionConfigurator</div>;
    };
});

describe('VersionsPanel', () => {
    test('Render test', async () => {
        render(<VersionsPanel />);

        expect(await screen.findByText(/ValuesVersionConfigurator/i)).toBeInTheDocument();
    });
});
