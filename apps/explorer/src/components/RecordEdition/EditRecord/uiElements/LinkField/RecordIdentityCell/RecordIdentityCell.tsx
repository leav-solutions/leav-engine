// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordCard from 'components/shared/RecordCard';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import styled from 'styled-components';
import {GET_FORM_forms_list_elements_elements_attribute} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';

interface IRecordIdentityCellProps {
    record: IRecordIdentityWhoAmI;
    value: RecordProperty;
    attribute: GET_FORM_forms_list_elements_elements_attribute;
}

const CellWrapper = styled.div`
    position: relative;

    &:not(:hover) .floating-menu {
        display: none;
    }
`;

function RecordIdentityCell({record, value, attribute}: IRecordIdentityCellProps): JSX.Element {
    return <RecordCard record={record} size={PreviewSize.small} />;
}

export default RecordIdentityCell;
