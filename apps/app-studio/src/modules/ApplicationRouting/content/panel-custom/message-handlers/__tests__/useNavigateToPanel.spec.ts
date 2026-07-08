import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../../../types';
import {useNavigateToPanel} from '../useNavigateToPanel';
import * as threadActionCallbacks from '../../../../stores/threadActionCallbacks';
import * as panelCloseCallbacks from '../../../../utils/panelCloseCallbacks';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: vi.fn(),
    useParams: vi.fn(() => ({})),
}));

vi.mock('../../../../../../config/application-instance/application-settings/ApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

describe('useNavigateToPanel', () => {
    const spyUseNavigate = vi.spyOn(ReactRouter, 'useNavigate');
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const navigateMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
        spyUseParams.mockReturnValue({});
    });

    it('should provide a method to navigate to a panel', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
                workspaces: [
                    {
                        id: '1',
                        title: {
                            fr: 'un',
                            en: 'one',
                        },
                        icon: 'fa-house',
                        type: 'library',
                        libraryId: 'test1',
                    },
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                isViewSettingsActive: false,
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            vi.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'useless due to other fields fulfillment',
            recordId: '1234567890',
            where: 'fullpage',
            panelId: 'panelIdTest',
        });

        expect(navigateMock).toHaveBeenCalledWith('1234567890/fullpage/panelIdTest', undefined);
    });

    it('should not navigate when record not defined', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
                workspaces: [
                    {
                        id: '1',
                        title: {
                            fr: 'un',
                            en: 'one',
                        },
                        icon: 'fa-house',
                        type: 'library',
                        libraryId: 'test1',
                    },
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                isViewSettingsActive: false,
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            vi.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            where: 'fullpage',
            panelId: 'panelIdTest',
        });

        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should navigate for first panel in given library', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
                workspaces: [
                    {
                        id: '1',
                        title: {
                            fr: 'un',
                            en: 'one',
                        },
                        icon: 'fa-house',
                        type: 'library',
                        libraryId: 'test1',
                    },
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                isViewSettingsActive: false,
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            vi.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            recordId: '1234567890',
            where: 'fullpage',
        });

        expect(navigateMock).toHaveBeenCalledWith('1234567890/fullpage/panelIdTest', undefined);
    });

    it('should looking for first panel in given library and do nothing when library as no panel', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
                workspaces: [
                    {
                        id: '1',
                        title: {
                            fr: 'un',
                            en: 'one',
                        },
                        icon: 'fa-house',
                        type: 'library',
                        libraryId: 'test1',
                    },
                ],
                libraries: {
                    empty: {
                        libraryPanels: [],
                        recordPanels: [],
                    },
                },
            } satisfies Application,
            vi.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            recordId: '1234567890',
            where: 'fullpage',
        });

        expect(navigateMock).not.toHaveBeenCalled();

        current.navigateToPanel({
            libraryId: 'empty',
            recordId: '1234567890',
            where: 'fullpage',
        });

        expect(navigateMock).not.toHaveBeenCalled();
    });

    it('should navigate with flap params', async () => {
        spyUseApplicationSettingsContext.mockReturnValue([
            {
                workspaces: [
                    {
                        id: '1',
                        title: {
                            fr: 'un',
                            en: 'one',
                        },
                        icon: 'fa-house',
                        type: 'library',
                        libraryId: 'test1',
                    },
                ],
                libraries: {
                    test1: {
                        libraryPanels: [],
                        recordPanels: [
                            {
                                id: 'panelIdTest',
                                type: 'explorer',
                                isViewSettingsActive: false,
                                actions: [],
                            },
                        ],
                    },
                },
            } satisfies Application,
            vi.fn(),
        ]);

        const {
            result: {current},
        } = renderHook(() => useNavigateToPanel());

        current.navigateToPanel({
            libraryId: 'test1',
            recordId: '1234567890',
            where: 'fullpage',
            panelId: 'panelIdTest',
            flapPanelId: 'thread',
            flapRecordId: '5511',
            flapLibraryId: 'campaign-detail',
        });

        expect(navigateMock).toHaveBeenCalledWith(
            '1234567890/fullpage/panelIdTest/flap/5511/campaign-detail/thread',
            undefined,
        );
    });

    describe('thread-action callbacks registration', () => {
        const registerThread = vi.spyOn(threadActionCallbacks, 'registerThreadActionCallbacks');
        const registerClose = vi.spyOn(panelCloseCallbacks, 'registerPanelCloseCallback');

        const application = {libraries: {lib: {recordPanels: [{id: 'edition'}]}}} as never;

        beforeEach(() => {
            spyUseApplicationSettingsContext.mockReturnValue([application, vi.fn()]);
        });

        it('should register thread-action callbacks keyed by {where, flapPanelId} when opening the thread flap', () => {
            const onCommentSubmitted = vi.fn();
            const onCommentMentionAdded = vi.fn();
            const onDiscussionStatusChanged = vi.fn();

            const {
                result: {current},
            } = renderHook(() => useNavigateToPanel());

            current.navigateToPanel({
                where: 'fullpage',
                libraryId: 'lib',
                panelId: 'edition',
                recordId: 'rec',
                flapRecordId: 'frec',
                flapLibraryId: 'flib',
                flapPanelId: 'thread',
                onCommentSubmitted,
                onCommentMentionAdded,
                onDiscussionStatusChanged,
            });

            expect(registerThread).toHaveBeenCalledWith(
                {where: 'fullpage'},
                {onCommentSubmitted, onCommentMentionAdded, onDiscussionStatusChanged},
            );
            expect(navigateMock).toHaveBeenCalled();
        });

        it('should not register thread-action callbacks when no flap is opened', () => {
            const {
                result: {current},
            } = renderHook(() => useNavigateToPanel());

            current.navigateToPanel({where: 'slider', libraryId: 'lib', panelId: 'edition', recordId: 'rec'});

            expect(registerThread).not.toHaveBeenCalled();
        });

        it('should still register the onClose panel-close callback (existing behavior preserved)', () => {
            const onClose = vi.fn();
            const {
                result: {current},
            } = renderHook(() => useNavigateToPanel());

            current.navigateToPanel({where: 'slider', libraryId: 'lib', panelId: 'edition', recordId: 'rec', onClose});

            expect(registerClose).toHaveBeenCalledWith(
                {recordId: 'rec', where: 'slider', recordPanelId: 'edition'},
                onClose,
            );
        });
    });

    describe('when navigating from a slider context', () => {
        beforeEach(() => {
            spyUseParams.mockReturnValue({where: 'slider'});
        });

        it('should navigate with relative path and prefix when in slider', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                {
                    workspaces: [
                        {
                            id: '1',
                            title: {
                                fr: 'un',
                                en: 'one',
                            },
                            icon: 'fa-house',
                            type: 'library',
                            libraryId: 'test1',
                        },
                    ],
                    libraries: {
                        test1: {
                            libraryPanels: [],
                            recordPanels: [
                                {
                                    id: 'panelIdTest',
                                    type: 'explorer',
                                    isViewSettingsActive: false,
                                    actions: [],
                                },
                            ],
                        },
                    },
                } satisfies Application,
                vi.fn(),
            ]);

            const {
                result: {current},
            } = renderHook(() => useNavigateToPanel());

            current.navigateToPanel({
                libraryId: 'test1',
                recordId: '1234567890',
                where: 'fullpage',
                panelId: 'panelIdTest',
            });

            expect(navigateMock).toHaveBeenCalledWith('../../../1234567890/fullpage/panelIdTest', {relative: 'path'});
        });

        it('should navigate with relative path and prefix when in slider with flap params', async () => {
            spyUseApplicationSettingsContext.mockReturnValue([
                {
                    workspaces: [
                        {
                            id: '1',
                            title: {
                                fr: 'un',
                                en: 'one',
                            },
                            icon: 'fa-house',
                            type: 'library',
                            libraryId: 'test1',
                        },
                    ],
                    libraries: {
                        test1: {
                            libraryPanels: [],
                            recordPanels: [
                                {
                                    id: 'panelIdTest',
                                    type: 'explorer',
                                    isViewSettingsActive: false,
                                    actions: [],
                                },
                            ],
                        },
                    },
                } satisfies Application,
                vi.fn(),
            ]);

            const {
                result: {current},
            } = renderHook(() => useNavigateToPanel());

            current.navigateToPanel({
                libraryId: 'test1',
                recordId: '1234567890',
                where: 'fullpage',
                panelId: 'panelIdTest',
                flapPanelId: 'thread',
                flapRecordId: '5511',
                flapLibraryId: 'campaign-detail',
            });

            expect(navigateMock).toHaveBeenCalledWith(
                '../../../1234567890/fullpage/panelIdTest/flap/5511/campaign-detail/thread',
                {relative: 'path'},
            );
        });
    });
});
