import {type IPermissionDomain} from '../permission/permissionDomain';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type ITreeDomain} from '../tree/treeDomain';
import {type IGetLibrarySystemPanelsHelper} from './helpers/getLibrarySystemPanels';
import {type IApplication} from '../../_types/application';
import {type IConfig} from '../../_types/config';
import {type ILibrary} from '../../_types/library';
import {type ITree} from '../../_types/tree';
import {type ToAny} from '../../utils/utils';
import {mockCtx} from '../../__tests__/mocks/shared';
import {EXPLORER_STUDIO_APPLICATION} from '../../_constants/globalSettings';
import appStudioDomain, {type IAppStudioDomainDeps} from './appStudioDomain';

const mockConfig: Partial<IConfig> = {
    lang: {available: ['fr', 'en'], default: 'fr'},
};

const depsBase: ToAny<IAppStudioDomainDeps> = {
    config: mockConfig,
    'core.domain.permission': {},
    'core.domain.library': {},
    'core.domain.record': {},
    'core.domain.tree': {},
    'core.domain.application.helpers.getLibrarySystemPanels': {},
};

const makeLibrary = (id: string, frLabel: string): ILibrary => ({id, label: {fr: frLabel, en: frLabel}}) as ILibrary;
const makeTree = (id: string, frLabel: string): ITree => ({id, label: {fr: frLabel, en: frLabel}}) as unknown as ITree;

const makeExplorerStudioApp = (): IApplication =>
    ({
        id: EXPLORER_STUDIO_APPLICATION,
        settings: {application: {workspaces: []}},
    }) as unknown as IApplication;

describe('appStudioDomain', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getAppStudioSettings', () => {
        describe('explorer-studio auto-populate', () => {
            // Libraries and trees interleaved so the alphabetical sort is observable across both types.
            const libraries = [makeLibrary('lib_banane', 'Banane'), makeLibrary('lib_datte', 'Datte')];
            const trees = [makeTree('tree_abricot', 'Abricot'), makeTree('tree_cerise', 'Cerise')];

            const buildDomain = () => {
                const mockPermissionDomain: Mockify<IPermissionDomain> = {
                    isAllowed: global.__mockPromise(true),
                };

                const mockLibraryDomain: Mockify<ILibraryDomain> = {
                    getLibraries: global.__mockPromise({list: libraries, totalCount: libraries.length}),
                    getLibraryProperties: vi.fn(async (id: string) => libraries.find(library => library.id === id)),
                };

                const mockTreeDomain: Mockify<ITreeDomain> = {
                    getTrees: global.__mockPromise({list: trees, totalCount: trees.length}),
                    getTreeProperties: vi.fn(async (id: string) => trees.find(tree => tree.id === id)),
                };

                const mockPanelsHelper: Mockify<IGetLibrarySystemPanelsHelper> = {
                    getLibrarySystemPanels: vi.fn(() => ({libraryPanels: [], recordPanels: []})),
                };

                const domain = appStudioDomain({
                    ...depsBase,
                    'core.domain.permission': mockPermissionDomain as IPermissionDomain,
                    'core.domain.library': mockLibraryDomain as ILibraryDomain,
                    'core.domain.tree': mockTreeDomain as ITreeDomain,
                    'core.domain.application.helpers.getLibrarySystemPanels':
                        mockPanelsHelper as IGetLibrarySystemPanelsHelper,
                });

                return {domain, mockLibraryDomain, mockTreeDomain};
            };

            test('generates a tree workspace for each accessible tree', async () => {
                const {domain} = buildDomain();

                const settings = await domain.getAppStudioSettings({
                    application: makeExplorerStudioApp(),
                    ctx: mockCtx,
                });

                const treeWorkspaces = settings.workspaces.filter(workspace => workspace.type === 'tree');
                expect(treeWorkspaces).toHaveLength(trees.length);
                expect(treeWorkspaces.map(workspace => workspace.treeId)).toEqual(['tree_abricot', 'tree_cerise']);
                expect(treeWorkspaces.map(workspace => workspace.id)).toEqual([
                    'tree_abricot_tree_workspace',
                    'tree_cerise_tree_workspace',
                ]);
            });

            test('sets a fixed tree icon on tree workspaces', async () => {
                const {domain} = buildDomain();

                const settings = await domain.getAppStudioSettings({
                    application: makeExplorerStudioApp(),
                    ctx: mockCtx,
                });

                const treeWorkspaces = settings.workspaces.filter(workspace => workspace.type === 'tree');
                expect(treeWorkspaces.every(workspace => workspace.icon === 'fa-sitemap')).toBe(true);
            });

            test('resolves tree workspace title from the tree label', async () => {
                const {domain} = buildDomain();

                const settings = await domain.getAppStudioSettings({
                    application: makeExplorerStudioApp(),
                    ctx: mockCtx,
                });

                const abricot = settings.workspaces.find(workspace => workspace.treeId === 'tree_abricot');
                expect(abricot.title).toEqual({fr: 'Abricot', en: 'Abricot'});
            });

            test('mixes libraries and trees sorted alphabetically by title', async () => {
                const {domain} = buildDomain();

                const settings = await domain.getAppStudioSettings({
                    application: makeExplorerStudioApp(),
                    ctx: mockCtx,
                });

                expect(settings.workspaces.map(workspace => workspace.title.fr)).toEqual([
                    'Abricot',
                    'Banane',
                    'Cerise',
                    'Datte',
                ]);
            });

            test('gives a distinct id to a tree workspace whose tree shares a library id', async () => {
                const {domain} = buildDomain();
                const mockTreeDomain: Mockify<ITreeDomain> = {
                    getTrees: global.__mockPromise({list: [makeTree('lib_banane', 'Banane')], totalCount: 1}),
                    getTreeProperties: global.__mockPromise(makeTree('lib_banane', 'Banane')),
                };
                const collidingDomain = appStudioDomain({
                    ...depsBase,
                    'core.domain.permission': {isAllowed: global.__mockPromise(true)} as unknown as IPermissionDomain,
                    'core.domain.library': {
                        getLibraries: global.__mockPromise({
                            list: [makeLibrary('lib_banane', 'Banane')],
                            totalCount: 1,
                        }),
                        getLibraryProperties: global.__mockPromise(makeLibrary('lib_banane', 'Banane')),
                    } as unknown as ILibraryDomain,
                    'core.domain.tree': mockTreeDomain as ITreeDomain,
                    'core.domain.application.helpers.getLibrarySystemPanels': {
                        getLibrarySystemPanels: vi.fn(() => ({libraryPanels: [], recordPanels: []})),
                    } as unknown as IGetLibrarySystemPanelsHelper,
                });

                const settings = await collidingDomain.getAppStudioSettings({
                    application: makeExplorerStudioApp(),
                    ctx: mockCtx,
                });

                const workspaceIds = settings.workspaces.map(workspace => workspace.id);
                expect(new Set(workspaceIds).size).toBe(workspaceIds.length);
                expect(workspaceIds).toContain('lib_banane_workspace');
                expect(workspaceIds).toContain('lib_banane_tree_workspace');
            });

            test('does not look up library panels for tree workspaces', async () => {
                const {domain, mockLibraryDomain} = buildDomain();

                await domain.getAppStudioSettings({application: makeExplorerStudioApp(), ctx: mockCtx});

                const libraryPropsCallIds = mockLibraryDomain.getLibraryProperties.mock.calls.map(([id]) => id);
                expect(libraryPropsCallIds).not.toContain('tree_abricot');
                expect(libraryPropsCallIds).not.toContain('tree_cerise');
            });
        });
    });
});
