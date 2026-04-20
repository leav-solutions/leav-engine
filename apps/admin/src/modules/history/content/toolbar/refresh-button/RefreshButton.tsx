// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRotateRight} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitTooltip} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';

type RefreshButtonProps = {
    loading: boolean;
    onRefresh: () => void;
};

export const RefreshButton = ({loading, onRefresh}: RefreshButtonProps) => {
    const {t} = useTranslation();

    return (
        <KitTooltip title={t('admin.refresh')} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
            <KitButton size="m" icon={<FontAwesomeIcon icon={faRotateRight} />} onClick={onRefresh} loading={loading} />
        </KitTooltip>
    );
};
