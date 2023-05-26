// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {gql, useApolloClient} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import {Button, Modal, ModalProps, Popconfirm} from 'antd';
import {useState} from 'react';
import {
    AttributeDetailsFragment,
    PermissionTypes,
    PermissionsActions,
    useDeleteAttributeMutation,
    useIsAllowedQuery
} from '../../_gqlTypes';
import {extractPermissionFromQuery} from '../../helpers/extractPermissionFromQuery';
import {useLang} from '../../hooks';
import {useSharedTranslation} from '../../hooks/useSharedTranslation';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import EditAttribute from './EditAttribute/EditAttribute';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface IEditAttributeModalModalProps {
    attributeId?: string;
    open: boolean;
    onPostCreate?: (attribute: AttributeDetailsFragment) => Promise<void>;
    onClose?: () => void;
    width?: ModalProps['width'];
}

function EditAttributeModal({
    open,
    attributeId,
    onClose,
    onPostCreate,
    width
}: IEditAttributeModalModalProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const apolloClient = useApolloClient();

    const isAllowedQueryResult = useIsAllowedQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            type: PermissionTypes.admin,
            actions: [PermissionsActions.admin_edit_attribute, PermissionsActions.admin_delete_attribute]
        }
    });
    const isReadOnly = !extractPermissionFromQuery(isAllowedQueryResult, PermissionsActions.admin_edit_attribute);
    const canDelete = extractPermissionFromQuery(isAllowedQueryResult, PermissionsActions.admin_delete_attribute);

    const [deleteAttribute] = useDeleteAttributeMutation();

    const [submitFunction, setSubmitFunction] = useState<() => Promise<AttributeDetailsFragment>>();
    const [submitLoading, setSubmitLoading] = useState(false);
    const isEditing = !!attributeId;

    const _handleSubmit = async () => {
        if (!submitFunction) {
            return;
        }
        setSubmitLoading(true);
        try {
            const savedAttribute = await submitFunction();
            await onPostCreate(savedAttribute);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitLoading(false);
        }
    };

    const _handleDelete = async () => {
        if (!attributeId) {
            return;
        }

        const deleteRes = await deleteAttribute({
            variables: {
                id: attributeId
            }
        });

        // Remove library from apollo cache
        apolloClient.cache.evict({
            id: apolloClient.cache.identify(deleteRes.data.deleteAttribute)
        });

        onClose();
    };

    const _handleSetSubmitFunction = submitFunc => {
        setSubmitFunction(() => submitFunc);
    };

    let attributeLabel = t('attributes.new_attribute');

    if (isEditing) {
        // Try to find attribute in Apollo cache to get label
        const cacheIdentifyStd = apolloClient.cache.identify({__typename: 'StandardAttribute', id: attributeId});
        const cacheIdentifyLink = apolloClient.cache.identify({__typename: 'LinkAttribute', id: attributeId});
        const cacheIdentifyTree = apolloClient.cache.identify({__typename: 'TreeAttribute', id: attributeId});
        const fragment = gql`
            fragment AttributeLabel on Attribute {
                label
            }
        `;

        const cacheFragment = isEditing
            ? apolloClient.readFragment({id: cacheIdentifyStd, fragment}) ||
              apolloClient.readFragment({id: cacheIdentifyLink, fragment}) ||
              apolloClient.readFragment({id: cacheIdentifyTree, fragment}) ||
              null
            : null;

        // Get application label from apollo cache if present
        attributeLabel = cacheFragment ? localizedTranslation(cacheFragment.label, lang) : '';
    }

    const buttons = isEditing
        ? [
              canDelete ? (
                  <Popconfirm
                      key="delete_confirm"
                      title={t('attributes.delete_confirm')}
                      description={t('attributes.delete_confirm_warning')}
                      okText={t('global.submit')}
                      cancelText={t('global.cancel')}
                      onConfirm={_handleDelete}
                  >
                      <Button key="delete" danger>
                          {t('attributes.delete')}
                      </Button>
                  </Popconfirm>
              ) : null,
              <Button key="close" onClick={onClose}>
                  {t('global.close')}
              </Button>
          ]
        : [
              <Button key="cancel" onClick={onClose}>
                  {t('global.cancel')}
              </Button>,
              <Button key="submit" type="primary" onClick={_handleSubmit} loading={submitLoading}>
                  {t('global.submit')}
              </Button>
          ];

    return (
        <Modal
            open={open}
            title={attributeLabel}
            width={width ?? 800}
            footer={buttons}
            onCancel={onClose}
            bodyStyle={{height: 'calc(95vh - 15rem)', overflow: 'auto'}}
            centered
        >
            {isAllowedQueryResult.loading ? (
                <Loading />
            ) : isAllowedQueryResult.error ? (
                <ErrorDisplay message={isAllowedQueryResult.error.message} />
            ) : (
                <EditAttribute
                    attributeId={attributeId}
                    onSetSubmitFunction={_handleSetSubmitFunction}
                    readOnly={isReadOnly}
                />
            )}
        </Modal>
    );
}

export default EditAttributeModal;
