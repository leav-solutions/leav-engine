import {useQuery} from '@apollo/client';
import {Card, Select} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getAvailableLangs, getLangAndDefaultLang} from '../../queries/cache/lang/getLangQuery';
import {AvailableLanguage} from '../../_types/types';

const Wrapper = styled.div`
    margin: 1rem 0;
`;

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
            <Wrapper>
                <Card>
                    <h1>{t('settings.header')}</h1>
                    <Select onChange={value => changeLang(value.toString())}>
                        {langOption.map(lang => (
                            <Select.Option value={lang.value}>{lang.text}</Select.Option>
                        ))}
                    </Select>
                </Card>
            </Wrapper>
        </div>
    );
}

export default Setting;
