// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import InfosForm from '.';
import {mockFormFull} from '../../../../../../../../../__mocks__/forms';
import {EditFormModalButtonsContext} from '../../../../EditFormModal/EditFormModalButtonsContext';
import * as useEditFormContext from '../../../hooks/useEditFormContext';

jest.mock('hooks/useLang');

jest.mock('../../../../../../../../attributes/AttributeSelector', () => function AttributeSelector() {
        return <div>AttributeSelector</div>;
    });

describe('InfosForm', () => {
    const onSubmit = jest.fn();
    const editFormModalButtonContextValue = {buttons: {}, setButton: jest.fn(), removeButton: jest.fn()};
    test('Render form for existing form', async () => {
        jest.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: mockFormFull,
            library: 'test_lib',
            readonly: false,
            setForm: jest.fn()
        }));

        render(
            <EditFormModalButtonsContext.Provider value={editFormModalButtonContextValue}>
                <InfosForm onSubmit={onSubmit} />
            </EditFormModalButtonsContext.Provider>
        );

        expect(screen.getByRole('textbox', {name: 'id'})).toBeDisabled();
    });

    test('Render form for new form', async () => {
        jest.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: null,
            library: 'test_lib',
            readonly: false,
            setForm: jest.fn()
        }));

        render(
            <EditFormModalButtonsContext.Provider value={editFormModalButtonContextValue}>
                <InfosForm onSubmit={onSubmit} />
            </EditFormModalButtonsContext.Provider>
        );

        expect(screen.getByRole('textbox', {name: 'id'})).not.toBeDisabled();
    });

    test('Autofill ID with label on new form', async () => {
        jest.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: null,
            library: 'test_lib',
            readonly: false,
            setForm: jest.fn()
        }));

        render(
            <EditFormModalButtonsContext.Provider value={editFormModalButtonContextValue}>
                <InfosForm onSubmit={onSubmit} />
            </EditFormModalButtonsContext.Provider>
        );

        const labelInput = screen.getByRole('textbox', {name: 'label.fr'});
        userEvent.type(labelInput, 'labelfr');

        expect(screen.getByRole('textbox', {name: 'id'})).toHaveValue('labelfr');
    });
});
