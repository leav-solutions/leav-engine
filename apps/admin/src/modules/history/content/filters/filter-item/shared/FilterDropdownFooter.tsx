// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitDivider} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClockRotateLeft} from '@fortawesome/free-solid-svg-icons';
import {filterDropdownFooterContainer, filterDropdownFooterDivider} from './FilterDropdownFooter.module.css';

type FilterDropdownFooterProps = {
    onReset: () => void;
    hideDivider?: boolean;
};

export const FilterDropdownFooter = ({onReset, hideDivider = false}: FilterDropdownFooterProps) => {
    const {t} = useTranslation();

    return (
        <div className={filterDropdownFooterContainer}>
            {!hideDivider && <KitDivider className={filterDropdownFooterDivider} />}
            <KitButton type="action" icon={<FontAwesomeIcon icon={faClockRotateLeft} />} onClick={onReset}>
                {t('admin.reset')}
            </KitButton>
        </div>
    );
};
