import {render, screen} from '_ui/_tests/testUtils';
import {ViewV2Types} from '../../../../../../__generated__';
import {CurrentViewContext} from '../../store-current-view/CurrentViewContext';
import {type CurrentView} from '../../store-current-view/_types';
import {CurrentViewSection} from '../CurrentViewSection';

type NonNullState = NonNullable<CurrentView>;

const renderWithView = (view: Partial<NonNullState> = {}) =>
    render(
        <CurrentViewContext.Provider
            value={{
                view: {
                    id: 'view-1',
                    label: null,
                    shared: false,
                    display: {type: ViewV2Types.list, attributes: []},
                    ...view,
                },
                dispatch: jest.fn(),
            }}
        >
            <CurrentViewSection onViewSettingsClose={jest.fn()} />
        </CurrentViewContext.Provider>,
    );

describe('CurrentViewSection', () => {
    it('should display the current view label in the input', () => {
        renderWithView({label: {fr: 'Catalogue produits', en: 'Catalogue produits'}});

        expect(screen.getByDisplayValue('Catalogue produits')).toBeVisible();
    });

    it('reflects the shared flag on the (disabled) switch', () => {
        renderWithView({shared: true});

        const sharedSwitch = screen.getByRole('switch');
        expect(sharedSwitch).toBeChecked();
        expect(sharedSwitch).toBeDisabled();
    });
});
