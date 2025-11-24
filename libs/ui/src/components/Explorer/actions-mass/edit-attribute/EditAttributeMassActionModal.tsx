// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faCheck, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type AttributeDetailsFragment, type RecordFilterInput} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitModal, KitSelect, KitSpace, KitTypography} from 'aristid-ds';
import {type FunctionComponent, type ReactNode} from 'react';

const MODAL_WIDTH = '90vw';
const MODAL_MAX_WIDTH = '656px';

export const EditAttributeMassActionModal: FunctionComponent<{
    isOpen: boolean;
    children: ReactNode;
    attributes: AttributeDetailsFragment[];
    setSelectedAttribute: (attr: AttributeDetailsFragment | undefined) => void;
    massSelectionFilter: RecordFilterInput[];
    elementsCount: number;
    disableOkButton: boolean;
    onOkButtonClick: () => void;
    onCancelButtonClick: () => void;
}> = ({
    isOpen,
    children,
    setSelectedAttribute,
    attributes,
    elementsCount,
    disableOkButton,
    onOkButtonClick,
    onCancelButtonClick,
}) => {
    const {t} = useSharedTranslation();

    return (
        <KitModal
            isOpen={isOpen}
            appElement={document.getElementById('root')}
            style={{content: {width: MODAL_WIDTH, maxWidth: MODAL_MAX_WIDTH}}}
            width="100%"
            height="auto"
            icon={false}
            title={
                <KitSpace direction="vertical" size="none">
                    <KitTypography.Title level="h2">{t('explorer.massAction.editAttribute')}</KitTypography.Title>
                    <KitTypography.Text size="fontSize7">
                        {t('explorer.massAction.editAttribute_description', {count: elementsCount})}
                    </KitTypography.Text>
                </KitSpace>
            }
            footer={
                <>
                    <KitButton icon={<FontAwesomeIcon icon={faXmark} />} onClick={onCancelButtonClick}>
                        {t('global.cancel')}
                    </KitButton>
                    <KitButton
                        type="primary"
                        disabled={disableOkButton}
                        onClick={onOkButtonClick}
                        icon={<FontAwesomeIcon icon={faCheck} />}
                    >
                        {t('global.edit')}
                    </KitButton>
                </>
            }
        >
            <KitSpace direction="vertical" size="m" style={{display: 'flex'}}>
                <KitSpace direction="vertical" size="xxs" style={{display: 'flex'}}>
                    <KitTypography.Text>
                        {t('explorer.massAction.editAttribute_attribute_select_title')}
                    </KitTypography.Text>
                    <KitSelect
                        options={attributes.map(attr => ({
                            label: attr.label || attr.id,
                            value: attr.id,
                        }))}
                        size="large"
                        allowClear={false}
                        onChange={value => {
                            setSelectedAttribute(attributes.find(att => att.id === value));
                        }}
                        placeholder={t('explorer.massAction.editAttribute_attribute_select_placeholder')}
                    />
                </KitSpace>
                {children}
            </KitSpace>
        </KitModal>
    );
};
