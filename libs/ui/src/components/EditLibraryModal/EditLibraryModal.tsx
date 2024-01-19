// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql, useApolloClient} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import {Button, Modal, ModalProps, Popconfirm} from 'antd';
import {useState} from 'react';
import {
    PermissionsActions,
    PermissionTypes,
    SaveLibraryMutation,
    useDeleteLibraryMutation,
    useIsAllowedQuery
} from '_ui/_gqlTypes';
import {useLang} from '../../hooks';
import {useSharedTranslation} from '../../hooks/useSharedTranslation';
import {extractPermissionFromQuery} from '../../_utils';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import EditLibrary from './EditLibrary/EditLibrary';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface IEditLibraryModalProps {
    libraryId?: string;
    open: boolean;
    onPostCreate?: (library: SaveLibraryMutation['saveLibrary']) => Promise<void>;
    onClose?: () => void;
    width?: ModalProps['width'];
    indexationTask?: string;
}

function EditLibraryModal({
    open,
    libraryId,
    onClose,
    onPostCreate,
    width,
    indexationTask
}: IEditLibraryModalProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const apolloClient = useApolloClient();

    const isEditing = !!libraryId;
    const permissionsQueryResult = useIsAllowedQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            type: PermissionTypes.admin,
            actions: isEditing
                ? [PermissionsActions.admin_edit_library, PermissionsActions.admin_delete_library]
                : [PermissionsActions.admin_create_library]
        }
    });
    const isReadOnly = !extractPermissionFromQuery(
        permissionsQueryResult,
        isEditing ? PermissionsActions.admin_edit_library : PermissionsActions.admin_create_library
    );

    const canDelete = extractPermissionFromQuery(permissionsQueryResult, PermissionsActions.admin_delete_library);

    const [deleteLibrary] = useDeleteLibraryMutation();

    const [submitFunction, setSubmitFunction] = useState<() => Promise<SaveLibraryMutation['saveLibrary']>>();
    const [submitLoading, setSubmitLoading] = useState(false);

    const _handleSubmit = async () => {
        if (!submitFunction) {
            return;
        }
        setSubmitLoading(true);
        try {
            const savedLibrary = await submitFunction();

            if (onPostCreate) {
                await onPostCreate(savedLibrary);
            }

            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitLoading(false);
        }
    };

    const _handleDelete = async () => {
        if (!libraryId) {
            return;
        }

        const deleteRes = await deleteLibrary({
            variables: {
                id: libraryId
            }
        });

        // Remove library from apollo cache
        apolloClient.cache.evict({
            id: apolloClient.cache.identify(deleteRes.data.deleteLibrary)
        });

        onClose();
    };

    const _handleSetSubmitFunction = submitFunc => {
        setSubmitFunction(() => submitFunc);
    };

    // Get application label from apollo cache if present
    const libraryLabel = isEditing
        ? apolloClient.readFragment({
              id: apolloClient.cache.identify({
                  __typename: 'Library',
                  id: libraryId
              }),
              fragment: gql`
                  fragment LibraryLabel on Library {
                      label
                  }
              `
          })?.label
        : t('libraries.new_library');

    const buttons = isEditing
        ? [
              canDelete ? (
                  <Popconfirm
                      key="delete_confirm"
                      title={t('libraries.delete_confirm')}
                      description={t('libraries.delete_confirm_warning')}
                      okText={t('global.submit')}
                      cancelText={t('global.cancel')}
                      onConfirm={_handleDelete}
                  >
                      <Button key="delete" danger>
                          {t('libraries.delete')}
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
            title={isEditing ? localizedTranslation(libraryLabel, lang) : t('libraries.new_library')}
            width={width ?? 800}
            footer={buttons}
            onCancel={onClose}
            centered
        >
            {permissionsQueryResult.loading ? (
                <Loading />
            ) : permissionsQueryResult.error ? (
                <ErrorDisplay message={permissionsQueryResult.error.message} />
            ) : (
                <EditLibrary
                    libraryId={libraryId}
                    onSetSubmitFunction={_handleSetSubmitFunction}
                    readOnly={isReadOnly}
                    indexationTask={indexationTask}
                />
            )}
        </Modal>
    );
}

export default EditLibraryModal;
