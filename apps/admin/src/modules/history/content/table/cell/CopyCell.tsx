// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy} from '@fortawesome/free-solid-svg-icons';
import {KitAlert, KitButton, KitSpace, KitTooltip} from 'aristid-ds';
import {copyCellIcon} from './copyCell.module.css';
import {useTranslation} from 'react-i18next';

type CopyCellProps = {
    cellName: string;
    value: string;
};

// When leav/ui will be added to the admin dependencies, we will be able to use the SUCCESS_ALERT_DURATION constant
// I don't want to add it now just for this
const SUCCESS_ALERT_DURATION = 3_000;

export const CopyCell = ({cellName, value}: CopyCellProps) => {
    const {t} = useTranslation();

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        KitAlert.success({
            message: t('logs.table.cell.copy_success', {cellName}),
            description: null,
            duration: SUCCESS_ALERT_DURATION,
            showIcon: true,
            closable: true,
        });
    };

    return (
        <KitSpace direction="horizontal" size="s">
            {value}
            <KitTooltip title={t('logs.table.cell.copy')} placement="bottom">
                <KitButton
                    className={copyCellIcon}
                    type="tertiary"
                    size="s"
                    icon={<FontAwesomeIcon icon={faCopy} />}
                    onClick={handleCopy}
                />
            </KitTooltip>
        </KitSpace>
    );
};
