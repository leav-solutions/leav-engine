// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, KeyOutlined, LoadingOutlined} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {Checkbox, message, Result, Select, Space, Steps, Table, Typography, Upload} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React, {useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {addNotification} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import {getAttributesByLibQuery} from '../../../../graphQL/queries/attributes/getAttributesByLib';
import {importExcel} from '../../../../graphQL/queries/import/importExcel';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {localizedTranslation} from '../../../../utils';
import {GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {IMPORT, IMPORTVariables} from '../../../../_gqlTypes/IMPORT';
import {
    AttributeType,
    INotification,
    NotificationChannel,
    NotificationPriority,
    NotificationType
} from '../../../../_types/types';

const {Step} = Steps;
const {Dragger} = Upload;
const {Title} = Typography;

export interface IImportModalProps {
    open: boolean;
    onClose: () => void;
    library: string;
}

enum ImportSteps {
    SELECT_FILE = 0,
    CONFIG = 1,
    PROCESSING = 2,
    DONE = 3
}

const Content = styled.div`
    margin-top: 2em;
`;

const CenteredWrapper = styled.div`
    text-align: center;
`;

export interface IInitialState {
    data: Array<{[attributeName: string]: any}>;
    mapping: string[];
    key: string | null;
    file: File | null;
    keyChecked: boolean;
    currentStep: ImportSteps;
    okBtn: boolean;
}

const initialState: IInitialState = {
    data: [],
    mapping: [],
    key: null,
    file: null,
    keyChecked: false,
    currentStep: ImportSteps.SELECT_FILE,
    okBtn: false
};

function ImportModal({onClose, open, library}: IImportModalProps): JSX.Element {
    const {t} = useTranslation();

    const importReducer = (state: IInitialState, newValues: Partial<IInitialState>) => {
        return {
            ...state,
            ...newValues
        };
    };
    const [state, dispatch] = useReducer(importReducer, initialState);
    const {data, mapping, key, file, keyChecked, currentStep, okBtn} = state;

    const appDispatch = useAppDispatch();

    const [{lang}] = useLang();

    // Retrieve attributes list
    const {data: attrsList} = useQuery<GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables>(getAttributesByLibQuery, {
        variables: {
            library
        }
    });

    const attributes =
        attrsList?.attributes?.list
            .filter(a => a.type === AttributeType.simple || a.type === AttributeType.advanced)
            .map(a => ({id: a.id, label: localizedTranslation(a?.label, lang) ?? a.id})) || [];

    const [runImport, {error: importError}] = useMutation<IMPORT, IMPORTVariables>(importExcel, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            dispatch({currentStep: ImportSteps.DONE});
        },
        onError: error => {
            const notification: INotification = {
                type: NotificationType.error,
                priority: NotificationPriority.high,
                channel: NotificationChannel.passive,
                content: `${t('error.error_occurred')}: ${error.message}`
            };

            appDispatch(addNotification(notification));

            dispatch({currentStep: ImportSteps.DONE});
        }
    });

    const _runImport = async () => {
        dispatch({currentStep: ImportSteps.PROCESSING});

        if (file) {
            await runImport({
                variables: {
                    file,
                    library,
                    mapping,
                    key: keyChecked ? key : null
                }
            });
        }
    };

    const _setFileData = content => {
        const workbook = XLSX.read(content, {type: 'binary'});
        let d = [];

        for (const sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                // Use the sheet_to_json method to convert excel to json data
                d = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                break; // because only the first sheet is taken
            }
        }

        if (!d.length) {
            message.error(t('import.empty_file'));
            return false;
        }

        dispatch({data: d, mapping: Array(Object.keys(d[0]).length).fill(null)});
        return true;
    };

    const draggerProps = {
        name: 'file',
        multiple: false,
        accept: '.xlsx',
        showUploadList: false,
        beforeUpload: fileToImport => {
            const reader = new FileReader();
            reader.readAsBinaryString(fileToImport);

            reader.onload = e => {
                const res = _setFileData(reader.result);
                if (res) {
                    dispatch({file: fileToImport});
                }
                dispatch({okBtn: res});
            };

            return true;
        }
    };

    const _onOk = async () => {
        switch (currentStep) {
            case ImportSteps.SELECT_FILE:
                dispatch({okBtn: false});
                dispatch({currentStep: ImportSteps.CONFIG});
                break;
            case ImportSteps.CONFIG:
                await _runImport();
                break;
            default:
                onClose();
                return;
        }
    };

    const validateButtonLabel = t(
        currentStep === ImportSteps.SELECT_FILE
            ? 'import.file_configuration'
            : currentStep === ImportSteps.CONFIG
            ? 'import.start'
            : 'global.close'
    );

    const _onMappingSelect = (idx, id) => {
        mapping[idx] = id;
        dispatch({
            mapping: [...mapping],
            okBtn: mapping.length === Object.keys(data[0]).length && (!keyChecked || !!key),
            key: !!key && mapping.includes(key) ? key : null,
            keyChecked: !!key && mapping.includes(key)
        });
    };

    const _onClear = idx => {
        mapping[idx] = null;
        dispatch({mapping: [...mapping]});
    };

    return (
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
            okButtonProps={{disabled: !okBtn, className: 'submit-btn'}}
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
            <Content>
                {currentStep === ImportSteps.SELECT_FILE && (
                    <Dragger {...draggerProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">{file?.name || t('import.file_selection_instruction')}</p>
                    </Dragger>
                )}
                {currentStep === ImportSteps.CONFIG && (
                    <Space direction="vertical" align="center">
                        <Table
                            title={() => <Title level={5}>{t('import.data_overview')}</Title>}
                            bordered={false}
                            tableLayout={'fixed'}
                            columns={Object.keys(data[0]).map((s, i) => ({title: s, dataIndex: s}))}
                            dataSource={data.slice(0, 3).map((r, i) => ({...r, key: i}))}
                            size="small"
                            pagination={{hideOnSinglePage: true}}
                        />
                        <Table
                            title={() => <Title level={5}>{t('import.mapping')}</Title>}
                            tableLayout={'fixed'}
                            bordered={false}
                            columns={Object.keys(data[0]).map(s => ({title: s, dataIndex: s}))}
                            dataSource={[
                                Object.assign(
                                    {key: 'mapping_attributes'},
                                    ...Object.keys(data[0]).map((col, idx) => ({
                                        [col]: (
                                            <Select
                                                style={{width: '100%'}}
                                                placeholder={t('import.attribute_selection')}
                                                value={mapping[idx]}
                                                allowClear
                                                onClear={() => _onClear(idx)}
                                                onSelect={id => _onMappingSelect(idx, id)}
                                            >
                                                {attributes.map(a => (
                                                    <Select.Option key={a.id} value={a.id}>
                                                        {a.label || a.id}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )
                                    }))
                                )
                            ]}
                            size="small"
                            pagination={{hideOnSinglePage: true}}
                        />
                        <Space direction="vertical" align="center">
                            <Space direction="horizontal" align="baseline">
                                <Checkbox
                                    defaultChecked={keyChecked}
                                    checked={keyChecked}
                                    onChange={e =>
                                        dispatch({
                                            keyChecked: e.target.checked,
                                            okBtn:
                                                mapping.length === Object.keys(data[0]).length &&
                                                (!e.target.checked || !!key)
                                        })
                                    }
                                />
                                <Title level={5}>
                                    {t('import.key')} <KeyOutlined />
                                </Title>
                            </Space>
                            <Select
                                disabled={!keyChecked}
                                placeholder={'Select a key'}
                                value={!!key ? key : undefined}
                                onSelect={k =>
                                    dispatch({
                                        key: k,
                                        okBtn: mapping.length === Object.keys(data[0]).length && (!keyChecked || !!k)
                                    })
                                }
                            >
                                {attributes
                                    .filter(a => mapping.includes(a.id))
                                    .map(a => {
                                        return (
                                            <Select.Option key={a.id} value={a.id}>
                                                {a.label || a.id}
                                            </Select.Option>
                                        );
                                    })}
                            </Select>
                        </Space>
                    </Space>
                )}
                {currentStep === ImportSteps.PROCESSING && (
                    <CenteredWrapper data-test-id="processing">{t('global.processing') + '...'}</CenteredWrapper>
                )}
                {currentStep === ImportSteps.DONE && (
                    <Result
                        status={importError ? 'error' : 'success'}
                        title={importError ? t('import.import_failure') : t('import.import_success')}
                    />
                )}
            </Content>
        </Modal>
    );
}

export default ImportModal;
