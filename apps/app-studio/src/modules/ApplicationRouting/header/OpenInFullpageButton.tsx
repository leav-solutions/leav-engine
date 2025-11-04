// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {faUpRightAndDownLeftFromCenter} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';
import {KitButton, KitTooltip} from 'aristid-ds';
import {generatePath, useNavigate} from 'react-router-dom';
import {RelativePaths} from '../router/paths';
import {useTranslation} from 'react-i18next';

interface IOpenInFullpageButtonProps {
    recordId: string;
    recordPanelId: string;
}

export const OpenInFullpageButton: FunctionComponent<IOpenInFullpageButtonProps> = ({recordId, recordPanelId}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    return (
        <KitTooltip title={t('global.full_page')} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
            <KitButton
                size="m"
                aria-label={t('global.full_page')}
                icon={<FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />}
                onClick={() => {
                    navigate(
                        generatePath(RelativePaths.openCurrentPanelInFullpage, {
                            recordId,
                            recordPanelId
                        }),
                        {relative: 'path'}
                    );
                }}
            />
        </KitTooltip>
    );
};
