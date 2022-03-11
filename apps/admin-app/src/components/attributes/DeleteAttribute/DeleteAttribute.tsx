// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {StoreObject, useMutation} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from 'utils';
import {DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables} from '_gqlTypes/DELETE_ATTRIBUTE';
import useLang from '../../../hooks/useLang';
import {deleteAttrQuery} from '../../../queries/attributes/deleteAttributeMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteAttributeProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    filters?: any;
}

const DeleteAttribute = (props: IDeleteAttributeProps): JSX.Element => {
    const {attribute, filters} = props;
    const {t} = useTranslation();
    const {lang} = useLang();
    const [deleteAttr] = useMutation<DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables>(deleteAttrQuery, {
        update: (cache, {data: {deleteAttribute}}) => {
            deleteFromCache(cache, (deleteAttribute as unknown) as StoreObject);
        }
    });

    const onDelete = async () =>
        deleteAttr({
            variables: {attrId: attribute.id}
        });

    const attrLabel =
        attribute.label !== null ? attribute.label.fr || attribute.label.en || attribute.id : attribute.id;

    return attribute ? (
        <ConfirmedButton action={onDelete} confirmMessage={t('attributes.confirm_delete', {attrLabel})}>
            <DeleteButton disabled={attribute.system} />
        </ConfirmedButton>
    ) : (
        <></>
    );
};

export default DeleteAttribute;
