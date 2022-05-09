// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InboxOutlined, KeyOutlined, LoadingOutlined} from '@ant-design/icons';
import {useLazyQuery, useMutation} from '@apollo/client';
import {Checkbox, message, Result, Select, Space, Steps, Table, Typography, Upload, Tabs} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import useGetLibrariesListQuery from 'hooks/useGetLibrariesListQuery/useGetLibrariesListQuery';
import {lte} from 'lodash';
import React, {useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {addNotification} from 'redux/notifications';
import {useAppDispatch} from 'redux/store';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import {AttributeType} from '_gqlTypes/globalTypes';
import {getAttributesByLibQuery} from '../../../../graphQL/queries/attributes/getAttributesByLib';
import {importExcel} from '../../../../graphQL/queries/import/importExcel';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {localizedTranslation} from '../../../../utils';
import {
    GET_ATTRIBUTES_BY_LIB,
    GET_ATTRIBUTES_BY_LIBVariables,
    GET_ATTRIBUTES_BY_LIB_attributes_list,
    GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute
} from '../../../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {IMPORT, IMPORTVariables} from '../../../../_gqlTypes/IMPORT';
import {INotification, NotificationChannel, NotificationPriority, NotificationType} from '../../../../_types/types';

const {Step} = Steps;
const {Dragger} = Upload;
const {Title} = Typography;
const {TabPane} = Tabs;

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

export enum ImportType {
    STANDARD = 'STANDARD',
    LINK = 'LINK'
}

interface ISheet {
    name: string;
    columns: string[];
    data: Array<{[col: string]: string}>;
    keyChecked: boolean;
    attributes: GET_ATTRIBUTES_BY_LIB_attributes_list[];
    mapping: Array<string | null>;
    type?: ImportType;
    library?: string;
    key?: string;
    linkAttribute?: string;
    keyTo?: string;
    keyToColumnIndex?: number;
    keyToAttributes?: GET_ATTRIBUTES_BY_LIB_attributes_list[];
}

export interface IInitialState {
    sheets: ISheet[];
    file: File | null;
    currentStep: ImportSteps;
    okBtn: boolean;
}

const initialState: IInitialState = {
    sheets: [],
    file: null,
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
    const {sheets, file, currentStep, okBtn} = state;

    const appDispatch = useAppDispatch();

    const [{lang}] = useLang();

    // get libraries list
    const librariesListQuery = useGetLibrariesListQuery();

    if (librariesListQuery.error) {
        return <ErrorDisplay message={librariesListQuery.error?.message} />;
    }

    const libraries = librariesListQuery.data?.libraries?.list ?? [];

    // Retrieve attributes list
    const [runGetAttributes, {data: attrsList}] = useLazyQuery<GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables>(
        getAttributesByLibQuery,
        {
            onError: error => <ErrorDisplay message={error?.message} />
        }
    );

    const attributes =
        attrsList?.attributes?.list
            .filter(a => a.type === AttributeType.simple || a.type === AttributeType.advanced)
            .map(a => ({id: a.id, label: localizedTranslation(a.label, lang) || a.id})) || [];

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

        // TODO: update mutation
        // if (file) {
        //     await runImport({
        //         variables: {
        //             file,
        //             library,
        //             mapping,
        //             key: keyChecked ? key : null
        //         }
        //     });
        // }
    };

    const _extractArgsFromComment = (mapping: string): {[arg: string]: string} => {
        return mapping
            .split('-')
            .slice(1)
            .map(e => e.replace(/\s+/g, ' ').trim().split(' '))
            .reduce((a, v) => ({...a, [v[0]]: v[1]}), {});
    };

    const _setFileData = async content => {
        const workbook = XLSX.read(content, {type: 'binary'});

        const s: ISheet[] = [];

        for (const sheetName in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheetName)) {
                // Use the sheet_to_json method to convert excel to json data
                const sheetData: Array<{[col: string]: string}> = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                    blankrows: false,
                    defval: null
                });

                // if sheet is empty we skip it
                if (!sheetData.length) {
                    continue;
                }

                // get columns' name
                const sheetColumns = Object.keys(sheetData[0]);

                const firstRowAddresses = Object.keys(workbook.Sheets[sheetName]).filter(k => !!k.match(/\b[A-Z]1\b/g)); // match only first line cells (A1, B1, etc.)
                const isMapped = !!workbook.Sheets[sheetName][firstRowAddresses[0]].c;

                // Mapping is present.
                if (isMapped) {
                    const comments = [];

                    for (const address of firstRowAddresses) {
                        comments.push(workbook.Sheets[sheetName][address].c?.[0]?.t?.replace(/\n/g, ' ') || null); // get first line comments and delete "\n" characters
                    }

                    const params = _extractArgsFromComment(comments[0]);

                    const sType = params.type;
                    const sLibrary = params.library;
                    const sKey = params.key;
                    const sLinkAttribute = params.linkAttribute;
                    const sKeyTo = params.keyTo;
                    const sMapping = comments.map(c => (c ? _extractArgsFromComment(c).id : null));

                    const {data} = await runGetAttributes({variables: {library: sLibrary}});
                    const attrs = data?.attributes?.list;

                    s.push({
                        name: sheetName,
                        attributes: attrs,
                        keyChecked: false,
                        columns: sheetColumns,
                        type: ImportType[sType],
                        library: sLibrary,
                        key: sKey,
                        linkAttribute: sLinkAttribute,
                        keyTo: sKeyTo,
                        data: sheetData.length ? sheetData : null,
                        mapping: sMapping
                    });
                } else {
                    s.push({
                        name: sheetName,
                        columns: sheetColumns,
                        attributes: [],
                        mapping: [],
                        keyChecked: false,
                        data: sheetData.length ? sheetData : null
                    });
                }
            }
        }

        if (!s.length || s.every(sheet => sheet.data === null)) {
            message.error(t('import.empty_file'));
            return false;
        }

        dispatch({sheets: s});

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

            reader.onload = async e => {
                const res = await _setFileData(reader.result);
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
                dispatch({currentStep: ImportSteps.CONFIG});
                refreshOkBtn();
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

    const _onMappingSelect = (sheetIndex: number, mIndex: number, id: string | null) => {
        const mapping = sheets[sheetIndex].mapping;
        mapping[mIndex] = id;

        const key =
            !!sheets[sheetIndex].key && sheets[sheetIndex].mapping.includes(sheets[sheetIndex].key)
                ? sheets[sheetIndex].key
                : null;

        const keyTo = mIndex === sheets[sheetIndex].keyToColumnIndex ? id : sheets[sheetIndex].keyTo;

        changeSheetProperty(sheetIndex, {
            mapping,
            key,
            keyChecked: !!key,
            keyTo
        });
    };

    const _onLibrarySelect = async (sheetIndex: number, lib: string) => {
        const {data} = await runGetAttributes({variables: {library: lib}});
        const attrs = data?.attributes?.list;

        changeSheetProperty(sheetIndex, {
            library: lib,
            attributes: attrs,
            mapping: [],
            key: null,
            keyChecked: false,
            linkAttribute: null,
            keyTo: null,
            keyToAttributes: null,
            keyToColumnIndex: null
        });
    };

    const _onImportTypeSelect = (sheetIndex: number, type: ImportType) => {
        changeSheetProperty(sheetIndex, {
            type,
            linkAttribute: null,
            keyTo: null,
            keyToAttributes: null,
            keyToColumnIndex: null
        });
    };

    const _onLinkAttributeSelect = async (sheetIndex: number, linkAttribute: string) => {
        const {data} = await runGetAttributes({
            variables: {
                library: (sheets[sheetIndex].attributes.find(
                    a => a.id === linkAttribute
                ) as GET_ATTRIBUTES_BY_LIB_attributes_list_LinkAttribute).linked_library.id
            }
        });

        const attrs = data?.attributes?.list;

        const mapping = sheets[sheetIndex].mapping;
        if (sheets[sheetIndex].keyToColumnIndex !== null) {
            mapping[sheets[sheetIndex].keyToColumnIndex] = null;
        }

        changeSheetProperty(sheetIndex, {
            linkAttribute,
            mapping,
            keyTo: null,
            keyToColumnIndex: null,
            keyToAttributes: attrs
        });
    };

    const _onKeyCheckedChange = (sheetIndex: number, checked: boolean) => {
        changeSheetProperty(sheetIndex, {key: null, keyChecked: checked});
    };

    const _onKeyToCheckedChange = (sheetIndex: number, checked: boolean, columnIndex: number) => {
        const mapping = sheets[sheetIndex].mapping;
        mapping[columnIndex] = null;

        if (sheets[sheetIndex].keyToColumnIndex !== null) {
            mapping[sheets[sheetIndex].keyToColumnIndex] = null;
        }

        changeSheetProperty(sheetIndex, {keyToColumnIndex: checked ? columnIndex : null, keyTo: null, mapping});
    };

    const changeSheetProperty = (sheetIndex: number, values: Partial<ISheet>) => {
        sheets[sheetIndex] = {...sheets[sheetIndex], ...values};
        dispatch({sheets: [...sheets]});
        refreshOkBtn();
    };

    const isLinkAttribute = (attribute: GET_ATTRIBUTES_BY_LIB_attributes_list): boolean =>
        attribute.type === AttributeType.simple_link ||
        attribute.type === AttributeType.advanced_link ||
        attribute.type === AttributeType.tree;

    const refreshOkBtn = () => {
        const mappingOk = (s: ISheet) => s.mapping.length === Object.keys(s.data[0]).length;
        const keyOk = (s: ISheet) => !s.keyChecked || !!s.key;
        const keyToOk = (s: ISheet) => (s.type === ImportType.LINK ? !!s.linkAttribute && !!s.keyTo : true);

        dispatch({
            okBtn: sheets.every(s => mappingOk(s) && keyOk(s) && keyToOk(s))
        });
    };

    const _onSelectKey = (sheetIndex: number, key: string) => {
        changeSheetProperty(sheetIndex, {key});
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
                    <Tabs type="card">
                        {sheets.map((sheet, sheetIndex) => {
                            return (
                                <TabPane tab={sheet.name} key={sheetIndex}>
                                    <Space direction="vertical" align="center">
                                        <Space direction="horizontal" align="baseline">
                                            <Title level={5}>Library</Title>
                                            <Select
                                                style={{width: 160}}
                                                defaultValue={sheet.library}
                                                placeholder={'Library'}
                                                onChange={value => _onLibrarySelect(sheetIndex, value)}
                                            >
                                                {libraries.map(l => (
                                                    <Select.Option value={l.id}>
                                                        {localizedTranslation(l.label, lang) || l.id}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Title level={5}>Type d'import</Title>
                                            <Select
                                                style={{width: 160}}
                                                defaultValue={sheet.type}
                                                placeholder={"Type d'import"}
                                                onChange={value => _onImportTypeSelect(sheetIndex, value)}
                                            >
                                                <Select.Option value={ImportType.STANDARD}>Standard</Select.Option>
                                                <Select.Option value={ImportType.LINK}>Link</Select.Option>
                                            </Select>
                                            {sheet.type === ImportType.LINK && (
                                                <>
                                                    <Title level={5}>Attribut de liaison</Title>
                                                    <Select
                                                        style={{width: 160}}
                                                        defaultValue={sheet.linkAttribute}
                                                        value={sheet.linkAttribute}
                                                        placeholder={'Attribute de liaison'}
                                                        onChange={value => _onLinkAttributeSelect(sheetIndex, value)}
                                                    >
                                                        {sheet.attributes.filter(isLinkAttribute).map(a => (
                                                            <Select.Option key={a.id} value={a.id}>
                                                                {localizedTranslation(a.label, lang) || a.id}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </>
                                            )}
                                        </Space>
                                        <Table
                                            title={() => <Title level={5}>{t('import.data_overview')}</Title>}
                                            tableLayout={'fixed'}
                                            columns={Object.keys(sheet.data[0]).map((c, i) => ({
                                                title: (
                                                    <>
                                                        {c}
                                                        {sheet.type === ImportType.LINK && (
                                                            <Checkbox
                                                                defaultChecked={sheet.keyToColumnIndex === i}
                                                                checked={sheet.keyToColumnIndex === i}
                                                                onChange={e =>
                                                                    _onKeyToCheckedChange(
                                                                        sheetIndex,
                                                                        e.target.checked,
                                                                        i
                                                                    )
                                                                }
                                                            >
                                                                Clé de liaison
                                                            </Checkbox>
                                                        )}
                                                    </>
                                                ),
                                                dataIndex: c
                                            }))}
                                            dataSource={sheet.data.slice(0, 3).map((r, i) => ({...r, key: i}))}
                                            size="small"
                                            pagination={{hideOnSinglePage: true}}
                                        ></Table>
                                        <Table
                                            title={() => <Title level={5}>{t('import.mapping')}</Title>}
                                            showHeader={false}
                                            tableLayout={'fixed'}
                                            columns={Object.keys(sheet.data[0]).map(c => ({
                                                title: c,
                                                dataIndex: c
                                            }))}
                                            dataSource={[
                                                Object.assign(
                                                    {key: 'mapping_attributes'},
                                                    ...Object.keys(sheet.data[0]).map((col, idx) => ({
                                                        [col]: (
                                                            <Select
                                                                style={{width: '100%'}}
                                                                placeholder={
                                                                    sheet.keyToColumnIndex === idx
                                                                        ? 'Clé de liaison'
                                                                        : 'Ne pas importer'
                                                                }
                                                                value={sheet.mapping?.[idx]}
                                                                allowClear
                                                                onClear={() => _onMappingSelect(sheetIndex, idx, null)}
                                                                onSelect={id => _onMappingSelect(sheetIndex, idx, id)}
                                                            >
                                                                {(sheet.keyToColumnIndex !== idx
                                                                    ? sheet.attributes.filter(
                                                                          a =>
                                                                              a.type === AttributeType.simple ||
                                                                              a.type === AttributeType.advanced
                                                                      )
                                                                    : sheet.keyToAttributes
                                                                ).map(a => (
                                                                    <Select.Option key={a.id} value={a.id}>
                                                                        {localizedTranslation(a.label, lang) || a.id}
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
                                                    defaultChecked={sheet.keyChecked}
                                                    checked={sheet.keyChecked}
                                                    onChange={e => _onKeyCheckedChange(sheetIndex, e.target.checked)}
                                                />
                                                <Title level={5}>
                                                    {"Sélection d'une clé d'import" || t('import.key')} <KeyOutlined />
                                                </Title>
                                            </Space>
                                            <Select
                                                disabled={!sheet.keyChecked}
                                                placeholder={"Clé d'import"}
                                                value={sheet.key}
                                                onSelect={k => _onSelectKey(sheetIndex, k)}
                                            >
                                                {attributes
                                                    .filter(a => sheet.mapping.includes(a.id))
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
                                </TabPane>
                            );
                        })}
                    </Tabs>
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
