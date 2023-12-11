// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined, FieldTimeOutlined, RightOutlined, UploadOutlined} from '@ant-design/icons';
import {ServerError, useLazyQuery, useMutation} from '@apollo/client';
import {ErrorDisplay, Loading} from '@leav/ui';
import {Button, Dropdown, message, Modal, Space, Steps} from 'antd';
import {KitSteps} from 'aristid-ds';
import {IKitStep} from 'aristid-ds/dist/Kit/Navigation/Steps/types';
import dayjs from 'dayjs';
import {useApplicationLibraries} from 'hooks/useApplicationLibraries';
import useNotification from 'hooks/useNotification';
import {lazy, ReactNode, Suspense, useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setIsPanelOpen} from 'reduxStore/notifications';
import {useAppDispatch} from 'reduxStore/store';
import styled from 'styled-components';
import {IMPORT_EXCEL, IMPORT_EXCELVariables} from '_gqlTypes/IMPORT_EXCEL';
import {importExcel} from '../../../../graphQL/mutations/import/importExcel';
import {getAttributesByLibQuery} from '../../../../graphQL/queries/attributes/getAttributesByLib';
import {GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import ImportScheduleModal from './ImportModalConfigStep/ImportScheduleModal';
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
    height: calc(100% - 6rem);
    overflow-y: auto;
`;

const NOTIFICATION_DURATION = 2.5; // seconds

// Lazy load steps as it's using some heavy lib for XLSX handling. We don't want it to load on first load
const ImportModalSelectFileStep = lazy(() => import('./ImportModalSelectFileStep'));
const ImportModalConfigStep = lazy(() => import('./ImportModalConfigStep'));
const ImportModalProcessingStep = lazy(() => import('./ImportModalProcessingStep'));
const ImportModalDoneStep = lazy(() => import('./ImportModalDoneStep'));

function ImportModal({onClose, library, open}: IImportModalProps): JSX.Element {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const [state, importDispatch] = useReducer(importReducer, {...initialState, defaultLibrary: library});
    const {sheets, file, currentStep, okBtn} = state;

    const [showImportScheduleModal, setShowImportScheduleModal] = useState<boolean>(false);
    const [scheduleDate, setScheduleDate] = useState<dayjs.Dayjs | null>(null);

    const notification = useNotification();

    // get libraries list
    const {libraries, error: librariesError} = useApplicationLibraries();

    if (librariesError) {
        return <ErrorDisplay message={librariesError} />;
    }

    // Retrieve attributes list
    const [runGetAttributes] = useLazyQuery<GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables>(
        getAttributesByLibQuery,
        {
            fetchPolicy: 'cache-and-network',
            onError: error => message.error(error.message)
        }
    );

    const [runImport, {error: importError}] = useMutation<IMPORT_EXCEL, IMPORT_EXCELVariables>(importExcel, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            importDispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});

            notification.triggerNotification({
                message: t('import.import_notification_title'),
                ...(!!scheduleDate && {
                    description: `${t('import.import_notification_description')} ${new Date(
                        scheduleDate.unix() * 1000
                    ).toLocaleString()}`
                }),
                icon: <UploadOutlined style={{color: '#108ee9'}} />,
                onClick: _onNotificationsClick,
                duration: NOTIFICATION_DURATION
            });
        },
        onError: error => {
            // Extract human friendly error message
            let errorMessage = error?.message;
            const serverErrors = ((error?.networkError as ServerError)?.result as Record<string, any>)?.errors ?? [];
            if (serverErrors.length) {
                errorMessage = serverErrors.map(serverError => serverError.message).join('\n');
            }

            importDispatch({type: ImportReducerActionTypes.SET_IMPORT_ERROR, importError: errorMessage});
            importDispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});
        }
    });

    const _runImport = async () => {
        importDispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.PROCESSING});

        try {
            await runImport({
                variables: {
                    file,
                    sheets: sheets.map(sheet => ({
                        type: sheet.type,
                        mode: sheet.mode,
                        library: sheet.library,
                        mapping: sheet.mapping,
                        keyIndex: Number(sheet.keyColumnIndex),
                        linkAttribute: sheet.linkAttribute,
                        keyToIndex: Number(sheet.keyToColumnIndex),
                        treeLinkLibrary: sheet.treeLinkLibrary
                    })),
                    ...(!!scheduleDate && {startAt: scheduleDate.unix()})
                }
            });
        } catch (err) {
            importDispatch({type: ImportReducerActionTypes.SET_IMPORT_ERROR, importError: (err as Error).message});
        } finally {
            importDispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});
        }
    };

    const _onOk = async () => {
        switch (currentStep) {
            case ImportSteps.SELECT_FILE:
                importDispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.CONFIG});
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
        [ImportSteps.CONFIG]: null,
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

        return (data?.attributes?.list ?? []).filter(attribute => !attribute.readonly || attribute.id === 'id');
    };

    const _onNotificationsClick = () => {
        dispatch(setIsPanelOpen(true));
        onClose();
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
                return <ImportModalDoneStep onOpenPanelClick={_onNotificationsClick} />;
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

    const _onScheduleImportBtnClick = () => {
        setShowImportScheduleModal(true);
    };

    const _onCancelScheduleImport = () => {
        setShowImportScheduleModal(false);
        setScheduleDate(null);
    };

    const _onChangeScheduleImport = (date: dayjs.Dayjs) => {
        setScheduleDate(date);
    };

    const _onValidateScheduleImport = () => {
        setShowImportScheduleModal(false);
        _onOk();
    };

    const modalFooter = (
        <Space direction="horizontal">
            {currentStep === ImportSteps.CONFIG ? (
                <Dropdown.Button
                    disabled={!okBtn}
                    className="submit-btn"
                    title={buttonTitle}
                    type="primary"
                    onClick={_onOk}
                    icon={<DownOutlined />}
                    menu={{
                        items: [
                            {
                                label: t('import.import_schedule'),
                                key: '1',
                                icon: <FieldTimeOutlined />
                            }
                        ],
                        onClick: _onScheduleImportBtnClick
                    }}
                >
                    {validateButtonLabel}
                </Dropdown.Button>
            ) : (
                <Button disabled={!okBtn} className="submit-btn" title={buttonTitle} type="primary" onClick={_onOk}>
                    {validateButtonLabel}
                </Button>
            )}
            <Button disabled={currentStep === ImportSteps.DONE} onClick={onClose}>
                {t('global.cancel')}
            </Button>
        </Space>
    );

    const stepsItems: IKitStep[] = [
        {
            title: t('import.file_selection')
        },
        {
            title: t('import.file_configuration')
        },
        {
            title: t('import.in_progress')
        },
        {
            title: t('import.import_done'),
            status: importError ? 'error' : null
        }
    ];

    return (
        <>
            {showImportScheduleModal && (
                <ImportScheduleModal
                    scheduleDate={scheduleDate}
                    isModalOpen={showImportScheduleModal}
                    onChangeScheduleDate={_onChangeScheduleImport}
                    onCancelImportScheduleModal={_onCancelScheduleImport}
                    onValidateScheduleImport={_onValidateScheduleImport}
                />
            )}
            <ImportReducerContext.Provider value={{state, dispatch: importDispatch}}>
                <Modal
                    title={t('import.title')}
                    okText={validateButtonLabel}
                    cancelText={t('global.cancel')}
                    onOk={_onOk}
                    onCancel={onClose}
                    open={open}
                    closable
                    width="90vw"
                    centered
                    confirmLoading={currentStep === ImportSteps.PROCESSING}
                    bodyStyle={{height: 'calc(100vh - 10rem)'}}
                    okButtonProps={{disabled: !okBtn, className: 'submit-btn', title: buttonTitle}}
                    cancelButtonProps={{disabled: currentStep === ImportSteps.DONE}}
                    destroyOnClose={true}
                    footer={modalFooter}
                >
                    <KitSteps current={currentStep} style={{marginBottom: '2em'}} items={stepsItems} />
                    <Content>
                        <Suspense fallback={<Loading />}>{_getStepContent()}</Suspense>
                    </Content>
                </Modal>
            </ImportReducerContext.Provider>
        </>
    );
}

export default ImportModal;
