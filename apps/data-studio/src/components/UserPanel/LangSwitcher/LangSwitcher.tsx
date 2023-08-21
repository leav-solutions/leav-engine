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
    const {lang: userLang, availableLangs, setLang} = useLang();

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
            {t('settings.choose-lang')}
            <div style={{marginInlineStart: '10px'}}>
                {availableLangs.map(l => (
                    <Button
                        size="small"
                        shape="circle"
                        type={l === userLang[0] ? 'default' : 'text'}
                        name={l}
                        key={l}
                        style={{padding: '5 5px'}}
                        onClick={_handleLangChange(l)}
                        icon={unicodeFlagByLang[l] ?? l}
                    />
                ))}
            </div>
        </Wrapper>
    );
}

export default LangSwitcher;
