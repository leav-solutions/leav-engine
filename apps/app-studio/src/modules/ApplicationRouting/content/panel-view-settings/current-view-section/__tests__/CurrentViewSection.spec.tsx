import {useReducer} from 'react';
import userEvent from '@testing-library/user-event';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import {ViewV2Shortcut, ViewV2Types} from '../../../../../../__generated__';
import {CurrentViewContext} from '../../store-current-view/CurrentViewContext';
import {currentViewReducer} from '../../store-current-view/currentViewReducer';
import {type CurrentView} from '../../store-current-view/_types';
import {CurrentViewSection} from '../CurrentViewSection';

type NonNullView = NonNullable<CurrentView>;

const mockSave = jest.fn();
const mockSaveAs = jest.fn();
const mockToggleShared = jest.fn();

jest.mock('../useCurrentViewActions', () => ({
    useCurrentViewActions: () => ({
        save: mockSave,
        saveAs: mockSaveAs,
        toggleShared: mockToggleShared,
        saveLoading: false,
        saveAsLoading: false,
        shareLoading: false,
    }),
}));

const CURRENT_VIEW_TRANSLATION_PREFIX = 'view_settings.current_view';

const makeView = (overrides: Partial<NonNullView> = {}): NonNullView => ({
    id: 'view-1',
    library: 'my_lib',
    label: {fr: 'Ma vue'},
    shared: false,
    created_by: {id: '123', whoAmI: {id: '123', label: 'Moi'}},
    display: {type: ViewV2Types.list, attributes: []},
    sorts: [],
    shortcuts: [ViewV2Shortcut.display],
    ...overrides,
});

const nonOwner = {id: '999', whoAmI: {id: '999', label: 'Alice'}};

const onClose = jest.fn();

const Harness = ({
    view,
    savedView,
    isEmptyView = false,
    canEditAdminView = false,
}: {
    view: CurrentView;
    savedView: CurrentView;
    isEmptyView?: boolean;
    canEditAdminView?: boolean;
}) => {
    const [state, dispatch] = useReducer(currentViewReducer, {view, savedView});
    return (
        <CurrentViewContext.Provider value={{...state, isEmptyView, dispatch}}>
            <CurrentViewSection onViewSettingsClose={onClose} canEditAdminView={canEditAdminView} />
        </CurrentViewContext.Provider>
    );
};

const renderSection = (opts: {
    view: CurrentView;
    savedView?: CurrentView;
    isEmptyView?: boolean;
    canEditAdminView?: boolean;
}) =>
    render(
        <Harness
            view={opts.view}
            savedView={opts.savedView ?? opts.view}
            isEmptyView={opts.isEmptyView}
            canEditAdminView={opts.canEditAdminView}
        />,
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

    describe('empty (default) view state', () => {
        it('renders the header with a read-only "default view" label and the close button', async () => {
            renderSection({view: null, savedView: null, isEmptyView: true});

            expect(screen.getByText(`${CURRENT_VIEW_TRANSLATION_PREFIX}.title`)).toBeInTheDocument();

            const input = screen.getByRole('textbox');
            expect(input).toHaveValue(`${CURRENT_VIEW_TRANSLATION_PREFIX}.default_view_label`);
            expect(input).toBeDisabled();

            await act(async () => {
                await user.click(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.close`}));
            });
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('exposes no CRUD action for a non-admin (save/save_as/reset/delete)', () => {
            renderSection({view: null, savedView: null, isEmptyView: true});

            for (const action of ['save', 'save_as', 'reset', 'delete']) {
                expect(
                    screen.queryByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.${action}`}),
                ).not.toBeInTheDocument();
            }
        });
    });

    describe('empty (default) view state — admin', () => {
        // The store seeds a synthetic editable draft for the admin; isEmptyView stays true.
        const draft = makeView({label: {}});

        it('exposes only "save as" and "reset", not save/delete/share', () => {
            renderSection({view: draft, savedView: draft, isEmptyView: true, canEditAdminView: true});

            expect(
                screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save_as`}),
            ).toBeInTheDocument();
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.reset`})).toBeInTheDocument();

            expect(
                screen.queryByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save`}),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.delete`}),
            ).not.toBeInTheDocument();
            expect(screen.queryByRole('switch')).not.toBeInTheDocument();
        });

        it('disables "reset" while the draft is pristine (not dirty)', () => {
            renderSection({view: draft, savedView: draft, isEmptyView: true, canEditAdminView: true});
            expect(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.reset`})).toBeDisabled();
        });
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
            expect(screen.getByText(`${CURRENT_VIEW_TRANSLATION_PREFIX}.label_required`)).toBeInTheDocument();
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

    describe('save as', () => {
        it('opens the save-as modal and saves with the trimmed name', async () => {
            renderSection({view: makeView()});

            await act(async () => {
                await user.click(screen.getByRole('button', {name: `${CURRENT_VIEW_TRANSLATION_PREFIX}.save_as`}));
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
            expect(mockSaveAs).toHaveBeenCalledWith('Ma copie');
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
            expect(screen.getByText(/current_view\.shared_by\|Alice/)).toBeInTheDocument();
            expect(screen.queryByRole('switch')).not.toBeInTheDocument();
        });
    });
});
