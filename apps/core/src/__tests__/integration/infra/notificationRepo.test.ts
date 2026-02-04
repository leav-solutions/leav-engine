// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '_types/queryInfos';
import {type ICreateNotificationInRepo, type INotificationRepo} from 'infra/notification/notificationRepo';
import {getNotificationRepo} from './integrationTestRepoUtils';

describe('notificationRepo', () => {
    let notificationRepo: INotificationRepo;
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        notificationRepo = getNotificationRepo();
    });

    const fullNotificationData: Omit<ICreateNotificationInRepo, 'date' | 'userId'> = {
        level: 'info',
        title: 'Test Notification',
        message: 'This is a test notification message.',
        taskId: 'task-123',
        attachments: [
            {
                url: 'http://example.com/attachment1',
                label: 'Attachment 1',
            },
        ],
        relatedEntities: [
            {
                url: 'http://example.com/entity1',
                label: 'Entity 1',
            },
        ],
    };

    describe('createNotification', () => {
        it('should create a notification', async () => {
            const notification = await notificationRepo.createNotification(
                {
                    ...fullNotificationData,
                    date: Date.now(),
                    userId: '1',
                },
                ctx,
            );

            expect(notification).toHaveProperty('id');
            expect(notification.title).toBe('Test Notification');
            expect(notification.message).toBe('This is a test notification message.');
            expect(notification.userId).toBe('1');
            expect(notification.level).toBe('info');
            expect(notification.taskId).toBe('task-123');
            expect(notification.attachments).toHaveLength(1);
            expect(notification.relatedEntities).toHaveLength(1);
        });
    });

    describe('Several notifications existe', () => {
        const user2Notifications: string[] = [];
        const user3Notifications: string[] = [];
        const user4Notifications: string[] = [];

        beforeAll(async () => {
            // Create multiple notifications for testing
            for (let i = 0; i < 4; i++) {
                const notification = await notificationRepo.createNotification(
                    {
                        date: Date.now(),
                        userId: '2',
                        level: 'info',
                        title: `Test Notification ${i + 1} user 2`,
                        message: `This is test notification message number ${i + 1} user 2.`,
                    },
                    ctx,
                );
                user2Notifications.push(notification.id);
            }
            // Create multiple notifications for testing
            for (let i = 0; i < 3; i++) {
                const notification = await notificationRepo.createNotification(
                    {
                        date: Date.now(),
                        userId: '3',
                        level: 'info',
                        title: `Test Notification ${i + 1} user 3`,
                        message: `This is test notification message number ${i + 1} user 3.`,
                    },
                    ctx,
                );
                user3Notifications.push(notification.id);
            }

            user4Notifications.push(
                (
                    await notificationRepo.createNotification(
                        {
                            date: Date.now(),
                            userId: '4',
                            ...fullNotificationData,
                        },
                        ctx,
                    )
                ).id,
            );
        });

        describe('getNotifications', () => {
            it('should get notifications for user 2', async () => {
                const notifications = await notificationRepo.getNotifications(
                    {
                        filters: {
                            userId: '2',
                        },
                        withCount: true,
                    },
                    ctx,
                );

                expect(notifications.totalCount).toBe(user2Notifications.length);
                expect(notifications.list.map(n => n.id).sort()).toEqual(user2Notifications.sort());
            });

            it('should get full notifications for user 4', async () => {
                const notifications = await notificationRepo.getNotifications(
                    {
                        filters: {
                            userId: '4',
                        },
                    },
                    ctx,
                );

                const notification = notifications.list[0];
                expect(notification.id).toBe(user4Notifications[0]);
                expect(notification.title).toBe(fullNotificationData.title);
                expect(notification.message).toBe(fullNotificationData.message);
                expect(notification.level).toBe(fullNotificationData.level);
                expect(notification.taskId).toBe(fullNotificationData.taskId);
                expect(notification.attachments).toEqual(fullNotificationData.attachments);
                expect(notification.relatedEntities).toEqual(fullNotificationData.relatedEntities);
            });
        });

        describe('deleteNotificationsByRecipientUserId', () => {
            it('should delete notifications for user 3', async () => {
                const deletedNotifications = await notificationRepo.deleteNotificationsByRecipientUserId('3', ctx);

                expect(deletedNotifications.map(n => n.id).sort()).toEqual(user3Notifications.sort());

                const notificationsAfterDeletion = await notificationRepo.getNotifications(
                    {
                        filters: {
                            userId: '3',
                        },
                        withCount: true,
                    },
                    ctx,
                );

                expect(notificationsAfterDeletion.totalCount).toBe(0);
            });
        });

        describe('deleteNotificationById', () => {
            it('should delete a specific notification by ID for user 2', async () => {
                const notificationIdToDelete = user2Notifications[0];

                const deletedNotification = await notificationRepo.deleteNotificationById(notificationIdToDelete, ctx);

                expect(deletedNotification.id).toBe(notificationIdToDelete);

                const notificationsAfterDeletion = await notificationRepo.getNotifications(
                    {
                        filters: {
                            userId: '2',
                        },
                        withCount: true,
                    },
                    ctx,
                );

                expect(notificationsAfterDeletion.totalCount).toBe(user2Notifications.length - 1);
                expect(notificationsAfterDeletion.list.map(n => n.id)).not.toContain(notificationIdToDelete);
            });
        });
    });
});
