import {type FunctionComponent} from 'react';
import {CloseOutlined} from '@ant-design/icons';
import {RecordPreviewWithModal, themeVars} from '@leav/ui';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {type INavigationElement} from '../_types';

const Detail = styled.div`
    position: relative;
    min-width: ${themeVars.navigationColumnWidth};
    max-width: ${themeVars.navigationColumnWidth};

    display: grid;
    justify-items: center;
    word-break: break-all;

    background: ${themeVars.defaultBg};
    border-right: 1px solid ${themeVars.borderLightColor};
    border-bottom: 1px solid ${themeVars.borderLightColor};
    padding: 1rem;

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
    treeElement: INavigationElement;
    closable: boolean;
    onClose?: () => void;
}

export const DetailNavigation: FunctionComponent<IDetailNavigationProps> = ({treeElement, closable, onClose}) => {
    const {t} = useTranslation();
    const recordData = treeElement.record;
    const previewFile = recordData?.whoAmI?.preview?.file;

    const label = recordData.whoAmI.label ? recordData.whoAmI.label : t('tree-explorer.list.info.no-label');
    const img = recordData.whoAmI.preview?.big as string;

    return (
        <Detail data-testid="details-column">
            {closable && <CloseButton onClick={onClose} />}
            <PreviewWrapper>
                <RecordPreviewWithModal
                    key={recordData.id}
                    previewFile={previewFile}
                    label={recordData.whoAmI.label ? label : recordData.id}
                    color={recordData.whoAmI.color}
                    image={img}
                    tile
                    placeholderStyle={{width: '10rem', height: '10rem'}}
                    imageStyle={{maxHeight: '15rem', maxWidth: '100%'}}
                />
            </PreviewWrapper>
            <Content>
                <DetailElement>
                    <span>{t('tree-explorer.list.info.id')}:</span> {recordData.id}
                </DetailElement>
                <DetailElement>
                    <span>{t('tree-explorer.list.info.label')}:</span> {label}
                </DetailElement>
            </Content>
        </Detail>
    );
};
