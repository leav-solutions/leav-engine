import {KitSelect} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {FlagIcon} from 'react-flag-kit';
import {select, flagIcon} from './LanguageSelector.module.css';
import {useTranslation} from 'react-i18next';
import {getLanguageRadical} from '../translation/useI18n';

const flagWidth = 20;

const languageOptions = [
    {
        value: 'en',
        icon: <FlagIcon code="GB" size={flagWidth} className={flagIcon} />,
        label: 'EN'
    },
    {
        value: 'fr',
        icon: <FlagIcon code="FR" size={flagWidth} className={flagIcon} />,
        label: 'FR'
    }
];

export const LanguageSelector: FunctionComponent = () => {
    const {i18n} = useTranslation();

    // i18n returns a string in 'en' or 'en-GB' format
    const defaultLanguage = getLanguageRadical(i18n.language);

    const handleLanguage = (value: string) => {
        i18n.changeLanguage(value);
    };

    return (
        <KitSelect
            className={select}
            onChange={handleLanguage}
            options={languageOptions}
            allowClear={false}
            defaultValue={defaultLanguage}
        />
    );
};
