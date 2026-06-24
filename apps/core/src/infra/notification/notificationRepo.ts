/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {aql} from 'arangojs';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type INotification, type INotificationTrackingEvent} from '../../_types/notification';
import {type IDbDocument} from '../db/_types';

export const NOTIFICATIONS_COLLECTION_NAME = 'core_notifications';

export type ICreateNotificationInRepo = Omit<INotification, 'id'>;

export type INotificationFilterOptionsInRepo = ICoreEntityFilterOptions &
    Partial<Pick<INotificationBaseDocument, 'userId'>>;

export type IGetNotificationParams = IGetCoreEntitiesParams & {
    filters?: INotificationFilterOptionsInRepo;
};

export interface INotificationRepo {
    createNotification(notification: ICreateNotificationInRepo, ctx: IQueryInfos): Promise<INotification>;
    getNotifications(params: IGetNotificationParams, ctx: IQueryInfos): Promise<IList<INotification>>;
    deleteNotificationById(notificationId: string, ctx: IQueryInfos): Promise<INotification>;
    deleteNotificationsByRecipientUserId(userId: string, ctx: IQueryInfos): Promise<INotification[]>;
}

type INotificationBaseDocument = {
    date: number;
    userId: string;
    level: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    relatedEntities?: Array<{
        url: string;
        label: string;
    }>;
    attachments?: Array<{
        url: string;
        label: string;
        trackingEvent?: INotificationTrackingEvent;
    }>;
    taskId?: string;
    trackingEvents?: INotificationTrackingEvent[];
};

type INotificationDbDocument = INotificationBaseDocument & IDbDocument;

export interface INotificationRepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: INotificationRepoDeps): INotificationRepo {
    const notificationFromDbDocument = (doc: INotificationDbDocument): INotification =>
        dbUtils.cleanup<INotificationDbDocument>(doc);

    const createDocumentFromNotification = (notification: ICreateNotificationInRepo): INotificationBaseDocument =>
        notification;

    return {
        async createNotification(notification: ICreateNotificationInRepo, ctx: IQueryInfos): Promise<INotification> {
            const collection = dbService.db.collection(NOTIFICATIONS_COLLECTION_NAME);
            const docToInsert = createDocumentFromNotification(notification);

            const newNotification = await dbService.execute<INotificationDbDocument[]>({
                query: aql`INSERT ${docToInsert} IN ${collection} RETURN NEW`,
                ctx,
            });

            return notificationFromDbDocument(newNotification[0]);
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

            return dbUtils.findCoreEntity<INotification, INotificationDbDocument>({
                ...initializedParams,
                collectionName: NOTIFICATIONS_COLLECTION_NAME,
                customFilterConditions: {
                    userId: (filterKey, filterVal) => aql`el.${filterKey} == ${filterVal}`,
                },
                mapFromDbDocument: notificationFromDbDocument,
                ctx,
            });
        },
        async deleteNotificationById(notificationId: string, ctx: IQueryInfos): Promise<INotification> {
            const collection = dbService.db.collection(NOTIFICATIONS_COLLECTION_NAME);

            const deletedNotification = await dbService.execute<INotificationDbDocument[]>({
                query: aql`REMOVE ${{
                    _key: notificationId,
                }} IN ${collection} RETURN OLD`,
                ctx,
            });

            return notificationFromDbDocument(deletedNotification[0]);
        },
        async deleteNotificationsByRecipientUserId(userId: string, ctx: IQueryInfos): Promise<INotification[]> {
            const collection = dbService.db.collection(NOTIFICATIONS_COLLECTION_NAME);

            const deletedNotifications = await dbService.execute<INotificationDbDocument[]>({
                query: aql`
                    FOR notification IN ${collection}
                        FILTER notification.userId == ${userId}
                        REMOVE notification IN ${collection}
                        RETURN OLD`,
                ctx,
            });

            return deletedNotifications.map(notificationFromDbDocument);
        },
    };
}
