import {CloseOutlined} from '@ant-design/icons';
import {RecordPreviewWithModal} from '@leav/ui';
import {useTranslation} from 'react-i18next';
import {type INavigationElement} from '../_types';
import {closeButton, content, detail, detailElement, previewWrapper} from './detailNavigation.module.css';

export const DetailNavigation = ({
    treeElement,
    closable,
    onClose,
}: {
    treeElement: INavigationElement;
    closable: boolean;
    onClose?: () => void;
}) => {
    const {t} = useTranslation();
    const recordData = treeElement.record;
    const previewFile = recordData?.whoAmI?.preview?.file;

    const label = recordData.whoAmI.label ? recordData.whoAmI.label : t('tree_explorer.list.info.no_label');
    const img = recordData.whoAmI.preview?.big ?? undefined;

    return (
        <div className={detail} data-testid="details-column">
            {closable && <CloseOutlined className={closeButton} onClick={onClose} />}
            <div className={previewWrapper}>
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
            </div>
            <div className={content}>
                <div className={detailElement}>
                    <span>{t('tree_explorer.list.info.id')}:</span> {recordData.id}
                </div>
                <div className={detailElement}>
                    <span>{t('tree_explorer.list.info.label')}:</span> {label}
                </div>
            </div>
        </div>
    );
};
