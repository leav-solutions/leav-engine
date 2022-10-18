// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowRightOutlined, UndoOutlined} from '@ant-design/icons';
import {Button, Space} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import ValuesVersionConfigurator from 'components/shared/ValuesVersionConfigurator';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {IValuesVersion} from '_types/types';

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 3em 1fr 3em;
    height: 100%;
`;

const Header = styled.div`
    background-color: ${themingVar['@leav-view-panel-background-title']};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themingVar['@divider-color']};
`;

const Footer = styled(Space)`
    background-color: ${themingVar['@leav-view-panel-background-title']};
    border-top: 1px solid ${themingVar['@divider-color']};
    justify-content: flex-end;
    padding: 0.3rem;
`;

const CloseButton = styled(ArrowRightOutlined)`
    cursor: pointer;
    background: none;
    box-shadow: none;
    margin: 0.5rem;
`;

function ValuesVersions(): JSX.Element {
    const {t} = useTranslation();
    const {state, dispatch} = useEditRecordReducer();
    const [selectedVersion, setSelectedVersion] = useState<IValuesVersion>(state.valuesVersion);

    const _handleVersionChange = (version: IValuesVersion) => {
        setSelectedVersion(version);
    };

    const _handleClosePanel = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
            content: 'summary'
        });
    };

    const _handleClickApply = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_VALUES_VERSION,
            valuesVersion: selectedVersion
        });
    };

    const _handleClickReset = () => {
        setSelectedVersion(state.valuesVersion);
    };

    return (
        <Wrapper>
            <Header>
                <span>{t('values_version.title')}</span>
                <CloseButton onClick={_handleClosePanel} />
            </Header>
            <ValuesVersionConfigurator
                libraryId={state.record.library.id}
                selectedVersion={selectedVersion}
                onVersionChange={_handleVersionChange}
            />
            <Footer>
                <Button icon={<UndoOutlined />} onClick={_handleClickReset} />
                <Button type="primary" onClick={_handleClickApply}>
                    {t('values_version.apply')}
                </Button>
            </Footer>
        </Wrapper>
    );
}

export default ValuesVersions;
