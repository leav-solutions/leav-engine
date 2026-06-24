import {render, screen} from '_ui/_tests/testUtils';
import {NotificationLevel, type GetUserNotificationsQuery} from '../../../../__generated__';
import {NotificationsList} from '../NotificationsList';
import userEvent from '@testing-library/user-event';

type Notification = GetUserNotificationsQuery['notifications']['list'][number];

const mockUseGetUserNotifications = jest.fn();
const mockUseDeleteUserNotifications = jest.fn();

jest.mock('../get-user-notifications/useGetUserNotifications', () => ({
    useGetUserNotifications: (...args: unknown[]) => mockUseGetUserNotifications(...args),
}));

jest.mock('../delete-user-notifications/useDeleteUserNotifications', () => ({
    useDeleteUserNotifications: () => ({deleteUserNotifications: mockUseDeleteUserNotifications}),
}));

const mockTrackNotificationEvents = jest.fn();

jest.mock('../../../../services/analytics', () => ({
    trackNotificationEvents: (...args: unknown[]) => mockTrackNotificationEvents(...args),
}));

const mockOpenConfirmModal = jest.fn(({onOk}) => onOk?.());

jest.mock('_ui/hooks', () => ({
    useUser: () => ({userData: {userId: 'test-user-id'}}),
    useLang: () => ({lang: ['fr']}),
    useConfirmModal: () => ({openConfirmModal: mockOpenConfirmModal}),
}));

