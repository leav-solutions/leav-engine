// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLang} from '@leav/ui';
import {Button} from 'antd';
import {useTranslation} from 'react-i18next';

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
        <>
            {t('choose_lang')} :
            {availableLangs.map(l => (
                <Button
                    type="text"
                    name={l}
                    aria-label={l}
                    key={l}
                    data-test-id={`lang-switcher-${l}`}
                    style={{padding: '0 5px'}}
                    onClick={_handleLangChange(l)}
                >
                    {unicodeFlagByLang[l] ?? l}
                </Button>
            ))}
        </>
    );
}

export default LangSwitcher;
