// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined, FieldTimeOutlined, RightOutlined} from '@ant-design/icons';
import {ServerError} from '@apollo/client';
import {Button, Dropdown, message, Modal, Space} from 'antd';
import {KitSteps} from 'aristid-ds';
import {IKitStep} from 'aristid-ds/dist/Kit/Navigation/Steps/types';
import dayjs from 'dayjs';
import {lazy, ReactNode, Suspense, useReducer, useState} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {LibraryLightFragment, useGetAttributesByLibLazyQuery, useImportExcelMutation} from '_ui/_gqlTypes';
import {Loading} from '../Loading';
import ImportScheduleModal from './ImportModalConfigStep/ImportScheduleModal';
import importReducer from './importReducer';
import {ImportReducerActionTypes, initialState} from './importReducer/importReducer';
import ImportReducerContext from './importReducer/ImportReducerContext';
import {ImportSteps} from './_types';

export interface IImportModalProps {
    open: boolean;
    onClose: () => void;
    library?: string;
    availableLibraries?: LibraryLightFragment[];
    resultExtraButtons?: JSX.Element[];
}
const Content = styled.div`
    margin-top: 2em;
    height: calc(100% - 6rem);
    overflow-y: auto;
`;

// Lazy load steps as it's using some heavy lib for XLSX handling. We don't want it to load on first load
const ImportModalSelectFileStep = lazy(() => import('./ImportModalSelectFileStep'));
const ImportModalConfigStep = lazy(() => import('./ImportModalConfigStep'));
const ImportModalProcessingStep = lazy(() => import('./ImportModalProcessingStep'));
const ImportModalDoneStep = lazy(() => import('./ImportModalDoneStep'));

function ImportModal({onClose, library, open, availableLibraries, resultExtraButtons}: IImportModalProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [state, importDispatch] = useReducer(importReducer, {...initialState, defaultLibrary: library});
    const {sheets, file, currentStep, okBtn} = state;

    const [showImportScheduleModal, setShowImportScheduleModal] = useState<boolean>(false);
    const [scheduleDate, setScheduleDate] = useState<dayjs.Dayjs | null>(null);

    // Retrieve attributes list
    const [runGetAttributes] = useGetAttributesByLibLazyQuery({
        fetchPolicy: 'cache-and-network',
        onError: error => message.error(error.message)
    });

    const [runImport, {error: importError}] = useImportExcelMutation({
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            importDispatch({type: ImportReducerActionTypes.SET_CURRENT_STEP, currentStep: ImportSteps.DONE});
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

    const _getStepContent = (): JSX.Element => {
        switch (currentStep) {
            case ImportSteps.SELECT_FILE:
                return <ImportModalSelectFileStep onGetAttributes={_handleGetAttributes} />;
            case ImportSteps.CONFIG:
                return <ImportModalConfigStep libraries={availableLibraries} onGetAttributes={_handleGetAttributes} />;
            case ImportSteps.PROCESSING:
                return <ImportModalProcessingStep />;
            case ImportSteps.DONE:
                return <ImportModalDoneStep resultExtraButtons={resultExtraButtons} />;
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
                    styles={{body: {height: 'calc(100vh - 10rem)'}}}
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
