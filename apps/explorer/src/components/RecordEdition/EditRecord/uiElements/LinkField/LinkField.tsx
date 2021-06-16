// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileAddOutlined, FileOutlined} from '@ant-design/icons';
import {ICommonFieldsSettings, IFormLinkFieldSettings} from '@leav/types';
import {Switch, Table} from 'antd';
import SearchModal from 'components/SearchModal';
import {IRecordPropertyLink} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {localizedLabel} from 'utils';
import {GET_FORM_forms_list_elements_elements_attribute_LinkAttribute} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI, ISharedStateSelectionSearch} from '_types/types';
import useDeleteValueMutation from '../../hooks/useDeleteValueMutation';
import useSaveValueMutation from '../../hooks/useSaveValueMutation';
import {APICallStatus, IFormElementProps} from '../../_types';
import RecordIdentityCell from './RecordIdentityCell';

const TableWrapper = styled.div`
    position: relative;
    border: 1px solid ${themingVar['@border-color-base']};
    margin-bottom: 1.5em;
    border-radius: ${themingVar['@border-radius-base']};
`;

const NoRecordWrapper = styled.div<{canAdd: boolean}>`
    cursor: ${props => (props.canAdd ? 'pointer' : 'auto')};
    font-size: 1.1em;

    span {
        margin-left: 0.5em;
    }
`;

const FieldLabel = styled.div`
    position: absolute;
    left: 5px;
    top: -0.85em;
    font-size: 1.1em;
    background: ${themingVar['@default-bg']};
    padding: 0 0.5em;
    color: rgba(0, 0, 0, 0.5);
    z-index: 1;
`;

interface IRowData {
    key: string;
    whoAmI: IRecordIdentityWhoAmI;
    value: IRecordPropertyLink;
    [columnName: string]: unknown;
}

function LinkField({element, recordValues, record}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);

    const attribute = element.attribute as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute;

    const {saveValue} = useSaveValueMutation(record, attribute.id);
    const {deleteValue} = useDeleteValueMutation(record, attribute.id);

    const fieldValues = (recordValues[element.settings.attribute] as IRecordPropertyLink[]) ?? [];

    const _handleAddValue = () => {
        setIsSearchModalVisible(true);
    };

    const _handleDeleteValue = async (value: IRecordPropertyLink) => {
        const deleteRes = await deleteValue(value.id_value);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            return;
        }
    };

    const _handleSearchModalSubmit = async ({selected}: ISharedStateSelectionSearch) => {
        const selectedRecord = selected[0];
        const submitRes = await saveValue({value: selectedRecord.id, idValue: null});

        if (submitRes.status === APICallStatus.SUCCESS) {
            return;
        }
    };

    const cols = [
        {
            title: t('record_edition.whoAmI'),
            dataIndex: 'whoAmI',
            render: (whoAmI: IRecordIdentityWhoAmI, rowData: IRowData) => {
                const _handleDelete = () => _handleDeleteValue(rowData.value);
                return <RecordIdentityCell record={whoAmI} onDelete={_handleDelete} />;
            }
        },
        ...(Array.isArray((element.settings as IFormLinkFieldSettings).columns)
            ? (element.settings as IFormLinkFieldSettings).columns.map(c => ({
                  title: localizedLabel(c.label, lang),
                  dataIndex: c.id
              }))
            : [])
    ];

    const data: IRowData[] = fieldValues.map(val => ({
        key: val.id_value,
        value: val,
        whoAmI: val.linkValue.whoAmI,
        ...(Array.isArray((element.settings as IFormLinkFieldSettings).columns)
            ? (element.settings as IFormLinkFieldSettings).columns.reduce((allCols, col) => {
                  const columnValue = val.linkValue[col.id];
                  return {
                      ...allCols,
                      [col.id]:
                          typeof columnValue === 'boolean' ? <Switch checked={columnValue} disabled /> : columnValue
                  };
              }, {})
            : {})
    }));

    const isReadOnly = element.attribute?.system;
    const canAddValue = !isReadOnly;

    const NoRecords = canAddValue ? (
        <NoRecordWrapper canAdd={canAddValue} onClick={_handleAddValue}>
            <FileAddOutlined />
            <span>{t('record_edition.add_value')}</span>
        </NoRecordWrapper>
    ) : (
        <NoRecordWrapper canAdd={canAddValue}>
            <FileOutlined />
            <span>{t('record_edition.no_value')}</span>
        </NoRecordWrapper>
    );

    return (
        <>
            <TableWrapper>
                <FieldLabel>{element.settings.label}</FieldLabel>
                <Table
                    columns={cols}
                    dataSource={data}
                    size="small"
                    pagination={false}
                    locale={{
                        emptyText: NoRecords
                    }}
                    data-testid="linked-field-values"
                />
            </TableWrapper>
            {canAddValue && (
                <SearchModal
                    libId={attribute.linked_library.id}
                    visible={isSearchModalVisible}
                    setVisible={setIsSearchModalVisible}
                    submitAction={_handleSearchModalSubmit}
                />
            )}
        </>
    );
}

export default LinkField;
