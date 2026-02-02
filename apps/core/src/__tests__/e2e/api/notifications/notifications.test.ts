// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('Notifications', () => {
    let notificationId1: string;
    let notificationId2: string;

    beforeAll(async () => {
        const res1 = await makeGraphQlCall(`mutation {
                fakePluginCreateNotification(title: "notification test") 
            }`);

        const res2 = await makeGraphQlCall(`mutation {
                fakePluginCreateNotification(title: "notification test 2") 
            }`);

        notificationId1 = res1.data.data.fakePluginCreateNotification;
        notificationId2 = res2.data.data.fakePluginCreateNotification;
    });

    test('Fetch notifications', async () => {
        const res = await makeGraphQlCall(`{
            notifications {
                totalCount
                list {
                    id
                    title
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.notifications.totalCount).not.toBeUndefined();
        expect(res.data.data.notifications.list).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: notificationId1,
                    title: 'notification test',
                }),
                expect.objectContaining({
                    id: notificationId2,
                    title: 'notification test 2',
                }),
            ]),
        );
    });

    test('Delete a notification', async () => {
        const res = await makeGraphQlCall(`mutation {
            deleteNotification(notificationId: "${notificationId1}") {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteNotification.id).toBe(notificationId1);
    });

    test('Delete all notifications', async () => {
        const res = await makeGraphQlCall(`mutation {
            deleteAllNotifications {
                id
                title
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteAllNotifications).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: notificationId2,
                    title: 'notification test 2',
                }),
            ]),
        );
    });
});
