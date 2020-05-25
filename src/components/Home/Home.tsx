import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';

function Home(): JSX.Element {
    const {t} = useTranslation();

    return (
        <div>
            <Header>{t('home.title')}</Header>
        </div>
    );
}

export default Home;
