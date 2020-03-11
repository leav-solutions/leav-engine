import {MockedProvider} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {mockLibrary} from '../../../../__mocks__/libraries';
import MockedLangContextProvider from '../../../../__mocks__/MockedLangContextProvider';
import EditRecordFormContainer from './EditRecordFormContainer';

describe('EditRecordFormContainer', () => {
    test('Renders EditRecordForm', async () => {
        const comp = mount(
            <MockedLangContextProvider>
                <MockedProvider mocks={[]}>
                    <EditRecordFormContainer library={mockLibrary} />
                </MockedProvider>
            </MockedLangContextProvider>
        );
        expect(comp.find('EditRecordForm')).toHaveLength(1);
    });
});
