// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IPubSubNotificationData} from '_types/eventsManager';
import {type Client as GraphqlWsClient} from 'graphql-ws';
import {NOTIFICATION_EMAIL_TASK_ID_HEADER} from '../../../_constants/notifications';
import {waitGraphqlWebSocketMessage} from './e2eUtils';
import {type IMailpitMsgFull, waitMailpitMessage} from './mailpitUtils';

export const waitWebSocketNotification = (graphqlClient: GraphqlWsClient, taskId: string) =>
    waitGraphqlWebSocketMessage<Pick<IPubSubNotificationData, 'notification'>>(
        graphqlClient,
        subscriptionGraphqlQuery,
        {},
        data => data?.notification?.taskId === taskId,
        {timeoutMs: 20000},
    );

export const waitEmailNotification = async (taskId: string): Promise<IMailpitMsgFull> =>
    waitMailpitMessage(msg => msg.Headers[NOTIFICATION_EMAIL_TASK_ID_HEADER]?.[0] === taskId);

const subscriptionGraphqlQuery = `
        subscription {
            notification {
                level
                message
                title
                date
                attachments {
                    label
                    url
                }
                relatedEntities {
                    label
                    url
                }
                taskId
            }
        }
    `;
