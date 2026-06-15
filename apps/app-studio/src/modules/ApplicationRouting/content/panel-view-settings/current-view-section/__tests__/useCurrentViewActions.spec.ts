import {KitAlert} from 'aristid-ds';
import {act, renderHook} from '_ui/_tests/testUtils';
import * as generated from '../../../../../../__generated__';
import {ViewV2Types} from '../../../../../../__generated__';
import {useCurrentViewActions} from '../useCurrentViewActions';

const mockUpdate = jest.fn();
const mockCreate = jest.fn();

const mockDispatch = jest.fn();
const mockSetShared = jest.fn();
let mockView: any;

jest.mock('../../store-current-view/useCurrentView', () => ({
    useCurrentView: () => ({view: mockView, dispatch: mockDispatch, setShared: mockSetShared}),
}));

const mockOpenConfirmModal = jest.fn();
jest.mock('@leav/ui', () => ({
    ...jest.requireActual('@leav/ui'),
    useConfirmModal: () => ({openConfirmModal: mockOpenConfirmModal}),
}));

jest.mock('aristid-ds', () => ({
    ...jest.requireActual('aristid-ds'),
    KitAlert: {success: jest.fn(), error: jest.fn(), info: jest.fn()},
}));

const T = 'view_settings.current-view';

const echoView = {id: 'view-1', label: {fr: 'V'}};
const createdView = {id: 'view-2', label: {fr: 'Ma copie'}};

beforeEach(() => {
    jest.clearAllMocks();
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
    };
    mockUpdate.mockResolvedValue({data: {updateViewV2: echoView}});
    mockCreate.mockResolvedValue({data: {createViewV2: createdView}});
    jest.spyOn(generated, 'useUpdateViewV2Mutation').mockReturnValue([mockUpdate, {loading: false}] as any);
    jest.spyOn(generated, 'useCreateViewV2Mutation').mockReturnValue([mockCreate, {loading: false}] as any);
});

const mappedDisplay = {
    type: ViewV2Types.list,
    attributes: [
        {attributeId: 'a', visible: true},
        {attributeId: 'b', visible: false},
    ],
};

describe('useCurrentViewActions', () => {
    describe('save', () => {
        it('updates with the full label + mapped display, echoes LOAD_VIEW and notifies success', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.save();
            });

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {view: {id: 'view-1', label: {fr: 'V', en: 'V-en'}, display: mappedDisplay}},
                    refetchQueries: [{query: generated.GetViewListDocument, variables: {libraryId: 'lib'}}],
                }),
            );
            expect(mockDispatch).toHaveBeenCalledWith({type: 'LOAD_VIEW', payload: echoView});
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.save-success`}));
        });

        it('notifies error and does not echo on failure', async () => {
            mockUpdate.mockRejectedValueOnce(new Error('USER_IS_NOT_VIEW_OWNER'));
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.save();
            });

            expect(KitAlert.error).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.action-error`}));
            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('fork', () => {
        it('creates an independent view (name on every lang, shared false, empty filters/sorts) and switches to it', async () => {
            const {result} = renderHook(() => useCurrentViewActions());

            await act(async () => {
                await result.current.fork('Ma copie');
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    variables: {
                        view: {
                            library: 'lib',
                            label: {fr: 'Ma copie'}, // MockedLangContextProvider ⇒ lang === ['fr']
                            shared: false,
                            display: mappedDisplay,
                            filters: [],
                            sorts: [],
                        },
                    },
                }),
            );
            expect(mockDispatch).toHaveBeenCalledWith({type: 'LOAD_VIEW', payload: createdView});
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.clone-success`}));
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
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.share-success`}));
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
            expect(KitAlert.success).toHaveBeenCalledWith(expect.objectContaining({message: `${T}.unshare-success`}));
        });
    });
});
