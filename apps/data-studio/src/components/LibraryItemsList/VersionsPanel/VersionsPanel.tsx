// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Button} from 'antd';
import {IconClosePanel} from 'assets/icons/IconClosePanel';
import ValuesVersionConfigurator from 'components/shared/ValuesVersionConfigurator';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import {IValueVersion, TypeSideItem} from '_types/types';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themeVars.borderLightColor} 1px solid;
    overflow-y: auto;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themeVars.headerBg};
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themeVars.borderLightColor};

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
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const _handleHidePanel = () => {
        dispatch(
            setDisplaySide({
                visible: false,
                type: TypeSideItem.versions
            })
        );
    };

    const _handleVersionChange = (version: IValueVersion) => {
        searchDispatch({
            type: SearchActionTypes.SET_VALUES_VERSIONS,
            valuesVersions: version
        });
    };

    return (
        <Wrapper>
            <Header>
                <span>{t('values_version.title')}</span>
                <Button onClick={_handleHidePanel} icon={<IconClosePanel />}></Button>
            </Header>
            <ValuesVersionConfigurator
                libraryId={activeLibrary.id}
                selectedVersion={searchState.valuesVersions}
                onVersionChange={_handleVersionChange}
            />
        </Wrapper>
    );
}

export default VersionsPanel;
