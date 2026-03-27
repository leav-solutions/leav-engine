// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ApolloError, type StoreObject} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from '../../../utils';
import {type GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';
import {useDeleteAttributeMutation} from '../../../_gqlTypes';

interface IDeleteAttributeProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    filters?: any;
    onError?: (error: ApolloError) => void;
}

const DeleteAttribute = (props: IDeleteAttributeProps): JSX.Element => {
    const {attribute} = props;
    const {t} = useTranslation();

    const [deleteAttr] = useDeleteAttributeMutation({
        update: (cache, {data: {deleteAttribute}}) => {
            deleteFromCache(cache, deleteAttribute as unknown as StoreObject);
        },
        onError: props.onError,
    });

    const onDelete = async () =>
        deleteAttr({
            variables: {attrId: attribute.id},
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
