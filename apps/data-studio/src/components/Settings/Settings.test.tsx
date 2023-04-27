// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route} from 'react-router-dom';
import {render, screen} from '_tests/testUtils';
import Settings from './Settings';

jest.mock('./ApplicationSettings', () => {
    return function ApplicationSettings() {
        return <div>ApplicationSettings</div>;
    };
});

jest.mock('./LibrariesSettings', () => {
    return function LibrariesSettings() {
        return <div>LibrariesSettings</div>;
    };
});

jest.mock('./TreesSettings', () => {
    return function TreesSettings() {
        return <div>TreesSettings</div>;
    };
});

describe('Settings', () => {
    test('Render tabs for each sections', async () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        expect(screen.getByText('app_settings.application')).toBeInTheDocument();
        expect(screen.getByText('app_settings.libraries')).toBeInTheDocument();
        expect(screen.getByText('app_settings.trees')).toBeInTheDocument();

        expect(screen.getByText('ApplicationSettings')).toBeInTheDocument();

        userEvent.click(screen.getByText('app_settings.libraries'));
        expect(screen.getByText('LibrariesSettings')).toBeInTheDocument();

        userEvent.click(screen.getByText('app_settings.trees'));
        expect(screen.getByText('TreesSettings')).toBeInTheDocument();
    });

    test('Go to active tab passed in URL', async () => {
        render(
            <MemoryRouter initialEntries={['/settings/libraries']}>
                <Route exact path={'/settings/:tabId?'}>
                    <Settings />
                </Route>
            </MemoryRouter>
        );

        expect(screen.getByText('app_settings.application')).toBeInTheDocument();
        expect(screen.getByText('app_settings.libraries')).toBeInTheDocument();
        expect(screen.getByText('app_settings.trees')).toBeInTheDocument();

        expect(screen.getByText('LibrariesSettings')).toBeInTheDocument();
    });
});
