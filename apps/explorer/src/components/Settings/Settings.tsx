// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Card, Col, Row, Select, Modal, Button} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useLang} from '../../hooks/LangHook/LangHook';
import {AvailableLanguage} from '../../_types/types';

interface ISettingsProps {
    visible: boolean;
    onClose: () => void;
}

function Settings({visible, onClose}: ISettingsProps): JSX.Element {
    const {t, i18n: i18nClient} = useTranslation();

    const [{lang, availableLangs}, updateLang] = useLang();

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

        updateLang({
            lang: newLang,
            defaultLang
        });
    };

    return (
        <Modal
            visible={visible}
            onCancel={onClose}
            title={t('settings.header')}
            centered
            width="70rem"
            footer={[
                <Button key="Close" onClick={onClose}>
                    {t('global.close')}
                </Button>
            ]}
        >
            <Row gutter={[8, 8]}>
                <Col span={4}>
                    <Card title={t('settings.choose-lang')} hoverable>
                        <Select defaultValue={lang[0]} onChange={value => changeLang(value.toString())}>
                            {langOption.map(langOpt => (
                                <Select.Option key={langOpt.key} value={langOpt.value}>
                                    {langOpt.text}
                                </Select.Option>
                            ))}
                        </Select>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
}

export default Settings;
