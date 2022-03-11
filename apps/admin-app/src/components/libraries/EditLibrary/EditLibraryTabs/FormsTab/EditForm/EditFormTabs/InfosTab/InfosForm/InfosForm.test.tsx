// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {create} from 'react-test-renderer';
import {act, render, screen} from '_tests/testUtils';
import InfosForm from '.';
import {mockFormFull} from '../../../../../../../../../__mocks__/forms';
import * as useEditFormContext from '../../../hooks/useEditFormContext';

jest.mock('hooks/useLang');

jest.mock('../../../../../../../../attributes/AttributeSelector', () => {
    return function AttributeSelector() {
        return <div>AttributeSelector</div>;
    };
});

describe('InfosForm', () => {
    const onSubmit = jest.fn();
    test('Render form for existing form', async () => {
        jest.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: mockFormFull,
            library: 'test_lib',
            readonly: false,
            setForm: jest.fn()
        }));

        await act(async () => {
            render(<InfosForm onSubmit={onSubmit} />);
        });

        expect(screen.getByRole('textbox', {name: 'id'})).toBeDisabled();
    });

    test('Render form for new form', async () => {
        jest.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: null,
            library: 'test_lib',
            readonly: false,
            setForm: jest.fn()
        }));
        const comp = shallow(<InfosForm onSubmit={onSubmit} />);

        expect(comp.find('Formik').shallow().find('[name="id"]').prop('disabled')).toBe(false);
    });

    test('Autofill ID with label on new form', async () => {
        jest.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: null,
            library: 'test_lib',
            readonly: false,
            setForm: jest.fn()
        }));

        const comp = create(<InfosForm onSubmit={onSubmit} />);

        act(() => {
            comp.root.findByProps({name: 'label.fr'}).props.onChange(null, {
                type: 'text',
                name: 'label.fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });
});
