import React from 'react';
import {useTranslation} from 'react-i18next';
import {DeleteAttributeMutation, deleteAttrQuery} from '../../../queries/attributes/deleteAttributeMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../_gqlTypes/GET_ATTRIBUTES';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';
import {DataProxy} from 'apollo-cache';
import {getAttributesQueryName, getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import useLang from '../../../hooks/useLang';
import {addWildcardToFilters} from '../../../utils/utils';
import {clearCacheQueriesFromRegexp} from '../../../utils';

interface IDeleteAttributeProps {
    attribute?: GET_ATTRIBUTES_attributes_list;
    filters?: any;
}

/* tslint:disable-next-line:variable-name */
const DeleteAttribute = (props: IDeleteAttributeProps): JSX.Element => {
    const {attribute, filters} = props;
    const {t} = useTranslation();
    const {lang} = useLang();

    const _updateCache = (cache: DataProxy, {data: {deleteAttribute}}) => {
        const cachedData: any = cache.readQuery({
            query: getAttributesQuery,
            variables: {...addWildcardToFilters(filters), lang}
        });

        if (!cachedData) {
            return;
        }

        clearCacheQueriesFromRegexp(cache, /ROOT_QUERY.attributes/);

        const newCount = cachedData.attributes?.totalCount ? cachedData.attributes?.totalCount - 1 : 0;
        const newList = cachedData.attributes?.list
            ? cachedData.attributes.list.filter(l => l.id !== deleteAttribute.id)
            : [];

        cache.writeQuery({
            query: getAttributesQuery,
            variables: {...addWildcardToFilters(filters), lang},
            data: {attributes: {...cachedData.attributes, totalCount: newCount, list: newList}}
        });
    };

    return !!attribute ? (
        <DeleteAttributeMutation
            mutation={deleteAttrQuery}
            refetchQueries={[getAttributesQueryName]}
            update={_updateCache}
        >
            {deleteAttr => {
                const onDelete = async () =>
                    deleteAttr({
                        variables: {attrId: attribute.id}
                    });

                const attrLabel =
                    attribute.label !== null ? attribute.label.fr || attribute.label.en || attribute.id : attribute.id;

                return (
                    <ConfirmedButton action={onDelete} confirmMessage={t('attributes.confirm_delete', {attrLabel})}>
                        <DeleteButton disabled={attribute.system} />
                    </ConfirmedButton>
                );
            }}
        </DeleteAttributeMutation>
    ) : (
        <></>
    );
};

export default DeleteAttribute;
