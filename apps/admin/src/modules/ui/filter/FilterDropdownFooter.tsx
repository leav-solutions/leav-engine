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
