// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import DeleteValueBtn from 'components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import ValueDetailsBtn from 'components/RecordEdition/EditRecord/shared/ValueDetailsBtn';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import RecordCard from 'components/shared/RecordCard';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_FORM_forms_list_elements_elements_attribute} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';

interface IRecordIdentityCellProps {
    record: IRecordIdentityWhoAmI;
    onDelete: (record: IRecordIdentityWhoAmI) => void;
    value: RecordProperty;
    attribute: GET_FORM_forms_list_elements_elements_attribute;
}

const CellWrapper = styled.div`
    position: relative;

    &:not(:hover) .floating-menu {
        display: none;
    }
`;

function RecordIdentityCell({record, onDelete, value, attribute}: IRecordIdentityCellProps): JSX.Element {
    const {t} = useTranslation();
    const _handleDelete = () => onDelete(record);

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.edit'),
            button: <EditRecordBtn record={record} size="small" />
        },
        {
            title: t('record_edition.value_details'),
            button: <ValueDetailsBtn value={value} attribute={attribute} />
        },
        {
            title: t('global.delete'),
            button: <DeleteValueBtn onDelete={_handleDelete} />
        }
    ];

    return (
        <CellWrapper aria-label="record-identity" data-testid="whoami-cell">
            <RecordCard record={record} size={PreviewSize.small} />
            <FloatingMenu actions={menuActions} />
        </CellWrapper>
    );
}

export default RecordIdentityCell;
