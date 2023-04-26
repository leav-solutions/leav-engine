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
import {AttributeDetailsFragment} from '../../_gqlTypes';
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
    const {t} = useTranslation('shared');
    const {lang} = useLang();
    const apolloClient = useApolloClient();
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
            <EditAttribute attributeId={attributeId} onSetSubmitFunction={_handleSetSubmitFunction} />
        </Modal>
    );
}

export default EditAttributeModal;
