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
    PermissionTypes,
    PermissionsActions,
    TreeDetailsFragment,
    useDeleteTreeMutation,
    useIsAllowedQuery
} from '../../_gqlTypes';
import {extractPermissionFromQuery} from '../../helpers/extractPermissionFromQuery';
import {useLang} from '../../hooks';
import {useSharedTranslation} from '../../hooks/useSharedTranslation';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import {EditTree} from './EditTree';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface IEditTreeModalModalProps {
    treeId?: string;
    open: boolean;
    onPostCreate?: (tree: TreeDetailsFragment) => Promise<void>;
    onClose?: () => void;
    width?: ModalProps['width'];
}

function EditTreeModal({open, treeId, onClose, onPostCreate, width}: IEditTreeModalModalProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const apolloClient = useApolloClient();

    const [deleteTree] = useDeleteTreeMutation();

    const [submitFunction, setSubmitFunction] = useState<() => Promise<TreeDetailsFragment>>();
    const [submitLoading, setSubmitLoading] = useState(false);
    const isEditing = !!treeId;
    const permissionsQueryResult = useIsAllowedQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            type: PermissionTypes.admin,
            actions: isEditing
                ? [PermissionsActions.admin_edit_tree, PermissionsActions.admin_delete_tree]
                : [PermissionsActions.admin_create_tree]
        }
    });
    const isReadOnly = !extractPermissionFromQuery(
        permissionsQueryResult,
        isEditing ? PermissionsActions.admin_edit_tree : PermissionsActions.admin_create_tree
    );
    const canDelete = extractPermissionFromQuery(permissionsQueryResult, PermissionsActions.admin_delete_tree);

    const _handleSubmit = async () => {
        if (!submitFunction) {
            return;
        }
        setSubmitLoading(true);
        try {
            const savedTree = await submitFunction();
            await onPostCreate(savedTree);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitLoading(false);
        }
    };

    const _handleDelete = async () => {
        if (!treeId) {
            return;
        }

        const deleteRes = await deleteTree({
            variables: {
                id: treeId
            }
        });

        // Remove library from apollo cache
        apolloClient.cache.evict({
            id: apolloClient.cache.identify(deleteRes.data.deleteTree)
        });

        onClose();
    };

    const _handleSetSubmitFunction = submitFunc => {
        setSubmitFunction(() => submitFunc);
    };

    let treeLabel = t('trees.new_tree');

    if (isEditing) {
        // Try to find tree in Apollo cache to get label
        const cacheIdentify = apolloClient.cache.identify({__typename: 'Tree', id: treeId});
        const fragment = gql`
            fragment TreeLabel on Tree {
                label
            }
        `;

        const cacheFragment = isEditing ? apolloClient.readFragment({id: cacheIdentify, fragment}) : null;

        // Get application label from apollo cache if present
        treeLabel = cacheFragment ? localizedTranslation(cacheFragment.label, lang) : '';
    }

    const buttons = isEditing
        ? [
              canDelete ? (
                  <Popconfirm
                      key="delete_confirm"
                      title={t('trees.delete_confirm')}
                      description={t('trees.delete_confirm_warning')}
                      okText={t('global.submit')}
                      cancelText={t('global.cancel')}
                      onConfirm={_handleDelete}
                  >
                      <Button key="delete" danger>
                          {t('trees.delete')}
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
            title={treeLabel}
            width={width ?? 800}
            footer={buttons}
            onCancel={onClose}
            bodyStyle={{height: 'calc(95vh - 15rem)', overflow: 'auto'}}
            centered
        >
            {permissionsQueryResult.loading ? (
                <Loading />
            ) : permissionsQueryResult.error ? (
                <ErrorDisplay message={permissionsQueryResult.error.message} />
            ) : (
                <EditTree treeId={treeId} onSetSubmitFunction={_handleSetSubmitFunction} readOnly={isReadOnly} />
            )}
        </Modal>
    );
}

export default EditTreeModal;
