// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {IconClosePanel} from 'assets/icons/IconClosePanel';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useLibraryVersionTrees from 'hooks/useLibraryVersionTrees';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {TypeSideItem} from '_types/types';
import VersionTree from './VersionTree';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themingVar['@divider-color']} 1px solid;
    overflow-y: auto;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themingVar['@leav-view-panel-background-title']};
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themingVar['@divider-color']};

    & > * {
        :first-of-type {
            display: grid;
            column-gap: 8px;
            grid-template-columns: repeat(3, auto);
            align-items: center;
            justify-items: center;
        }

        :last-of-type {
            display: grid;
            align-items: center;
            justify-content: flex-end;
            column-gap: 8px;
            grid-template-columns: repeat(2, auto);
        }
    }
`;

function VersionsPanel(): JSX.Element {
    const {t} = useTranslation();

    const [activeLibrary] = useActiveLibrary();
    const dispatch = useAppDispatch();

    const {loading, error, trees} = useLibraryVersionTrees(activeLibrary.id);

    const _handleHidePanel = () => {
        dispatch(
            setDisplaySide({
                visible: false,
                type: TypeSideItem.versions
            })
        );
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <Wrapper>
            <Header>
                <span>{t('values_version.title')}</span>
                <Button onClick={_handleHidePanel} icon={<IconClosePanel />}></Button>
            </Header>
            {trees.map(tree => (
                <VersionTree key={tree.id} tree={tree} />
            ))}
        </Wrapper>
    );
}

export default VersionsPanel;
