// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import {History, Location} from 'history';
import React, {useMemo} from 'react';
import {match} from 'react-router';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list
} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditAttributeTabs from './EditAttributeTabs';

export interface IEditAttributeMatchParams {
    id: string;
}

export type onAttributePostSaveFunc = (attrData: GET_ATTRIBUTES_attributes_list) => void;

interface IEditAttributeProps {
    match?: match<IEditAttributeMatchParams>;
    history?: History;
    attributeId?: string | null;
    onPostSave?: onAttributePostSaveFunc;
    forcedType?: AttributeType;
    location?: Location;
}

function EditAttribute({
    match: routeMatch,
    attributeId,
    onPostSave,
    forcedType,
    history,
    location
}: IEditAttributeProps): JSX.Element {
    const attrId = typeof attributeId !== 'undefined' ? attributeId : routeMatch ? routeMatch.params.id : '';

    const {loading, error, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: {id: attrId}
    });

    const _renderEditAttributeTabs = useMemo(
        () => (attribute?: GET_ATTRIBUTES_attributes_list, locationGiven?: Location) => (
            <EditAttributeTabs
                attribute={attribute}
                onPostSave={onPostSave}
                forcedType={forcedType}
                history={history}
                location={locationGiven}
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
        return <div className="error">ERROR</div>;
    }

    if (!data || !data.attributes || !data.attributes.list.length) {
        return <div className="unknown">Unknown attribute</div>;
    }

    return _renderEditAttributeTabs(data.attributes.list[0], location);
}

export default EditAttribute;
