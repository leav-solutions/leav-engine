// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {IBaseInfo, InfoType} from '_types/types';
import {Alert} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'reduxStore/infos';
import {useAppDispatch} from 'reduxStore/store';
import styled from 'styled-components';
import LibrariesList from './LibrariesList';
import TreeList from './TreeList';

// A wrapper that displays 2 elements side by side. If first element is missing, the second one goes on the left
const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding-bottom: 1rem;

    > * {
        flex-grow: 1;
    }
`;

function Home(): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
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

    if (appData?.currentApp?.settings?.libraries === 'none' && appData?.currentApp?.settings?.trees === 'none') {
        return <Alert style={{margin: '1rem'}} message={t('home.no_libraries_or_trees')} type="info" showIcon />;
    }

    return (
        <Wrapper>
            <LibrariesList />
            <TreeList />
        </Wrapper>
    );
}

export default Home;
