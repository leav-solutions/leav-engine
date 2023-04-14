// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {gql, useApolloClient} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import {Button, Modal, ModalProps} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLang} from '../../hooks';
import {SaveLibraryMutation} from '../../_gqlTypes';
import EditLibrary from './EditLibrary/EditLibrary';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface IEditLibraryModalProps {
    libraryId?: string;
    open: boolean;
    onPostCreate?: (library: SaveLibraryMutation['saveLibrary']) => Promise<void>;
    onClose?: () => void;
    width?: ModalProps['width'];
}

function EditLibraryModal({open, libraryId, onClose, onPostCreate, width}: IEditLibraryModalProps): JSX.Element {
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const apolloClient = useApolloClient();
    const [submitFunction, setSubmitFunction] = useState<() => Promise<SaveLibraryMutation['saveLibrary']>>();
    const [submitLoading, setSubmitLoading] = useState(false);
    const isEditing = !!libraryId;

    const _handleSubmit = async () => {
        if (!submitFunction) {
            return;
        }
        setSubmitLoading(true);
        try {
            const savedLibrary = await submitFunction();
            await onPostCreate(savedLibrary);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitLoading(false);
        }
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
            <EditLibrary libraryId={libraryId} onSetSubmitFunction={_handleSetSubmitFunction} />
        </Modal>
    );
}

export default EditLibraryModal;