describe('NotificationsList', () => {
    const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
        id: 'notification-1',
        date: Math.floor(Date.now() / 1_000) - 300,
        level: NotificationLevel.info,
        title: 'Titre de test',
        message: 'Message de test',
        ...overrides,
    });

    const mockRemoveNotifications = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGetUserNotifications.mockReturnValue({
            userNotifications: [],
            loading: false,
            error: undefined,
            removeNotifications: mockRemoveNotifications,
        });
    });

    describe('Loading and empty states', () => {
        it('should display loader when loading', () => {
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [],
                loading: true,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            // KitLoader is a <span> without role="progressbar" in the DS; This is why we use data-testid
            expect(screen.getByTestId('notifications-loader')).toBeInTheDocument();
        });

        it('should display error state when error', () => {
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [],
                loading: false,
                error: new Error('Erreur'),
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('error.title')).toBeInTheDocument();
            expect(screen.getByText('error.description')).toBeInTheDocument();
        });

        it('should display empty state when no notifications', () => {
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('activity_center.notifications.no_notifications')).toBeInTheDocument();
        });
    });

    describe('Rendering based on notification level', () => {
        it('should render a notification with info level', () => {
            const notification = createMockNotification({
                level: NotificationLevel.info,
                title: 'Info',
                message: 'Message info',
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('Info')).toBeInTheDocument();
            expect(screen.getByText('Message info')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: 'global.delete'})).toBeInTheDocument();
        });

        it('should render a notification with warning level', () => {
            const notification = createMockNotification({
                level: NotificationLevel.warning,
                title: 'Avertissement',
                message: 'Message warning',
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('Avertissement')).toBeInTheDocument();
            expect(screen.getByText('Message warning')).toBeInTheDocument();
        });

        it('should render a notification with error level', () => {
            const notification = createMockNotification({
                level: NotificationLevel.error,
                title: 'Erreur',
                message: 'Message erreur',
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('Erreur')).toBeInTheDocument();
            expect(screen.getByText('Message erreur')).toBeInTheDocument();
        });

        it('should render a notification with success level', () => {
            const notification = createMockNotification({
                level: NotificationLevel.success,
                title: 'Succès',
                message: 'Message succès',
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('Succès')).toBeInTheDocument();
            expect(screen.getByText('Message succès')).toBeInTheDocument();
        });
    });

    describe('Relative time display', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-30T12:00:00.000Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should display duration less than minute when notification is very recent', () => {
            const notification = createMockNotification({
                date: Math.floor(new Date('2025-01-30T11:59:30.000Z').getTime() / 1_000),
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText(/activity_center\.notifications\.duration_less_than_minute/)).toBeInTheDocument();
        });

        it('should display duration in minutes when notification is less than an hour old', () => {
            const notification = createMockNotification({
                date: Math.floor(new Date('2025-01-30T11:55:00.000Z').getTime() / 1_000),
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText(/activity_center\.notifications\.duration_minutes/)).toBeInTheDocument();
        });

        it('should display duration in hours when notification is less than a day old', () => {
            const notification = createMockNotification({
                date: Math.floor(new Date('2025-01-30T10:00:00.000Z').getTime() / 1_000),
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText(/activity_center\.notifications\.duration_hours/)).toBeInTheDocument();
        });

        it('should display duration in days when notification is older than a day', () => {
            const notification = createMockNotification({
                date: Math.floor(new Date('2025-01-25T12:00:00.000Z').getTime() / 1_000),
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText(/activity_center\.notifications\.duration_days/)).toBeInTheDocument();
        });
    });

    describe('Delete button', () => {
        it('should call deleteUserNotifications when delete button is clicked and confirmed', async () => {
            const notification = createMockNotification({
                level: NotificationLevel.success,
                title: 'À supprimer',
                message: 'Message',
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            const deleteButton = screen.getByRole('button', {name: 'global.delete'});
            await userEvent.click(deleteButton);

            expect(mockUseDeleteUserNotifications).toHaveBeenCalledWith([notification]);
        });

        it('should not display delete all button when there is only one notification', () => {
            const notification = createMockNotification();
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.queryByRole('button', {name: 'global.delete_all'})).not.toBeInTheDocument();
        });

        it('should display delete all button when there are multiple notifications', () => {
            const notification1 = createMockNotification({id: 'notif-1'});
            const notification2 = createMockNotification({id: 'notif-2'});
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification1, notification2],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByRole('button', {name: 'global.delete_all'})).toBeInTheDocument();
        });

        it('should call deleteUserNotifications with all notifications when delete all is clicked', async () => {
            const notification1 = createMockNotification({id: 'notif-1'});
            const notification2 = createMockNotification({id: 'notif-2'});
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification1, notification2],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            const deleteAllButton = screen.getByRole('button', {name: 'global.delete_all'});
            await userEvent.click(deleteAllButton);

            expect(mockUseDeleteUserNotifications).toHaveBeenCalledWith([notification1, notification2]);
        });
    });

    describe('Download and related entities', () => {
        it('should display download button when notification has attachments', () => {
            const notification = createMockNotification({
                level: NotificationLevel.success,
                title: 'Avec pièce jointe',
                message: 'Message',
                attachments: [{label: 'Fichier', url: 'https://example.com/file.pdf'}],
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByRole('button', {name: 'global.download'})).toBeInTheDocument();
        });

        it('should not display download button when notification has no attachments', () => {
            const notification = createMockNotification({
                level: NotificationLevel.info,
                title: 'Sans pièce',
                message: 'Message',
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.queryByRole('button', {name: 'global.download'})).not.toBeInTheDocument();
        });

        it('should emit trackingEvent with notification center source when download is clicked', async () => {
            const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
            const notification = createMockNotification({
                level: NotificationLevel.error,
                title: 'Avec pièce jointe',
                message: 'Message',
                attachments: [
                    {
                        label: 'Rapport',
                        url: 'https://example.com/report.csv',
                        trackingEvent: {
                            category: 'Planning - Reconduction',
                            action: 'Rapport Erreur Reconduction Ouvert',
                            name: null,
                            value: null,
                        },
                    },
                ],
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            await userEvent.click(screen.getByRole('button', {name: 'global.download'}));

            expect(mockTrackNotificationEvents).toHaveBeenCalledWith([
                {
                    category: 'Planning - Reconduction',
                    action: 'Rapport Erreur Reconduction Ouvert',
                    name: 'Source : Centre de notifications',
                    value: null,
                },
            ]);
            expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/report.csv', '_blank');

            windowOpenSpy.mockRestore();
        });

        it('should not emit trackingEvent when attachment has none', async () => {
            const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
            const notification = createMockNotification({
                level: NotificationLevel.success,
                title: 'Sans tracking',
                message: 'Message',
                attachments: [{label: 'Fichier', url: 'https://example.com/file.pdf'}],
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            await userEvent.click(screen.getByRole('button', {name: 'global.download'}));

            expect(mockTrackNotificationEvents).not.toHaveBeenCalled();
            expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/file.pdf', '_blank');

            windowOpenSpy.mockRestore();
        });

        it('should display show button when notification has related entities', () => {
            const notification = createMockNotification({
                level: NotificationLevel.success,
                title: 'Avec entité',
                message: 'Message',
                relatedEntities: [{label: 'Voir la fiche', url: '/entity/123'}],
            });
            mockUseGetUserNotifications.mockReturnValue({
                userNotifications: [notification],
                loading: false,
                error: undefined,
                removeNotifications: mockRemoveNotifications,
            });

            render(<NotificationsList />);

            expect(screen.getByText('Voir la fiche')).toBeInTheDocument();
        });
    });
});
