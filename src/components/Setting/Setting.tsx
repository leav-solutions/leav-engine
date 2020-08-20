import {useQuery} from '@apollo/client';
import {PageHeader, Select} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {getAvailableLangs, getLangAndDefaultLang} from '../../queries/cache/lang/getLangQuery';
import {AvailableLanguage} from '../../_types/types';

function Setting(): JSX.Element {
    const {t, i18n: i18nClient} = useTranslation();

    const {data: dataLang, client} = useQuery(getAvailableLangs);
    const {availableLangs, lang} = dataLang ?? {availableLangs: [], lang: []};

    const langOption = availableLangs.map((l: string) => ({
        key: l,
        value: l,
        text: l
    }));

    const changeLang = (value: string) => {
        i18nClient.changeLanguage(value ?? (lang[0] as any));

        // Update cache lang infos
        const newLang = [i18nClient.language, i18nClient.language];

        const defaultLang = i18nClient.language
            ? AvailableLanguage[i18nClient.language as AvailableLanguage]
            : AvailableLanguage.en;

        client.writeQuery({
            query: getLangAndDefaultLang,
            data: {
                lang: newLang,
                defaultLang
            }
        });
    };

    return (
        <div>
            <PageHeader title={t('settings.header')} />
            <label>
                <span style={{padding: 16}}>{t('settings.choose-lang')}</span>
                <Select defaultValue={lang[0]} onChange={value => changeLang(value.toString())}>
                    {langOption.map(lang => (
                        <Select.Option key={lang.key} value={lang.value}>
                            {lang.text}
                        </Select.Option>
                    ))}
                </Select>
            </label>
        </div>
    );
}

export default Setting;
