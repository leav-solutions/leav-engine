import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import {ViewV2Types} from '../../../../../../__generated__';
import {CurrentViewContext} from '../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../store-current-view/currentViewReducer';
import {type CurrentView} from '../../store-current-view/_types';
import {CurrentViewSection} from '../CurrentViewSection';

type NonNullView = NonNullable<CurrentView>;

const mockSave = jest.fn();
const mockFork = jest.fn();
const mockToggleShared = jest.fn();

jest.mock('../useCurrentViewActions', () => ({
    useCurrentViewActions: () => ({
        save: mockSave,
        fork: mockFork,
        toggleShared: mockToggleShared,
        saveLoading: false,
        forkLoading: false,
        shareLoading: false,
    }),
}));

const CURRENT_VIEW_TRANSLATION_PREFIX = 'view_settings.current-view';

const makeView = (overrides: Partial<NonNullView> = {}): NonNullView => ({
    id: 'view-1',
    library: 'my_lib',
    label: {fr: 'Ma vue'},
    shared: false,
    created_by: {id: '123', whoAmI: {id: '123', label: 'Moi'}},
    display: {type: ViewV2Types.list, attributes: []},
    ...overrides,
});

const nonOwner = {id: '999', whoAmI: {id: '999', label: 'Alice'}};

const onClose = jest.fn();

const Harness = ({
    view,
    savedView,
    canEditAdminView = false,
}: {
    view: CurrentView;
    savedView: CurrentView;
    canEditAdminView?: boolean;
}) => {
    const [state, dispatch] = useReducer(currentViewReducer, {view, savedView});
    return (
        <CurrentViewContext.Provider value={{...state, dispatch}}>
            <CurrentViewSection onViewSettingsClose={onClose} canEditAdminView={canEditAdminView} />
        </CurrentViewContext.Provider>
    );
};

const renderSection = (opts: {view: CurrentView; savedView?: CurrentView; canEditAdminView?: boolean}) =>
    render(
        <Harness view={opts.view} savedView={opts.savedView ?? opts.view} canEditAdminView={opts.canEditAdminView} />,
    );

beforeEach(() => {
    jest.clearAllMocks();
});

describe('CurrentViewSection', () => {
    const user = userEvent.setup();

    it('renders nothing when no view is loaded', () => {
        renderSection({view: null, savedView: null});
        expect(screen.queryByText(`${CURRENT_VIEW_TRANSLATION_PREFIX}.title`)).not.toBeInTheDocument();
    });

    it('renders the title and closes via the close button', async () => {
        renderSection({view: makeView()});

        expect(screen.getByText(`${CURRENT_VIEW_TRANSLATION_PREFIX}.title`)).toBeInTheDocument();
        await act(async () => {
            await user.click(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.close`}));
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe('label', () => {
        it('is editable for the owner and reverts visually on reset', async () => {
            // Seed dirty (view ≠ savedView) so Reset is enabled.
            renderSection({view: makeView({label: {fr: 'Édité'}}), savedView: makeView({label: {fr: 'Ma vue'}})});

            const input = screen.getByRole('textbox');
            expect(input).toHaveValue('Édité');

            await act(async () => {
                await user.click(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.reset`}));
            });
            expect(screen.getByRole('textbox')).toHaveValue('Ma vue');
        });

        it('shows the required error + helper when emptied', async () => {
            renderSection({view: makeView()});

            await act(async () => {
                await user.clear(screen.getByRole('textbox'));
            });
            expect(screen.getByText(`${CURRENT_VIEW_TRANSLATION_PREFIX}.label-required`)).toBeInTheDocument();
        });

        it('is read-only for a non-owner', () => {
            renderSection({view: makeView({created_by: nonOwner})});
            // The DS renders a read-only KitInput as a disabled input (wrapper class kit-input-readonly).
            expect(screen.getByRole('textbox')).toBeDisabled();
        });
    });

    describe('save button (owner only)', () => {
        it('is disabled when the view is not dirty', () => {
            renderSection({view: makeView()}); // view === savedView ⇒ not dirty
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save`})).toBeDisabled();
        });

        it('is disabled when dirty but the label is empty', () => {
            renderSection({view: makeView({label: {fr: '   '}}), savedView: makeView({label: {fr: 'Ma vue'}})});
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save`})).toBeDisabled();
        });

        it('is enabled when dirty with a label, and calls save on click', async () => {
            renderSection({view: makeView({label: {fr: 'Édité'}}), savedView: makeView({label: {fr: 'Ma vue'}})});

            const saveButton = screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save`});
            expect(saveButton).toBeEnabled();
            await act(async () => {
                await user.click(saveButton);
            });
            expect(mockSave).toHaveBeenCalledTimes(1);
        });

        it('is absent for a non-owner', () => {
            renderSection({view: makeView({created_by: nonOwner})});
            expect(
                screen.queryByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save`}),
            ).not.toBeInTheDocument();
        });
    });

    describe('reset button', () => {
        it('is disabled when the view is not dirty', () => {
            renderSection({view: makeView()});
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.reset`})).toBeDisabled();
        });

        it('is enabled when the view is dirty', () => {
            renderSection({view: makeView({label: {fr: 'Édité'}}), savedView: makeView({label: {fr: 'Ma vue'}})});
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.reset`})).toBeEnabled();
        });
    });

    describe('delete button (owner only)', () => {
        it('is present but always disabled (out of scope, LEAVC-934)', () => {
            renderSection({view: makeView()});
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.delete`})).toBeDisabled();
        });

        it('is absent for a non-owner', () => {
            renderSection({view: makeView({created_by: nonOwner})});
            expect(
                screen.queryByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.delete`}),
            ).not.toBeInTheDocument();
        });
    });

    describe('clone', () => {
        it('opens the fork modal and forks with the trimmed name', async () => {
            renderSection({view: makeView()});

            await act(async () => {
                await user.click(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.clone`}));
            });

            const dialog = screen.getByRole('dialog');
            const modalSave = within(dialog).getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save`});
            expect(modalSave).toBeDisabled();

            await act(async () => {
                await user.type(within(dialog).getByRole('textbox'), '  Ma copie  ');
            });
            expect(modalSave).toBeEnabled();

            await act(async () => {
                await user.click(modalSave);
            });
            expect(mockFork).toHaveBeenCalledWith('Ma copie');
        });
    });

    describe('share zone', () => {
        it('shows the share switch for an owner with admin rights and toggles it', async () => {
            renderSection({view: makeView({shared: false}), canEditAdminView: true});

            const shareSwitch = screen.getByRole('switch');
            expect(shareSwitch).not.toBeChecked();

            await act(async () => {
                await user.click(shareSwitch);
            });
            // KitSwitch onChange passes (checked, event).
            expect(mockToggleShared).toHaveBeenCalledWith(true, expect.anything());
        });

        it('hides the share switch for an owner without admin rights', () => {
            renderSection({view: makeView(), canEditAdminView: false});
            expect(screen.queryByRole('switch')).not.toBeInTheDocument();
        });

        it('shows "shared by" (with the creator display name) and no switch for a non-owner', () => {
            renderSection({view: makeView({created_by: nonOwner}), canEditAdminView: true});
            // libs/ui test i18n renders interpolated keys as `key|value` ⇒ asserts the name is passed.
            expect(screen.getByText(/current-view\.shared-by\|Alice/)).toBeInTheDocument();
            expect(screen.queryByRole('switch')).not.toBeInTheDocument();
        });
    });
});
