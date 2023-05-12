// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExpandAltOutlined} from '@ant-design/icons';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {PreviewSize} from '../../../../../../constants';
import {EditAttributeModal} from '../../../../../EditAttributeModal';
import {EntityCard, IEntityData} from '../../../../../EntityCard';
import {FloatingMenu} from '../../../../../FloatingMenu';
import {AttributeListType} from '../AttributesList';

const Wrapper = styled.div`
    .floating-menu {
        display: none;
    }

    &:hover .floating-menu {
        display: block;
    }
`;

interface IAttributeCellProps {
    attribute: AttributeListType;
}

function AttributeCell({attribute}: IAttributeCellProps): JSX.Element {
    const {t} = useTranslation();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const _handleOpenEditModal = () => setIsEditModalOpen(true);
    const _handleCloseEditModal = () => setIsEditModalOpen(false);

    const attributeIdentity: IEntityData = {
        label: attribute.label,
        subLabel: attribute.id,
        preview: null,
        color: null
    };

    const menuActions = [
        {
            label: t('attributes.edit'),
            icon: <ExpandAltOutlined />,
            onClick: _handleOpenEditModal
        }
    ];

    return (
        <Wrapper>
            <EntityCard entity={attributeIdentity} size={PreviewSize.small} />
            <FloatingMenu actions={menuActions} />
            {isEditModalOpen && (
                <EditAttributeModal attributeId={attribute.id} onClose={_handleCloseEditModal} open={isEditModalOpen} />
            )}
        </Wrapper>
    );
}

export default AttributeCell;
