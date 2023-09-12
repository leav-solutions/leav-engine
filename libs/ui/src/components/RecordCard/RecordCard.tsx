// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {PreviewSize} from '../../constants';
import useLang from '../../hooks/useLang';
import {IRecordIdentityWhoAmI} from '../../types/RecordIdentity';
import {EntityCard, IEntityData} from '../EntityCard';
import {IRecordCardProps} from './_types';

const _getPreviewBySize = (preview?: IRecordIdentityWhoAmI['preview'], size?: PreviewSize) => {
    const fileSizeByPreviewSize: {[size in PreviewSize]: string} = {
        [PreviewSize.tiny]: 'tiny',
        [PreviewSize.small]: 'tiny',
        [PreviewSize.medium]: 'small',
        [PreviewSize.big]: 'medium'
    };

    const previewPath: string = (preview?.[fileSizeByPreviewSize[size]] ?? preview?.small) as string;

    return previewPath ?? '';
};

const RecordCard = ({
    record,
    size,
    style,
    previewStyle,
    lang,
    withPreview = true,
    withLibrary = true,
    withColor = true,
    tile = false,
    simplistic = false
}: IRecordCardProps): JSX.Element => {
    const {lang: userLang} = useLang();
    const label = record.label || record.id;
    const subLabel = record.subLabel
        ? record.subLabel
        : localizedTranslation(record.library?.label, lang ?? userLang) || record.library?.id;

    const recordIdentity: IEntityData = {
        label,
        subLabel,
        preview: _getPreviewBySize(record.preview, size),
        color: record.color
    };

    return (
        <EntityCard
            entity={recordIdentity}
            style={style}
            size={size}
            withPreview={withPreview}
            withSubLabel={withLibrary}
            tile={tile}
            simplistic={simplistic}
            withColor={withColor}
            previewStyle={previewStyle}
        />
    );
};

export default RecordCard;
