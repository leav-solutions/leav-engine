import {useNotificationSubscription} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitSpace, KitNotification, KitTypography} from 'aristid-ds';
import dayjs from 'dayjs';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {SUBSCRIPTION_NOTIFICATION_DURATION} from '_ui/constants';

export const useNotificationsSubscription = () => {
    const {t} = useSharedTranslation();
    return useNotificationSubscription({
        onData: ({data}) => {
            if (!data?.data?.notification?.title) {
                return;
            }
            const {level, title, message, attachments, relatedEntities, date} = data.data.notification;
            const kitNotificationLevel = typeof KitNotification[level] === 'function' ? level : 'info';

            KitNotification[kitNotificationLevel]({
                closable: true,
                message: title,
                description: message,
                messageExtra: (
                    <KitTypography.Text size="fontSize7">
                        {dayjs.unix(date).format('HH:mm DD/MM/YYYY')}
                    </KitTypography.Text>
                ),
                duration: SUBSCRIPTION_NOTIFICATION_DURATION,
                footer: (
                    <KitSpace direction="horizontal" size="xs">
                        {attachments?.map(attachment => (
                            <KitButton
                                key={attachment.url}
                                type="secondary"
                                onClick={() => window.open(attachment.url, '_blank')}
                                icon={<FontAwesomeIcon icon={faDownload} />}
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
                                {relatedEntity.label ?? t('global.show')}
                            </KitButton>
                        ))}
                    </KitSpace>
                ),
            });
        },
    });
};

export default useNotificationsSubscription;
