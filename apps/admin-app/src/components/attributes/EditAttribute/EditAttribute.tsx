// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getAttributeByIdQuery} from 'queries/attributes/getAttributeById';
import React, {useMemo} from 'react';
import {match} from 'react-router';
import styled from 'styled-components';
import {
    GET_ATTRIBUTE_BY_ID,
    GET_ATTRIBUTE_BY_IDVariables,
    GET_ATTRIBUTE_BY_ID_attributes_list
} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditAttributeTabs from './EditAttributeTabs';
import {AttributeInfosFormValues} from './EditAttributeTabs/InfosTab/_types';

export interface IEditAttributeMatchParams {
    id: string;
}

export type OnAttributePostSaveFunc = (attrData: AttributeInfosFormValues) => void;

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
`;

interface IEditAttributeProps {
    match?: match<IEditAttributeMatchParams>;
    redirectAfterCreate?: boolean;
    attributeId?: string | null;
    onPostSave?: OnAttributePostSaveFunc;
    forcedType?: AttributeType;
}

function EditAttribute({
    match: routeMatch,
    attributeId,
    onPostSave,
    forcedType,
    redirectAfterCreate
}: IEditAttributeProps): JSX.Element {
    const attrId = typeof attributeId !== 'undefined' ? attributeId : routeMatch ? routeMatch.params.id : '';

    const {loading, error, data} = useQuery<GET_ATTRIBUTE_BY_ID, GET_ATTRIBUTE_BY_IDVariables>(getAttributeByIdQuery, {
        variables: {id: attrId},
        skip: !attrId
    });

    const _renderEditAttributeTabs = useMemo(
        () => (attribute?: GET_ATTRIBUTE_BY_ID_attributes_list) => (
            <EditAttributeTabs
                attribute={attribute}
                onPostSave={onPostSave}
                forcedType={forcedType}
                redirectAfterCreate={redirectAfterCreate}
            />
        ),
        [onPostSave, forcedType, history]
    );

    if (!attrId) {
        return _renderEditAttributeTabs();
    }

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data || !data.attributes || !data.attributes.list.length) {
        return <ErrorDisplay message="Unknown attribute" />;
    }

    return <Wrapper className="grow">{_renderEditAttributeTabs(data.attributes.list[0])}</Wrapper>;
}

export default EditAttribute;
