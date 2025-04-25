// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSelect} from 'aristid-ds';
import {useContext, type FunctionComponent} from 'react';
import {FlagIcon} from 'react-flag-kit';
import {select, flagIcon} from './LanguageSelector.module.css';
import {LangContext} from '@leav/ui';
import {getLanguageRadical} from '../../config/translation/utils';
import {i18n} from '../../config/translation/initI18n';

const flagWidth = 20;

const getFlagCode = lang => (lang === 'en' ? 'GB' : lang.toUpperCase());

const getLanguageOptions = availableLangages =>
    availableLangages.map(lang => ({
        value: lang,
        label: lang.toUpperCase(),
        icon: <FlagIcon code={getFlagCode(lang)} size={flagWidth} className={flagIcon} />
    }));

export const LanguageSelector: FunctionComponent = () => {
    const {setLang, availableLangs} = useContext(LangContext);

    // i18n returns a string in 'en' or 'en-GB' format
    const defaultLanguage = getLanguageRadical(i18n.language);
    const options = getLanguageOptions(availableLangs);

    return (
        <KitSelect
            className={select}
            onChange={setLang}
            options={options}
            allowClear={false}
            defaultValue={defaultLanguage}
        />
    );
};
