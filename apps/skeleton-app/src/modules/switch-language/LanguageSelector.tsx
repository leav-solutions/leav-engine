// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSelect} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {FlagIcon} from 'react-flag-kit';
import {useTranslation} from 'react-i18next';
import {select, flagIcon} from './LanguageSelector.module.css';

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
    const defaultLanguage = 'fr'; //getLanguageRadical(i18n.language);

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
