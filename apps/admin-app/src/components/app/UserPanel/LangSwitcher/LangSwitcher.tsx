// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {AvailableLanguage} from '_gqlTypes/globalTypes';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

function LangSwitcher(): JSX.Element {
    const {t, i18n: i18nClient} = useTranslation();
    const {availableLangs, setLang} = useLang();

    const unicodeFlagByLang = {
        fr: '🇫🇷',
        en: '🇬🇧'
    };

    const _handleLangChange = (lang: string) => () => {
        i18nClient.changeLanguage(lang);

        // Update cache lang infos
        const newLang = [i18nClient.language, i18nClient.language] as AvailableLanguage[];

        setLang(newLang);
    };

    return (
        <Wrapper>
            <Icon name="flag outline" />
            {t('admin.choose-lang')} :
            {availableLangs.map(l => (
                <Button
                    type="text"
                    name={l}
                    key={l}
                    style={{padding: '0 5px'}}
                    onClick={_handleLangChange(l)}
                    inverted
                    size="big"
                >
                    {unicodeFlagByLang[l] ?? l}
                </Button>
            ))}
        </Wrapper>
    );
}

export default LangSwitcher;
