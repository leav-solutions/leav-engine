// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Col, Row} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setNotificationBase} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import {IBaseNotification, NotificationType} from '_types/types';
import LibrariesList from './LibrariesList';
import TreeList from './TreeList';

function Home(): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const dispatch = useAppDispatch();
    const currentApp = useApplicationContext();

    useEffect(() => {
        const baseNotification: IBaseNotification = {
            content: t('notification.base-message', {appLabel: localizedTranslation(currentApp.label, lang)}),
            type: NotificationType.basic
        };
        dispatch(setNotificationBase(baseNotification));
    }, [t, dispatch]);

    return (
        <Row gutter={10} style={{paddingBottom: '1rem'}}>
            <Col span={12} data-testid="libraries-list">
                <LibrariesList />
            </Col>
            <Col span={12} data-testid="trees-list">
                <TreeList />
            </Col>
        </Row>
    );
}

export default Home;
