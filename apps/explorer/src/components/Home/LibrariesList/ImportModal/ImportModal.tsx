// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, LoadingOutlined, RightOutlined} from '@ant-design/icons';
import {ServerError, useLazyQuery, useMutation} from '@apollo/client';
import {message, Space, Steps} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import useGetLibrariesListQuery from 'hooks/useGetLibrariesListQuery/useGetLibrariesListQuery';
import React, {ReactNode, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ImportType} from '_gqlTypes/globalTypes';
import {IMPORT_EXCEL, IMPORT_EXCELVariables} from '_gqlTypes/IMPORT_EXCEL';
import {getAttributesByLibQuery} from '../../../../graphQL/queries/attributes/getAttributesByLib';
import {importExcel} from '../../../../graphQL/queries/import/importExcel';
import {GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import ImportModalConfigStep from './ImportModalConfigStep';
import ImportModalDoneStep from './ImportModalDoneStep';
import ImportModalProcessingStep from './ImportModalProcessingStep';
import ImportModalSelectFileStep from './ImportModalSelectFileStep';
import importReducer from './importReducer';
import {ImportReducerActionTypes, initialState} from './importReducer/importReducer';
import ImportReducerContext from './importReducer/ImportReducerContext';
import {ImportSteps} from './_types';

const {Step} = Steps;

export interface IImportModalProps {
    open: boolean;
    onClose: () => void;
    library?: string;
}
const Content = styled.div`
    margin-top: 2em;
`;

function ImportModal({onClose, library, open}: IImportModalProps): JSX.Element {
    const {t} = useTranslation();

    const [state, dispatch] = useReducer(importReducer, {...initialState, defaultLibrary: library});
    const {sheets, file, currentStep, okBtn} = state;

    // get libraries list
    const librariesListQuery = useGetLibrariesListQuery();

    if (librariesListQuery.error) {
        return <ErrorDisplay message={librariesListQuery.error?.message} />;
    }

    const libraries = librariesListQuery.data?.libraries?.list ?? [];

    // Retrieve attributes list
    const [runGetAttributes] = useLazyQuery<GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables>(
        getAttributesByLibQuery,
        {
            onError: error => message.error(error.message)
        }
    );

    const [runImport, {error: importError}] = useMutation<IMPORT_EXCEL, IMPORT_EXCELVariables>(importExcel, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            dispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});
        },
        onError: error => {
            // Extract human friendly error message
            let errorMessage = error?.message;
            const serverErrors = (error?.networkError as ServerError)?.result?.errors ?? [];
            if (serverErrors.length) {
                errorMessage = serverErrors.map(serverError => serverError.message).join('\n');
            }

            dispatch({type: ImportReducerActionTypes.SET_IMPORT_ERROR, importError: errorMessage});
            dispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});
        }
    });

    const _runImport = async () => {
        dispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.PROCESSING});

        try {
            await runImport({
                variables: {
                    file,
                    sheets: sheets
                        .filter(sheet => sheet.type !== ImportType.IGNORE)
                        .map(sheet => ({
                            type: sheet.type,
                            mode: sheet.mode,
                            library: sheet.library,
                            mapping: sheet.mapping,
                            keyIndex: Number(sheet.keyColumnIndex),
                            linkAttribute: sheet.linkAttribute,
                            keyToIndex: Number(sheet.keyToColumnIndex),
                            treeLinkLibrary: sheet.treeLinkLibrary
                        }))
                }
            });
        } catch (err) {
            dispatch({type: ImportReducerActionTypes.SET_IMPORT_ERROR, importError: (err as Error).message});
        } finally {
            dispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});
        }
    };

    const _onOk = async () => {
        switch (currentStep) {
            case ImportSteps.SELECT_FILE:
                dispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.CONFIG});
                break;
            case ImportSteps.CONFIG:
                await _runImport();
                break;
            default:
                onClose();
                return;
        }
    };

    const validateButtonText: {[key in ImportSteps]: string} = {
        [ImportSteps.SELECT_FILE]: 'import.file_configuration',
        [ImportSteps.CONFIG]: 'import.start',
        [ImportSteps.PROCESSING]: 'global.close',
        [ImportSteps.DONE]: 'global.close'
    };

    const validateButtonIcon: {[key in ImportSteps]: ReactNode} = {
        [ImportSteps.SELECT_FILE]: <RightOutlined />,
        [ImportSteps.CONFIG]: <CheckOutlined />,
        [ImportSteps.PROCESSING]: null,
        [ImportSteps.DONE]: null
    };

    const validateButtonLabel = (
        <Space>
            {t(validateButtonText[currentStep])}
            {validateButtonIcon[currentStep]}
        </Space>
    );

    const _handleGetAttributes = async (attributesLib: string) => {
        const {error, data} = await runGetAttributes({
            variables: {library: attributesLib}
        });

        if (error) {
            message.error(error.message);
        }

        return (data?.attributes?.list ?? []).filter(attribute => !attribute.system || attribute.id === 'id');
    };

    const _getStepContent = (): JSX.Element => {
        switch (currentStep) {
            case ImportSteps.SELECT_FILE:
                return <ImportModalSelectFileStep onGetAttributes={_handleGetAttributes} />;
            case ImportSteps.CONFIG:
                return <ImportModalConfigStep libraries={libraries} onGetAttributes={_handleGetAttributes} />;
            case ImportSteps.PROCESSING:
                return <ImportModalProcessingStep />;
            case ImportSteps.DONE:
                return <ImportModalDoneStep />;
        }
    };

    // Generate a recap of all settings errors, by sheet. This will be set as button title, thus we generate a raw string
    const buttonTitle =
        currentStep === ImportSteps.CONFIG
            ? Object.keys(state.settingsError)
                  .reduce((errorMessage, sheetKey) => {
                      if (state.settingsError[sheetKey]) {
                          let sheetErrorMessage = `${sheetKey}:\n`;
                          sheetErrorMessage +=
                              '\t' +
                              state.settingsError[sheetKey]
                                  .map(error => t(`import.settings_errors.${error}`))
                                  .join('\n\t');
                          errorMessage.push(sheetErrorMessage);
                      }

                      return errorMessage;
                  }, [])
                  .join('\n')
            : '';

    return (
        <ImportReducerContext.Provider value={{state, dispatch}}>
            <Modal
                title={t('import.title')}
                okText={validateButtonLabel}
                cancelText={t('global.cancel')}
                onOk={_onOk}
                onCancel={onClose}
                visible={open}
                closable
                width="90vw"
                centered
                confirmLoading={currentStep === ImportSteps.PROCESSING}
                bodyStyle={{height: 'calc(100vh - 10rem)'}}
                okButtonProps={{disabled: !okBtn, className: 'submit-btn', title: buttonTitle}}
                cancelButtonProps={{disabled: currentStep === ImportSteps.DONE}}
                destroyOnClose={true}
            >
                <Steps current={currentStep} style={{marginBottom: '2em'}}>
                    <Step title={t('import.file_selection')}></Step>
                    <Step title={t('import.file_configuration')}></Step>
                    <Step
                        title={t('import.in_progress')}
                        icon={currentStep === ImportSteps.PROCESSING ? <LoadingOutlined /> : null}
                    ></Step>
                    <Step title={t('import.import_done')} status={importError ? 'error' : undefined}></Step>
                </Steps>
                <Content>{_getStepContent()}</Content>
            </Modal>
        </ImportReducerContext.Provider>
    );
}

export default ImportModal;
