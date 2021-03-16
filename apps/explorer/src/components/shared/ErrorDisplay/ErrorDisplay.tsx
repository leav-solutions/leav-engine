// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Result} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface IErrorProps {
    message: string;
}

function ErrorDisplay({message}: IErrorProps): JSX.Element {
    const {t} = useTranslation();

    return <Result title={t('error.error_occurred')} subTitle={message} status="error" />;
}

export default ErrorDisplay;
