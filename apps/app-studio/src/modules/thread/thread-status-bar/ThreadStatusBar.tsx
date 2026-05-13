import {useTranslation} from 'react-i18next';
import {useUpdateStatus} from '../thread-actions/useUpdateStatus';
import {KitIdCard, KitSelect} from 'aristid-ds';
import {useThreadStatusOptions} from '../useThreadStatusOption/useThreadStatusOptions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {statusBar, statusSelect} from './threadStatusBar.module.css';
import './status-colors.css';

export const StatusBar = ({threadId, threadStatusId}: {threadId: string; threadStatusId: string | undefined}) => {
    const {t} = useTranslation();
    const {status, updateStatus} = useUpdateStatus({threadId, threadStatusId});
    const statuses = useThreadStatusOptions();

    const onChangeSelect = async (optionValue?: string | null) => {
        if (optionValue) {
            await updateStatus(optionValue);
        }
    };

    return (
        <div className={statusBar}>
            <KitIdCard
                avatarProps={{
                    shape: 'square',
                    icon: <FontAwesomeIcon icon="comment" />,
                }}
                title={t('threads.status')}
            />
            <KitSelect
                allowClear={false}
                onChange={onChangeSelect}
                options={statuses}
                value={status}
                className={statusSelect}
            />
        </div>
    );
};
