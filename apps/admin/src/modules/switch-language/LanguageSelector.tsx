import {KitSelect} from 'aristid-ds';
import {type ComponentProps, type FunctionComponent} from 'react';
import {FlagIcon} from 'react-flag-kit';
import {useTranslation} from 'react-i18next';
import {type AvailableLanguage} from '../../_gqlTypes';
import useLang from '../../hooks/useLang';
import {flagIcon, select} from './languageSelector.module.css';

const flagWidth = 20;

// i18n returns a string in 'en' or 'en-GB' format, we only keep the radical part
const getLanguageRadical = (language: string) => language?.split('-')[0];

const getFlagCode = (lang: string): ComponentProps<typeof FlagIcon>['code'] =>
    lang === 'EN' ? 'GB' : (lang as ComponentProps<typeof FlagIcon>['code']);

const getLanguageOptions = (availableLangs: string[]): ComponentProps<typeof KitSelect>['options'] =>
    availableLangs.map(lang => ({
        value: lang.toLowerCase(),
        label: lang,
        icon: <FlagIcon code={getFlagCode(lang)} size={flagWidth} className={flagIcon} />,
    }));

export const LanguageSelector: FunctionComponent = () => {
    const {i18n} = useTranslation();
    const {availableLangs, setLang} = useLang();

    const defaultLanguage = getLanguageRadical(i18n.language);
    const options = getLanguageOptions(availableLangs.map(lang => lang.toUpperCase()));

    const _handleChange = (value: string) => {
        i18n.changeLanguage(value);
        setLang([value, value] as AvailableLanguage[]);
    };

    return (
        <KitSelect
            className={select}
            onChange={_handleChange}
            options={options}
            allowClear={false}
            defaultValue={defaultLanguage}
            size="middle"
        />
    );
};
