// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '_tests/testUtils';
import {mockVersionProfile} from '__mocks__/common/versionProfiles';
import VersionProfilesSelector from './VersionProfilesSelector';
import {GetVersionProfilesDocument} from '_gqlTypes';

describe('VersionProfilesSelector', () => {
    test('Can filter list and select a profile', async () => {
        const mocks = [
            {
                request: {
                    query: GetVersionProfilesDocument,
                    variables: {},
                },
                result: {
                    data: {
                        versionProfiles: {
                            list: [
                                {...mockVersionProfile, id: 'vpA', label: {fr: 'Profil A'}},
                                {...mockVersionProfile, id: 'vpB', label: {fr: 'Profil B'}},
                            ],
                        },
                    },
                },
            },
        ];

        const mockOnChange = jest.fn();
        render(<VersionProfilesSelector onChange={mockOnChange} clearable />, {apolloMocks: mocks});

        expect(screen.getByRole('combobox').className).toContain('loading');

        // Type in input to filter dropdown, click profile on list to select it
        await userEvent.type(await screen.findByRole('textbox'), 'A');
        await userEvent.click((await screen.findAllByText('Profil A'))[1]);

        expect(mockOnChange).toHaveBeenCalled();
    });
});
