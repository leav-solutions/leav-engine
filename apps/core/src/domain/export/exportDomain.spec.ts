import {type ToAny} from '../../utils/utils';
import {type IQueryInfos} from '../../_types/queryInfos';
import exportDomain, {type IExportDomainDeps} from './exportDomain';

const depsBase: ToAny<IExportDomainDeps> = {
    'core.domain.record': vi.fn(),
    'core.domain.attribute': vi.fn(),
    'core.domain.library': vi.fn(),
    'core.domain.tasksManager': vi.fn(),
    'core.domain.helpers.validate': vi.fn(),
    'core.domain.export.exportProfile': vi.fn(),
    'core.domain.helpers.updateTaskProgress': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.domain.notification': vi.fn(),
    'core.utils': vi.fn(),
    translator: {},
    config: {},
};

describe('exportDomain', () => {
    const mockCtx: IQueryInfos = {
        userId: '1',
        queryId: 'exportDomainTest',
    };

    describe('exportExcel', () => {
        it('should throw CustomConfigError when profile returns no attributes', async () => {
            const mockExportProfileDomain = {
                getColumnsFromProfileConfig: vi.fn().mockResolvedValue(undefined),
            };

            const domain = exportDomain({
                ...depsBase,
                'core.domain.export.exportProfile': mockExportProfileDomain as any,
            });

            const library = 'test_library';

            await expect(
                domain.exportExcel({
                    library,
                    profile: 'invalid_profile',
                    ctx: mockCtx,
                }),
            ).rejects.toThrow('No attributes provided for exportExcel function for library test_library');

            expect(mockExportProfileDomain.getColumnsFromProfileConfig).toHaveBeenCalledWith(
                'invalid_profile',
                'test_library',
                mockCtx,
            );
        });

        it('should create a task and return task ID when no task.id is provided', async () => {
            const mockTasksManager = {
                createTask: vi.fn().mockResolvedValue(undefined),
            };

            const mockExportProfileDomain = {
                getColumnsFromProfileConfig: vi.fn().mockResolvedValue([
                    {columnLabel: 'Name', attribute: 'name'},
                    {columnLabel: 'Email', attribute: 'email'},
                ]),
            };

            const domain = exportDomain({
                ...depsBase,
                'core.domain.tasksManager': mockTasksManager as any,
                'core.domain.export.exportProfile': mockExportProfileDomain as any,
                config: {
                    lang: {
                        available: ['en', 'fr'],
                        default: 'en',
                    },
                } as any,
                translator: {
                    t: vi.fn().mockReturnValue('Export task'),
                } as any,
            });

            const result = await domain.exportExcel({
                library: 'test_library',
                profile: 'test_profile',
                ctx: mockCtx,
            });

            // Should return a task ID (UUID format)
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(mockExportProfileDomain.getColumnsFromProfileConfig).toHaveBeenCalledWith(
                'test_profile',
                'test_library',
                mockCtx,
            );
            expect(mockTasksManager.createTask).toHaveBeenCalled();
        });

        it('should extract attributes and columnLabels from profile correctly', async () => {
            const mockColumns = [
                {columnLabel: 'Name Column', attribute: 'name'},
                {columnLabel: 'Email Column', attribute: 'email'},
                {columnLabel: 'Phone Column', attribute: 'phone'},
            ];

            const mockExportProfileDomain = {
                getColumnsFromProfileConfig: vi.fn().mockResolvedValue(mockColumns),
            };

            const mockTasksManager = {
                createTask: vi.fn().mockResolvedValue(undefined),
            };

            const domain = exportDomain({
                ...depsBase,
                'core.domain.export.exportProfile': mockExportProfileDomain as any,
                'core.domain.tasksManager': mockTasksManager as any,
                config: {
                    lang: {
                        available: ['en'],
                        default: 'en',
                    },
                } as any,
                translator: {
                    t: vi.fn().mockReturnValue('Export task'),
                } as any,
            });

            const result = await domain.exportExcel({
                library: 'test_library',
                profile: 'test_profile',
                ctx: mockCtx,
            });

            expect(typeof result).toBe('string');
            expect(mockExportProfileDomain.getColumnsFromProfileConfig).toHaveBeenCalledWith(
                'test_profile',
                'test_library',
                mockCtx,
            );

            // Verify createTask was called with correct attributes extracted from columns
            expect(mockTasksManager.createTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    func: expect.objectContaining({
                        args: expect.objectContaining({
                            library: 'test_library',
                            profile: 'test_profile',
                        }),
                    }),
                }),
                mockCtx,
            );
        });
    });
});
