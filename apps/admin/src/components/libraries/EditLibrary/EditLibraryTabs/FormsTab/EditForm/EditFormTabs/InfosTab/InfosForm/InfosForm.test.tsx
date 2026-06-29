import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../../../../../../../_tests/testUtils';
import InfosForm from '.';
import {mockFormFull} from '../../../../../../../../../__mocks__/forms';
import {EditFormModalButtonsContext} from '../../../../EditFormModal/EditFormModalButtonsContext';
import * as useEditFormContext from '../../../hooks/useEditFormContext';

vi.mock('../../../../../../../../../hooks/useLang');

vi.mock('../../../../../../../../attributes/AttributeSelector', () => ({
    default: function AttributeSelector() {
        return <div>AttributeSelector</div>;
    },
}));

describe('InfosForm', () => {
    const onSubmit = vi.fn();
    const editFormModalButtonContextValue = {buttons: {}, setButton: vi.fn(), removeButton: vi.fn()};
    test('Render form for existing form', async () => {
        vi.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: mockFormFull,
            library: 'test_lib',
            readonly: false,
            setForm: vi.fn(),
        }));

        render(
            <EditFormModalButtonsContext.Provider value={editFormModalButtonContextValue}>
                <InfosForm onSubmit={onSubmit} />
            </EditFormModalButtonsContext.Provider>,
        );

        expect(screen.getByRole('textbox', {name: 'id'})).toBeDisabled();
    });

    test('Render form for new form', async () => {
        vi.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: null,
            library: 'test_lib',
            readonly: false,
            setForm: vi.fn(),
        }));

        render(
            <EditFormModalButtonsContext.Provider value={editFormModalButtonContextValue}>
                <InfosForm onSubmit={onSubmit} />
            </EditFormModalButtonsContext.Provider>,
        );

        expect(screen.getByRole('textbox', {name: 'id'})).not.toBeDisabled();
    });

    test('Autofill ID with label on new form', async () => {
        vi.spyOn(useEditFormContext, 'useEditFormContext').mockImplementation(() => ({
            form: null,
            library: 'test_lib',
            readonly: false,
            setForm: vi.fn(),
        }));

        render(
            <EditFormModalButtonsContext.Provider value={editFormModalButtonContextValue}>
                <InfosForm onSubmit={onSubmit} />
            </EditFormModalButtonsContext.Provider>,
        );

        const labelInput = screen.getByRole('textbox', {name: 'label.fr'});
        await userEvent.type(labelInput, 'labelfr');

        expect(screen.getByRole('textbox', {name: 'id'})).toHaveValue('labelfr');
    });
});
