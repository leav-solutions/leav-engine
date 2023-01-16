// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {themeVars} from '@leav/ui';
import {Space} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import BasicButton from 'components/shared/BasicButton';
import ValuesVersionConfigurator from 'components/shared/ValuesVersionConfigurator';
import {useTranslation} from 'react-i18next';
import {GrUndo} from 'react-icons/gr';
import styled from 'styled-components';
import {IValueVersion} from '_types/types';

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 3em 1fr 3em;
    height: 100%;
`;

const Header = styled.div`
    background-color: ${themeVars.headerBg};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themeVars.borderLightColor};
`;

const Footer = styled(Space)`
    background-color: ${themeVars.headerBg};
    border-top: 1px solid ${themeVars.borderLightColor};
    justify-content: flex-end;
    padding: 0.3rem;
`;

const CloseButton = styled(CloseOutlined)`
    cursor: pointer;
    background: none;
    box-shadow: none;
    margin: 0.5rem;
`;

function ValuesVersions(): JSX.Element {
    const {t} = useTranslation();
    const {state, dispatch} = useEditRecordModalReducer();
    const isInCreation = !state?.record;

    const _handleVersionChange = (version: IValueVersion) => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_VALUES_VERSION,
            valuesVersion: version
        });
    };

    const _handleClosePanel = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
            content: 'summary'
        });
    };

    const _handleClickReset = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_VALUES_VERSION,
            valuesVersion: state.originValuesVersion
        });
    };

    return (
        <Wrapper>
            <Header>
                <span>{t('values_version.title')}</span>
                <span>
                    {!isInCreation && (
                        <BasicButton
                            title={t('values_version.reset')}
                            shape="circle"
                            centered
                            icon={<GrUndo />}
                            onClick={_handleClickReset}
                        />
                    )}
                    <CloseButton onClick={_handleClosePanel} />
                </span>
            </Header>
            <ValuesVersionConfigurator
                libraryId={state.libraryId}
                selectedVersion={state.valuesVersion}
                onVersionChange={_handleVersionChange}
                readOnly={isInCreation}
            />
        </Wrapper>
    );
}

export default ValuesVersions;
