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
import {TreeDetailsFragment} from '../../_gqlTypes';
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
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const apolloClient = useApolloClient();
    const [submitFunction, setSubmitFunction] = useState<() => Promise<TreeDetailsFragment>>();
    const [submitLoading, setSubmitLoading] = useState(false);
    const isEditing = !!treeId;

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
            <EditTree treeId={treeId} onSetSubmitFunction={_handleSetSubmitFunction} />
        </Modal>
    );
}

export default EditTreeModal;
