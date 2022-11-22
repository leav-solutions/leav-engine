// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FlagOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AvailableLanguage} from '_types/types';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

function LangSwitcher(): JSX.Element {
    const {t, i18n: i18nClient} = useTranslation();
    const [{availableLangs}, updateLang] = useLang();

    const unicodeFlagByLang = {
        fr: '🇫🇷',
        en: '🇬🇧'
    };

    const _handleLangChange = (lang: string) => () => {
        i18nClient.changeLanguage(lang);

        // Update cache lang infos
        const newLang = [i18nClient.language, i18nClient.language];

        const defaultLang = i18nClient.language
            ? AvailableLanguage[i18nClient.language as AvailableLanguage]
            : AvailableLanguage.en;

        updateLang({
            lang: newLang,
            defaultLang
        });
    };

    return (
        <Wrapper>
            <FlagOutlined />
            {t('settings.choose-lang')} :
            {availableLangs.map(l => (
                <Button type="text" name={l} key={l} style={{padding: '0 5px'}} onClick={_handleLangChange(l)}>
                    {unicodeFlagByLang[l] ?? l}
                </Button>
            ))}
        </Wrapper>
    );
}

export default LangSwitcher;
