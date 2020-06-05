import {useQuery} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Container, Dropdown, DropdownProps, Header, Segment} from 'semantic-ui-react';
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

    const changeLang = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        i18nClient.changeLanguage(data.value ?? (lang[0] as any));

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
        <Container>
            <Header>{t('settings.header')}</Header>

            <Segment>
                <Dropdown selection fluid options={langOption} defaultValue={lang[0]} onChange={changeLang} />
            </Segment>
        </Container>
    );
}

export default Setting;
