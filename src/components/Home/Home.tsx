// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';

function Home(): JSX.Element {
    const {t} = useTranslation();

    return (
        <div>
            <h1>{t('home.title')}</h1>
        </div>
    );
}

export default Home;
