// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IList} from '_types/list';
import {type IQueryInfos} from '_types/queryInfos';
import {type IGetCoreEntitiesParams} from '_types/shared';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type INotification} from '../../_types/notification';

export const NOTIFICATIONS_COLLECTION_NAME = 'core_notifications';

export interface INotificationRepo {
    createNotification(notification: INotification, ctx: IQueryInfos): Promise<INotification>;
    getNotifications(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<INotification>>;
    deleteNotificationById(notificationId: string, ctx: IQueryInfos): Promise<INotification>;
    deleteNotificationsByRecipientUserId(recipientUserId: string, ctx: IQueryInfos): Promise<INotification[]>;
}

export interface INotificationRepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: INotificationRepoDeps): INotificationRepo {
    return {
        async createNotification(notification: INotification, ctx: IQueryInfos): Promise<INotification> {
            const collection = dbService.db.collection(NOTIFICATIONS_COLLECTION_NAME);
            const docToInsert = dbUtils.convertToDoc(notification);

            const newNotification = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collection} RETURN NEW`,
                ctx,
            });

            return dbUtils.cleanup(newNotification[0]);
        },
        async getNotifications(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<INotification>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null,
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<INotification>({
                ...initializedParams,
                collectionName: NOTIFICATIONS_COLLECTION_NAME,
                customFilterConditions: {
                    recipientUserId: (filterKey, filterVal) => aql`el.${filterKey} == ${filterVal}`,
                },
                ctx,
            });
        },
        async deleteNotificationById(notificationId: string, ctx: IQueryInfos): Promise<INotification> {
            const collection = dbService.db.collection(NOTIFICATIONS_COLLECTION_NAME);

            const deletedNotification = await dbService.execute({
                query: aql`REMOVE ${{
                    _key: notificationId,
                }} IN ${collection} RETURN OLD`,
                ctx,
            });

            return dbUtils.cleanup(deletedNotification[0]);
        },
        async deleteNotificationsByRecipientUserId(
            recipientUserId: string,
            ctx: IQueryInfos,
        ): Promise<INotification[]> {
            const collection = dbService.db.collection(NOTIFICATIONS_COLLECTION_NAME);

            const deletedNotifications = await dbService.execute({
                query: aql`
                    FOR notification IN ${collection}
                        FILTER notification.recipientUserId == ${recipientUserId}
                        REMOVE notification IN ${collection}
                        RETURN OLD`,
                ctx,
            });

            return deletedNotifications.map(dbUtils.cleanup) as INotification[];
        },
    };
}
