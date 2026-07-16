import {KitAlert} from 'aristid-ds';
import {act, renderHook} from '_ui/_tests/testUtils';
import * as generated from '../../../../../../__generated__';
import {RecordFilterCondition, SortOrder, ViewV2Shortcut, ViewV2Types} from '../../../../../../__generated__';
import {useCurrentViewActions} from '../useCurrentViewActions';

const mockUpdate = vi.fn();
const mockCreate = vi.fn();

const mockDispatch = vi.fn();
const mockSetShared = vi.fn();
let mockView: any;

vi.mock('../../store-current-view/useCurrentView', () => ({
    useCurrentView: () => ({view: mockView, dispatch: mockDispatch, setShared: mockSetShared}),
}));

const mockSaveLastUsedView = vi.fn();
vi.mock('../../tabs/tab-catalog/useLastUsedView', () => ({
    useLastUsedView: () => ({saveLastUsedView: mockSaveLastUsedView}),
}));

const mockOpenConfirmModal = vi.fn();
const mockDispatchPanelEvent = vi.fn();
vi.mock('@leav/ui', async () => ({
    ...(await vi.importActual('@leav/ui')),
    useConfirmModal: () => ({openConfirmModal: mockOpenConfirmModal}),
    usePanelEventHandlers: () => ({dispatch: mockDispatchPanelEvent}),
}));

const mockWriteQuery = vi.fn();
vi.mock('@apollo/client', async () => ({
    ...(await vi.importActual('@apollo/client')),
    useApolloClient: () => ({writeQuery: mockWriteQuery}),
}));

vi.mock('aristid-ds', async () => ({
    ...(await vi.importActual('aristid-ds')),
    KitAlert: {success: vi.fn(), error: vi.fn(), info: vi.fn()},
}));

const T = 'view_settings.current_view';

const echoView = {id: 'view-1', label: {fr: 'V'}};
const createdView = {id: 'view-2', label: {fr: 'Ma copie'}};

beforeEach(() => {
    vi.clearAllMocks();
    mockView = {
        id: 'view-1',
        library: 'lib',
        label: {fr: 'V', en: 'V-en'},
        shared: false,
        display: {
            type: ViewV2Types.list,
            attributes: [
                {visible: true, attribute: {id: 'a'}},
                {visible: false, attribute: {id: 'b'}},
            ],
        },
        sorts: [
            {order: SortOrder.asc, activated: true, attributes: [{id: 'a'}]},
            {order: SortOrder.desc, activated: false, attributes: [{id: 'campagnes'}, {id: 'thematiques'}]},
        ],
        filters: [
            {condition: RecordFilterCondition.EQUAL, values: ['x'], pinned: true, attributes: [{id: 'a'}]},
            {
                condition: RecordFilterCondition.CONTAINS,
                values: [],
                pinned: false,
                attributes: [{id: 'campagnes'}, {id: 'thematiques'}],
            },
        ],
        shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.filters],
    };
    mockUpdate.mockResolvedValue({data: {updateViewV2: echoView}});
    mockCreate.mockResolvedValue({data: {createViewV2: createdView}});
    vi.spyOn(generated, 'useUpdateViewV2Mutation').mockReturnValue([mockUpdate, {loading: false}] as any);
    vi.spyOn(generated, 'useCreateViewV2Mutation').mockReturnValue([mockCreate, {loading: false}] as any);
});

const mappedDisplay = {
    type: ViewV2Types.list,
    attributes: [
        {attributeId: 'a', visible: true},
        {attributeId: 'b', visible: false},
    ],
};

const mappedSorts = [
    {attributes: ['a'], order: SortOrder.asc, activated: true},
    {attributes: ['campagnes', 'thematiques'], order: SortOrder.desc, activated: false},
];

const mappedFilters = [
    {attributes: ['a'], condition: RecordFilterCondition.EQUAL, values: ['x'], pinned: true, withEmptyValues: false},
    {
        attributes: ['campagnes', 'thematiques'],
        condition: RecordFilterCondition.CONTAINS,
        values: [],
        pinned: false,
        withEmptyValues: false,
    },
];

describe('useCurrentViewActions', () => {
    describe('save', () => {
        it('updates with the full label + mapped display + mapped sorts, echoes LOAD_VIEW and notifies success', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.save();
            });

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {
                        view: {
                            id: 'view-1',
                            label: {fr: 'V', en: 'V-en'},
                            display: mappedDisplay,
                            sorts: mappedSorts,
                            filters: mappedFilters,
                            shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.filters],
                        },
                    },
                    refetchQueries: [{query: generated.GetViewListDocument, variables: {libraryId: 'lib'}}],
                }),
            );
            expect(mockDispatch).toHaveBeenCalledWith({type: 'LOAD_VIEW', payload: echoView});
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.save_success`}));
        });

        it('notifies error and does not echo on failure', async () => {
            mockUpdate.mockRejectedValueOnce(new Error('USER_IS_NOT_VIEW_OWNER'));
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.save();
            });

            expect(KitAlert.error).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.action_error`}));
            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('saveAs', () => {
        it('creates an independent view (name on every lang, shared false, current sorts + filters) and switches to it', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.saveAs('Ma copie');
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {
                        view: {
                            library: 'lib',
                            label: {fr: 'Ma copie'}, // MockedLangContextProvider ⇒ lang === ['fr']
                            shared: false,
                            display: mappedDisplay,
                            filters: mappedFilters,
                            sorts: mappedSorts,
                            shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.filters],
                        },
                    },
                }),
            );
            expect(mockWriteQuery).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {viewId: createdView.id},
                    data: {viewV2: createdView},
                }),
            );
            expect(mockDispatchPanelEvent).toHaveBeenCalledWith({
                type: 'view-settings-select-view',
                data: {viewId: createdView.id},
            });
            expect(mockDispatch).not.toHaveBeenCalled();
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.save_as_success`}));
        });

        it('persists the created view as last-used so a refresh restores it', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.saveAs('Ma copie');
            });

            expect(mockSaveLastUsedView).toHaveBeenCalledWith(createdView.id);
        });

        it('does not persist last-used when creation fails', async () => {
            mockCreate.mockRejectedValueOnce(new Error('boom'));
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.saveAs('Ma copie');
            });

            expect(mockSaveLastUsedView).not.toHaveBeenCalled();
        });
    });

    describe('toggleShared', () => {
        it('shares immediately without confirmation', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.toggleShared(true);
            });

            expect(mockOpenConfirmModal).not.toHaveBeenCalled();
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({variables: {view: {id: 'view-1', shared: true}}}),
            );
            expect(mockSetShared).toHaveBeenCalledWith(true);
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.share_success`}));
        });

        it('asks for confirmation before unsharing and only mutates on confirm', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            act(() => {
                result.current.toggleShared(false);
            });

            expect(mockOpenConfirmModal).toHaveBeenCalledWith(expect.objectContaining({dangerConfirm: true}));
            expect(mockUpdate).not.toHaveBeenCalled();

            // The mock doesn't auto-run onOk: grab it and invoke it (user confirms).
            const {onOk} = mockOpenConfirmModal.mock.calls[0][0];
            await act(async () => {
                await onOk();
            });

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({variables: {view: {id: 'view-1', shared: false}}}),
            );
            expect(mockSetShared).toHaveBeenCalledWith(false);
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.unshare_success`}));
        });
    });
});
