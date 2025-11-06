// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useNotificationSubscription} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitSpace, useKitNotification} from 'aristid-ds';
import dayjs from 'dayjs';
import {FaDownload} from 'react-icons/fa';

export const useNotificationsSubscription = () => {
    const {t} = useSharedTranslation();
    const {kitNotification} = useKitNotification();
    return useNotificationSubscription({
        onData: ({data}) => {
            if (!data?.data?.notification?.title) {
                return;
            }
            const {level, title, message, attachments, relatedEntities, date} = data.data.notification;

            const kitNotificationLevel = typeof kitNotification[level] === 'function' ? level : 'open';

            kitNotification[kitNotificationLevel]({
                message: title,
                description: message,
                messageExtra: dayjs.unix(date).format('HH:mm DD/MM/YYYY'), // messageExtra not displayed !
                duration: 10,
                btn: (
                    <KitSpace direction="horizontal" size="xs">
                        {attachments?.map(attachment => (
                            <KitButton
                                key={attachment.url}
                                type="secondary"
                                onClick={() => window.open(attachment.url, '_blank')}
                                icon={<FaDownload />}
                            >
                                {t('global.download')}
                            </KitButton>
                        ))}
                        {relatedEntities?.map(relatedEntity => (
                            <KitButton
                                key={relatedEntity.url}
                                type="secondary"
                                onClick={() => {
                                    window.location.href = relatedEntity.url;
                                }}
                            >
                                {t('global.show')}
                            </KitButton>
                        ))}
                    </KitSpace>
                ),
            });
        },
    });
};

export default useNotificationsSubscription;
