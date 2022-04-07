// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DataProxy, useMutation, useQuery} from '@apollo/client';
import React from 'react';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '_gqlTypes/GET_ATTRIBUTES';
import {
    GET_ATTRIBUTE_BY_ID_attributes_list,
    GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute
} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {AttributeType, Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import Loading from '../../../../shared/Loading';
import PermissionsContent from './PermissionsContent';

interface IPermissionsTabProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    readonly: boolean;
}

function PermissionsTab({attribute, readonly}: IPermissionsTabProps): JSX.Element {
    const {loading, error, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: {type: [AttributeType.tree]}
    });

    // TODO: handle errors
    const [saveAttribute] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery);

    const _handleSubmitSettings = (conf: Treepermissions_confInput) =>
        saveAttribute({
            variables: {
                attrData: {
                    id: attribute.id,
                    permissions_conf: conf
                }
            },
            update: (cache: DataProxy, {data: {saveAttribute: savedAttr}}: any) => {
                const cacheData: any = cache.readQuery({
                    query: getAttributesQuery,
                    variables: {id: attribute.id}
                });
                cache.writeQuery({
                    query: getAttributesQuery,
                    data: {
                        attributes: {
                            ...cacheData.attributes,
                            list: cacheData.attributes.list.map(a => {
                                if (a.id !== attribute.id) {
                                    return a;
                                }

                                return {...a, permissions_conf: savedAttr.permissions_conf};
                            })
                        }
                    }
                });
            }
        });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">ERROR</div>;
    }

    return (
        <PermissionsContent
            attribute={attribute}
            readonly={readonly}
            treeAttributes={
                !!data && data.attributes
                    ? (data.attributes.list as GET_ATTRIBUTE_BY_ID_attributes_list_TreeAttribute[])
                    : []
            }
            onSubmitSettings={_handleSubmitSettings}
        />
    );
}

export default PermissionsTab;
