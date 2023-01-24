// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Col, Row} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {useLang} from 'hooks/LangHook/LangHook';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'redux/infos';
import {useAppDispatch} from 'redux/store';
import {IBaseInfo, InfoType} from '_types/types';
import LibrariesList from './LibrariesList';
import TreeList from './TreeList';

function Home(): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const dispatch = useAppDispatch();
    const appData = useApplicationContext();

    useEffect(() => {
        const baseInfo: IBaseInfo = {
            content: t('info.base-message', {
                appLabel: `${appData.globalSettings.name} - ${localizedTranslation(appData.currentApp.label, lang)}`,
                interpolation: {escapeValue: false}
            }),
            type: InfoType.basic
        };
        dispatch(setInfoBase(baseInfo));
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
