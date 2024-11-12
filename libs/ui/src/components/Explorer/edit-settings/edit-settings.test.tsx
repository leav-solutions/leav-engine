// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {FunctionComponent} from 'react';
import {EditSettingsContextProvider} from './EditSettingsContextProvider';
import {SidePanel} from './SidePanel';
import {useOpenSettings} from './useOpenSettings';

const [DisplayModeLabel] = ['DisplayMode Component'];

jest.mock('./DisplayMode', () => ({
    DisplayMode: () => <div>{DisplayModeLabel}</div>
}));

const MockOpenEditSettings: FunctionComponent = () => {
    const OpenEditSettingsButton = useOpenSettings();

    return <>{OpenEditSettingsButton}</>;
};

describe('Integration tests about edit settings feature', () => {
    test('should be open panel and navigate inside to advanced setting and go back', async () => {
        render(
            <EditSettingsContextProvider>
                <MockOpenEditSettings />
                <SidePanel />
            </EditSettingsContextProvider>
        );

        await userEvent.click(screen.getByRole('button', {name: 'explorer.settings'}));

        expect(screen.getByRole('heading', {name: 'explorer.view-configuration'})).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.display-mode'}));

        expect(screen.getByText(DisplayModeLabel)).toBeVisible();

        await userEvent.click(screen.getByRole('button', {name: 'explorer.back'}));

        expect(screen.getByRole('heading', {name: 'explorer.view-configuration'})).toBeVisible();
    });
});
