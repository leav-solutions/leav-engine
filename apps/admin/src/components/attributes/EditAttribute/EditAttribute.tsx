// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from '../../shared/ErrorDisplay';
import {useMemo} from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {type AttributeType, useGetAttributeByIdQuery} from '../../../_gqlTypes';
import Loading from '../../shared/Loading';
import EditAttributeTabs from './EditAttributeTabs';
import {type AttributeInfosFormValues} from './EditAttributeTabs/InfosTab/_types';

export type OnAttributePostSaveFunc = (attrData: AttributeInfosFormValues) => void;

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
`;

interface IEditAttributeProps {
    redirectAfterCreate?: boolean;
    attributeId?: string | null;
    onPostSave?: OnAttributePostSaveFunc;
    forcedType?: AttributeType;
}

function EditAttribute({attributeId, onPostSave, forcedType, redirectAfterCreate}: IEditAttributeProps): JSX.Element {
    const routeMatch = useParams();
    const attrId = typeof attributeId !== 'undefined' ? attributeId : (routeMatch?.id ?? '');

    const {loading, error, data} = useGetAttributeByIdQuery({
        variables: {id: attrId},
        skip: !attrId,
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
        [onPostSave, forcedType, history],
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

    return (
        <Wrapper className="grow">
            {_renderEditAttributeTabs(data.attributes.list[0] as GET_ATTRIBUTE_BY_ID_attributes_list)}
        </Wrapper>
    );
}

export default EditAttribute;
