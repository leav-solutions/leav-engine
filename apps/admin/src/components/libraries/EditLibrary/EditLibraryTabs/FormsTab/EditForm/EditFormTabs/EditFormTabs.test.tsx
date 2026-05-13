import '@testing-library/jest-dom';
import {render, screen} from '../../../../../../../_tests/testUtils';
import {mockFormFull} from '../../../../../../../__mocks__/forms';
import {EditFormContext} from '../hooks/useEditFormContext';
import EditFormTabs from './EditFormTabs';

jest.mock(
    './InfosTab',
    () =>
        function InfosTab() {
            return <div>InfosTab</div>;
        },
);

jest.mock(
    './ContentTab',
    () =>
        function ContentTab() {
            return <div>ContentTab</div>;
        },
);

describe('EditFormTabs', () => {
    const mockForm = {...mockFormFull};

    test('Display form edition for existing form', async () => {
        render(
            <EditFormContext.Provider
                value={{form: mockForm, library: 'test_lib', readonly: false, setForm: jest.fn()}}
            >
                <EditFormTabs />
            </EditFormContext.Provider>,
        );

        expect(screen.getByTestId('header')).toHaveTextContent('Test Form');

        // Check number of panes
        expect(screen.getByText('forms.informations')).toBeInTheDocument();
        expect(screen.getByText('forms.content')).toBeInTheDocument();
    });

    test('Display form edition for new form', async () => {
        render(
            <EditFormContext.Provider value={{form: null, library: 'test_lib', readonly: false, setForm: jest.fn()}}>
                <EditFormTabs />
            </EditFormContext.Provider>,
        );

        expect(screen.getByTestId('header')).toHaveTextContent('forms.new');

        // Check number of panes
        expect(screen.getByText('forms.informations')).toBeInTheDocument();
        expect(screen.queryByText('forms.content')).not.toBeInTheDocument();
    });
});
