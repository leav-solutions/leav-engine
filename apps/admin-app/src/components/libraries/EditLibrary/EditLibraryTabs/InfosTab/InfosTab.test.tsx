// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {wait} from 'utils/testUtils';
import {act, render, screen} from '_tests/testUtils';
import {saveLibQuery} from '../../../../../queries/libraries/saveLibMutation';
import {Mockify} from '../../../../../_types/Mockify';
import {mockLibrary} from '../../../../../__mocks__/libraries';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import InfosTab from './InfosTab';

jest.mock('../../../../../hooks/useLang');

jest.mock(
    './InfosForm',
    () =>
        function InfosForm() {
            return <div>InfosForm</div>;
        }
);
describe('InfosTab', () => {
    const variables = {
        libData: {
            id: 'products',
            label: {fr: 'Produits', en: 'Products'},
            behavior: 'standard',
            recordIdentityConf: null,
            defaultView: null,
            fullTextAttributes: []
        }
    };

    const mockHistory: Mockify<History> = {
        replace: jest.fn()
    };

    test('Render form', async () => {
        await act(async () => {
            render(<InfosTab library={mockLibrary} readonly={false} history={mockHistory as History} />);
        });

        expect(screen.getByText('InfosForm')).toBeInTheDocument();
    });

    test('Save data on submit', async () => {
        let saveQueryCalled = false;
        const mocks = [
            {
                request: {
                    query: saveLibQuery,
                    variables
                },
                result: () => {
                    saveQueryCalled = true;
                    return {
                        data: {
                            saveLibrary: {
                                ...mockLibrary,
                                __typename: 'Library'
                            }
                        }
                    };
                }
            }
        ];

        const comp = mount(
            <MockedProviderWithFragments mocks={mocks} addTypename>
                <InfosTab library={mockLibrary} readonly={false} history={mockHistory as History} />
            </MockedProviderWithFragments>
        );
        const submitFunc: any = comp.find('InfosForm').prop('onSubmit');

        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...mockLibrary});
                await wait(0);
            });
        }

        expect(saveQueryCalled).toBe(true);
    });

    test('Pass saving errors to form', async () => {
        const mocksError = [
            {
                request: {
                    query: saveLibQuery,
                    variables
                },
                result: {
                    errors: [
                        {
                            message: 'Error',
                            extensions: {
                                code: 'VALIDATION_ERROR',
                                fields: {id: 'invalid id'}
                            },
                            locations: null,
                            path: null,
                            nodes: null,
                            source: null,
                            positions: null,
                            originalError: null,
                            name: 'Error'
                        }
                    ]
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocksError} addTypename>
                    <InfosTab library={mockLibrary} readonly={false} history={mockHistory as History} />
                </MockedProviderWithFragments>
            );
        });
        const submitFunc: any = comp.find('InfosForm').prop('onSubmit');

        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...mockLibrary});
                await wait(0);
            });

            await act(async () => {
                comp.update();
            });
        }

        expect(comp.find('InfosForm').prop('errors')).not.toBe(null);
    });
});
