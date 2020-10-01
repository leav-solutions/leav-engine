import {wait} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {saveFormQuery} from '../../../../../../../../queries/forms/saveFormMutation';
import {SAVE_FORMVariables} from '../../../../../../../../_gqlTypes/SAVE_FORM';
import {mockFormFull} from '../../../../../../../../__mocks__/forms';
import MockedProviderWithFragments from '../../../../../../../../__mocks__/MockedProviderWithFragments';
import {formData, formDataWithTypename} from '../ContentTab/formBuilderReducer/_fixtures/fixtures';
import InfosTab from './InfosTab';

jest.mock('./InfosForm', () => {
    return function InfosForm() {
        return <div>InfosForm</div>;
    };
});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
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
        const comp = shallow(<InfosTab library="ubs" form={formData} />);

        expect(comp.find('InfosForm')).toHaveLength(1);
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
                <InfosTab library="test_lib" form={mockFormFull} readonly={false} />
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
