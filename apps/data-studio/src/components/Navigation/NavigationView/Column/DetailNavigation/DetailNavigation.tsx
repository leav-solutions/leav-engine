// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import RecordPreviewWithModal from 'components/shared/RecordPreviewWithModal';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import themingVar from '../../../../../themingVar';
import {getFileUrl} from '../../../../../utils';

const Detail = styled.div`
    position: relative;
    min-width: ${themingVar['@leav-navigation-column-width']};
    max-width: ${themingVar['@leav-navigation-column-width']};

    display: grid;
    justify-items: center;
    word-break: break-all;

    background: ${themingVar['@default-bg']};
    border-right: 1px solid ${themingVar['@divider-color']};
    border-bottom: 1px solid ${themingVar['@divider-color']};
    padding-bottom: 1rem;
    box-shadow: 0 1 1rem red;

    .header-detail {
        width: 100%;
    }
`;

const Content = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: start;
    gap: 0.5rem;
`;

const DetailElement = styled.div`
    span {
        font-weight: 600;
    }
`;

const PreviewWrapper = styled.div`
    padding: 2rem;
    width: 100%;
`;

const CloseButton = styled(CloseOutlined)`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.1em;
    cursor: pointer;
`;

interface IDetailNavigationProps {
    treeElement: TREE_NODE_CHILDREN_treeNodeChildren_list;
    closable: boolean;
    onClose?: () => void;
}

const DetailNavigation = ({treeElement, closable, onClose}: IDetailNavigationProps): JSX.Element => {
    const {t} = useTranslation();

    const recordData = treeElement.record;
    const previewFile = recordData?.whoAmI?.preview?.file;

    const label = recordData.whoAmI.label ? recordData.whoAmI.label : t('navigation.list.info.no-label');

    const img = recordData.whoAmI.preview?.big;

    return (
        <Detail data-testid="details-column">
            {closable && <CloseButton onClick={onClose} />}
            <PreviewWrapper>
                <RecordPreviewWithModal
                    key={recordData.id}
                    fileId={previewFile?.id}
                    fileLibraryId={previewFile?.library?.id}
                    label={recordData.whoAmI.label ? label : recordData.id}
                    color={recordData.whoAmI.color}
                    image={img && getFileUrl(img)}
                    tile
                    style={{maxHeight: '15rem', maxWidth: '100%'}}
                />
            </PreviewWrapper>
            <Content>
                <DetailElement>
                    <span>{t('navigation.list.info.id')}:</span> {recordData.id}
                </DetailElement>
                <DetailElement>
                    <span>{t('navigation.list.info.label')}:</span> {label}
                </DetailElement>
            </Content>
        </Detail>
    );
};

export default DetailNavigation;
