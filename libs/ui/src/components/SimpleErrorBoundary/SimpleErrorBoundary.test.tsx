// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '../../_tests/testUtils';
import {SimpleErrorBoundary} from './SimpleErrorBoundary';

describe('SimpleErrorBoundary', () => {
    beforeAll(() => jest.spyOn(console, 'error').mockImplementation(jest.fn()));
    afterAll(() => (console.error as jest.Mock).mockRestore());

    const ComponentWithError = () => {
        throw new Error('boom!');
    };

    test('Display error message', async () => {
        render(
            <SimpleErrorBoundary>
                <ComponentWithError />
            </SimpleErrorBoundary>
        );

        expect(await screen.findByText(/boom/)).toBeInTheDocument();
    });
});
