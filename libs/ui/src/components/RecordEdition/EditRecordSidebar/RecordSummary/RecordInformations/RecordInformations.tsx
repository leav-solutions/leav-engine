// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {IRecordIdentityWhoAmI} from '_ui/types';
import styled from 'styled-components';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FaExpand} from 'react-icons/fa';
import PropertiesList from '../../PropertiesList';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';
import {useRecordInformations} from './useRecordInformations';
import FileModal from '_ui/components/RecordPreviewWithModal/FileModal';
import {EntityPreview} from '_ui/components/EntityPreview';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';

interface IInformationsProps {
    record: IRecordIdentityWhoAmI;
    recordData: GetRecordColumnsValuesRecord;
}

const InformationsWrapper = styled.div`
    margin-top: calc(var(--general-spacing-s) * 1px);
`;

const PreviewWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 162px;
    background-color: var(--general-colors-primary-50);
    border-radius: calc(var(--general-border-radius-s) * 1px);
    padding: calc(var(--general-spacing-xs) * 1px);
`;

const ExpandImageButton = styled(KitButton)`
    position: absolute;
    right: 0;
    top: 0;
`;

const ContentWrapper = styled.div`
    margin-top: calc(var(--general-spacing-s) * 1px);
`;

export const RecordInformations: FunctionComponent<IInformationsProps> = ({record, recordData}) => {
    const {t} = useSharedTranslation();
    const recordInformations = useRecordInformations(record, recordData);
    const [isFilePreviewModalOpen, setFilePreviewModalOpen] = useState(false);

    const previewFile = record?.preview?.file;
    const preview = record?.preview?.medium ? String(record?.preview?.medium) : null;

    return (
        <InformationsWrapper>
            <PreviewWrapper>
                <EntityPreview
                    label={record?.label ?? record?.id}
                    color={record?.color}
                    image={preview}
                    imageStyle={{border: 'none'}}
                    placeholderStyle={{height: '100%', width: 'fit-content', margin: 'auto', borderRadius: '0'}}
                    style={{height: '100%', background: 'initial'}}
                    tile
                />
                {previewFile !== undefined && (
                    <KitTooltip
                        title={t('record_summary.open_preview_modal')}
                        mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}
                    >
                        <ExpandImageButton
                            aria-label={t('record_summary.open_preview_modal')}
                            type="tertiary"
                            icon={<FaExpand />}
                            onClick={() => setFilePreviewModalOpen(true)}
                        />
                    </KitTooltip>
                )}
            </PreviewWrapper>
            {isFilePreviewModalOpen && (
                <FileModal
                    open={isFilePreviewModalOpen}
                    fileId={previewFile?.id}
                    libraryId={previewFile?.library}
                    onClose={() => setFilePreviewModalOpen(false)}
                />
            )}
            <ContentWrapper>
                <PropertiesList items={recordInformations} />
            </ContentWrapper>
        </InformationsWrapper>
    );
};
