// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import {wait} from 'utils/testUtils';
import {act, render, screen} from '_tests/testUtils';
import {saveFormQuery} from '../../../../../../../../queries/forms/saveFormMutation';
import {SAVE_FORMVariables} from '../../../../../../../../_gqlTypes/SAVE_FORM';
import {mockFormFull} from '../../../../../../../../__mocks__/forms';
import MockedProviderWithFragments from '../../../../../../../../__mocks__/MockedProviderWithFragments';
import {EditFormContext} from '../../hooks/useEditFormContext';
import {formDataWithTypename} from '../ContentTab/formBuilderReducer/_fixtures/fixtures';
import InfosTab from './InfosTab';

jest.mock('./InfosForm', () => function InfosForm() {
        return <div>InfosForm</div>;
    });

jest.mock('react-router-dom-v5', () => ({
    ...jest.requireActual('react-router-dom-v5'),
    useLocation: () => ({pathname: '/libraries/edit/products#forms'})
}));

describe('InfosTab', () => {
    const variables: SAVE_FORMVariables = {
        formData: {
            id: 'test_form',
            library: 'test_lib',
            label: {fr: 'Test form'},
            dependencyAttributes: ['test_attr']
        }
    };

    test('Render form', async () => {
        await act(async () => {
            render(<InfosTab />);
        });

        expect(screen.getByText('InfosForm')).toBeInTheDocument();
    });

    test('Save data on submit', async () => {
        let saveQueryCalled = false;
        const mocks = [
            {
                request: {
                    query: saveFormQuery,
                    variables
                },
                result: () => {
                    saveQueryCalled = true;
                    return {
                        data: {
                            saveForm: formDataWithTypename
                        }
                    };
                }
            }
        ];
        const comp = mount(
            <MockedProviderWithFragments mocks={mocks} addTypename>
                <EditFormContext.Provider
                    value={{form: mockFormFull, library: 'test_lib', readonly: false, setForm: jest.fn()}}
                >
                    <InfosTab />
                </EditFormContext.Provider>
            </MockedProviderWithFragments>
        );
        const submitFunc: any = comp.find('InfosForm').prop('onSubmit');

        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({
                    id: 'test_form',
                    library: 'test_lib',
                    label: {fr: 'Test form'},
                    dependencyAttributes: ['test_attr']
                });
                await wait(0);
            });
        }

        expect(saveQueryCalled).toBe(true);
    });
});
