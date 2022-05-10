// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FlagOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

function LangSwitcher(): JSX.Element {
    const {t} = useTranslation();
    const {availableLangs, setLang} = useLang();

    const _handleLangChange = (lang: string) => () => {
        setLang(lang);
    };

    const unicodeFlagByLang = {
        fr: '🇫🇷',
        en: '🇬🇧'
    };

    return (
        <Wrapper>
            <FlagOutlined style={{marginRight: '1em'}} />
            {t('choose_lang')} :
            {availableLangs.map(l => (
                <Button type="text" name={l} key={l} style={{padding: '0 5px'}} onClick={_handleLangChange(l)}>
                    {unicodeFlagByLang[l] ?? l}
                </Button>
            ))}
        </Wrapper>
    );
}

export default LangSwitcher;
