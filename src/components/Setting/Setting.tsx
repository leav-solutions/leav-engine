// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseOutlined} from '@ant-design/icons';
import {Card, Col, PageHeader, Row, Select, Switch} from 'antd';
import React, {useState} from 'react';
import {useThemeSwitcher} from 'react-css-theme-switcher';
import {useTranslation} from 'react-i18next';
import {useLang} from '../../hooks/LangHook/LangHook';
import {AvailableLanguage} from '../../_types/types';

function Setting(): JSX.Element {
    const {t, i18n: i18nClient} = useTranslation();

    const {switcher, themes} = useThemeSwitcher();
    const [darkMode, setDarkMode] = useState(false);

    const [{lang, availableLangs}, updateLang] = useLang();

    const langOption = availableLangs.map((l: string) => ({
        key: l,
        value: l,
        text: l
    }));

    const toggleTheme = () => {
        switcher({theme: !darkMode ? themes.dark : themes.light});
        setDarkMode(mode => !mode);
    };

    const changeLang = (value: string) => {
        i18nClient.changeLanguage(value ?? (lang[0] as any));

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

    const themeName = darkMode ? t('settings.name-theme-dark') : t('settings.name-theme-light');
    return (
        <div style={{padding: '1rem'}}>
            <PageHeader title={t('settings.header')} />
            <Row gutter={[8, 8]}>
                <Col span={4}>
                    <Card title={t('settings.choose-lang')} hoverable={true}>
                        <Select defaultValue={lang[0]} onChange={value => changeLang(value.toString())}>
                            {langOption.map(lang => (
                                <Select.Option key={lang.key} value={lang.value}>
                                    {lang.text}
                                </Select.Option>
                            ))}
                        </Select>
                    </Card>
                </Col>

                <Col span={4}>
                    <Card title={t('settings.choose-theme')} hoverable={true}>
                        <Row gutter={8}>
                            <Col>{t('settings.current-theme', {theme: themeName})}</Col>
                            <Col>
                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    defaultChecked={darkMode}
                                    onChange={toggleTheme}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Setting;
