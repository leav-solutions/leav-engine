// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {TaskStatus, type GetUserTasksQuery} from '../../../../__generated__';
import {TasksList} from '../TasksList';

type Task = GetUserTasksQuery['tasks']['list'][number];

const mockUseGetUserTasks = jest.fn();

jest.mock('../user-tasks/useGetUserTasks', () => ({
    useGetUserTasks: (...args: unknown[]) => mockUseGetUserTasks(...args),
}));

jest.mock('_ui/hooks', () => ({
    useUser: () => ({userData: {userId: 'test-user-id'}}),
    useLang: () => ({lang: ['fr']}),
}));

describe('TasksList', () => {
    const createMockTask = (overrides: Partial<Task> = {}): Task => ({
        id: 'task-1',
        status: TaskStatus.PENDING,
        label: {fr: 'Tâche de test', en: 'Test task'},
        created_at: 1700000000,
        startedAt: null,
        completedAt: null,
        progress: {
            description: null,
            percent: 0,
        },
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGetUserTasks.mockReturnValue({
            userTasks: [],
            loading: false,
            error: undefined,
        });
    });

    describe('Rendering based on task status', () => {
        it('should render a task with CREATED status', () => {
            const task = createMockTask({status: TaskStatus.CREATED, progress: {description: null, percent: 0}});
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.CREATED')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('0 %')).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.started_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();
        });

        it('should render a task with PENDING status', () => {
            const task = createMockTask({status: TaskStatus.PENDING, progress: {description: null, percent: 0}});
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.PENDING')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('0 %')).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.started_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();
        });

        it('should render a task with RUNNING status', () => {
            const startedAt = 1700000100;
            const task = createMockTask({
                status: TaskStatus.RUNNING,
                startedAt,
                progress: {description: null, percent: 50},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.RUNNING')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('50 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();
        });

        it('should render a task with PENDING_CANCEL status without progress', () => {
            const task = createMockTask({
                status: TaskStatus.PENDING_CANCEL,
                progress: {description: null, percent: 0},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.PENDING_CANCEL')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('0 %')).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.started_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();
        });

        it('should render a task with PENDING_CANCEL status with progress', () => {
            const task = createMockTask({
                status: TaskStatus.PENDING_CANCEL,
                startedAt: 1700000100,
                completedAt: 1700000400,
                progress: {description: null, percent: 40},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.PENDING_CANCEL')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('40 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.duration/)).toBeInTheDocument();
        });

        it('should render a task with CANCELED status without progress', () => {
            const task = createMockTask({
                status: TaskStatus.CANCELED,
                progress: {description: null, percent: 0},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.CANCELED')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('0 %')).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.started_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();
        });

        it('should render a task with CANCELED status with progress', () => {
            const task = createMockTask({
                status: TaskStatus.CANCELED,
                startedAt: 1700000100,
                completedAt: 1700000400,
                progress: {description: null, percent: 75},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.CANCELED')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('75 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.duration/)).toBeInTheDocument();
        });

        it('should render a task with DONE status', () => {
            const task = createMockTask({
                status: TaskStatus.DONE,
                startedAt: 1700000100,
                completedAt: 1700000400,
                progress: {description: null, percent: 100},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.DONE')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('100 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.duration/)).toBeInTheDocument();
        });

        it('should render a task with FAILED status', () => {
            const task = createMockTask({
                status: TaskStatus.FAILED,
                startedAt: 1700000100,
                completedAt: 1700000400,
                progress: {description: null, percent: 30},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText('Tâche de test')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.FAILED')).toBeInTheDocument();
            expect(screen.getByText('activity_center.progress')).toBeInTheDocument();
            expect(screen.getByText('30 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.duration/)).toBeInTheDocument();
        });
    });

    describe('Duration display', () => {
        it('should display duration less than minute when task completes quickly', () => {
            const task = createMockTask({
                status: TaskStatus.DONE,
                startedAt: 1700000100,
                completedAt: 1700000130,
                progress: {description: null, percent: 100},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(
                screen.getByText(/^activity_center\.tasks\.duration.*duration_less_than_minute/),
            ).toBeInTheDocument();
        });

        it('should display duration in minutes when task takes more than a minute', () => {
            const task = createMockTask({
                status: TaskStatus.DONE,
                startedAt: 1700000100,
                completedAt: 1700000700,
                progress: {description: null, percent: 100},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.duration.*duration_minutes\|10/)).toBeInTheDocument();
        });

        it('should display duration in hours and minutes when task takes more than an hour', () => {
            const task = createMockTask({
                status: TaskStatus.DONE,
                startedAt: 1700000100,
                completedAt: 1700004100,
                progress: {description: null, percent: 100},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [task], loading: false, error: undefined});

            render(<TasksList />);

            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(
                screen.getByText(/^activity_center\.tasks\.duration.*duration_hours_minutes\|1\|6/),
            ).toBeInTheDocument();
        });
    });

    describe('Subscription updates', () => {
        it('should display updated task when subscription returns updated data', () => {
            const initialTask = createMockTask({
                id: 'task-1',
                label: {fr: 'Tâche initiale'},
                status: TaskStatus.PENDING,
                progress: {description: null, percent: 0},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [initialTask], loading: false, error: undefined});

            const {rerender} = render(<TasksList />);
            expect(screen.getByText('Tâche initiale')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.PENDING')).toBeInTheDocument();
            expect(screen.getByText('0 %')).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.started_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();

            const updatedTask = createMockTask({
                id: 'task-1',
                label: {fr: 'Tâche initiale'},
                status: TaskStatus.RUNNING,
                startedAt: 1700000100,
                progress: {description: null, percent: 25},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [updatedTask], loading: false, error: undefined});

            rerender(<TasksList />);

            expect(screen.getByText('Tâche initiale')).toBeInTheDocument();
            expect(screen.getByText('activity_center.tasks.status.RUNNING')).toBeInTheDocument();
            expect(screen.getByText('25 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.completed_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/^activity_center\.tasks\.duration/)).not.toBeInTheDocument();
        });

        it('should display new task when subscription returns a new task', () => {
            const existingTask = createMockTask({
                id: 'task-1',
                label: {fr: 'Tâche existante'},
                status: TaskStatus.DONE,
                startedAt: 1700000100,
                completedAt: 1700000400,
                progress: {description: null, percent: 100},
            });
            mockUseGetUserTasks.mockReturnValue({userTasks: [existingTask], loading: false, error: undefined});

            const {rerender} = render(<TasksList />);
            expect(screen.getByText('Tâche existante')).toBeInTheDocument();
            expect(screen.getByText('100 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
            expect(screen.queryByText('Nouvelle tâche')).not.toBeInTheDocument();

            const newTask = createMockTask({
                id: 'task-2',
                label: {fr: 'Nouvelle tâche'},
                status: TaskStatus.PENDING,
                created_at: 1700000500,
                progress: {description: null, percent: 0},
            });
            mockUseGetUserTasks.mockReturnValue({
                userTasks: [newTask, existingTask],
                loading: false,
                error: undefined,
            });

            rerender(<TasksList />);

            expect(screen.getByText('Tâche existante')).toBeInTheDocument();
            expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
            expect(screen.getByText('100 %')).toBeInTheDocument();
            expect(screen.getByText('0 %')).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.started_at/)).toBeInTheDocument();
            expect(screen.getByText(/^activity_center\.tasks\.completed_at/)).toBeInTheDocument();
        });
    });
});
