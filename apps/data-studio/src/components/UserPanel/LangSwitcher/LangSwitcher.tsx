// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FlagOutlined} from '@ant-design/icons';
import {useLang} from '@leav/ui';
import {Button} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

function LangSwitcher(): JSX.Element {
    const {t} = useTranslation();
    const {availableLangs, setLang} = useLang();

    const unicodeFlagByLang = {
        fr: '🇫🇷',
        en: '🇬🇧'
    };

    const _handleLangChange = (lang: string) => () => {
        setLang(lang);
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
