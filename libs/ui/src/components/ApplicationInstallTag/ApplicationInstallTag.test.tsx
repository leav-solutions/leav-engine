// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import userEvent from '@testing-library/user-event';
import {ApplicationInstallStatus} from '../../_gqlTypes';
import {render, screen, waitFor} from '../../_tests/testUtils';
import {mockApplication} from '../../__mocks__/common/application';
import ApplicationInstallTag from './ApplicationInstallTag';

describe('ApplicationInstallTag', () => {
    test('Display install status and an icon', () => {
        render(
            <ApplicationInstallTag
                application={{...mockApplication, install: {status: ApplicationInstallStatus.RUNNING}}}
            />
        );

        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.getByText(/install_processing/)).toBeInTheDocument();
    });

    test('Can force displaying the tag even on success', async () => {
        render(
            <ApplicationInstallTag
                application={{...mockApplication, install: {status: ApplicationInstallStatus.SUCCESS}}}
                displaySuccessStatus
            />
        );

        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.getByText(/install_success/)).toBeInTheDocument();
    });

    test('Can click on tag', async () => {
        const onClick = jest.fn();
        render(
            <ApplicationInstallTag
                application={{...mockApplication, install: {status: ApplicationInstallStatus.SUCCESS}}}
                displaySuccessStatus
                onClick={onClick}
            />
        );

        userEvent.click(screen.getByText(/install_success/));

        await waitFor(() => expect(onClick).toHaveBeenCalled());
    });
});
