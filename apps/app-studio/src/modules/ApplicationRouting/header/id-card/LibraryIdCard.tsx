import {type FunctionComponent, useContext} from 'react';
import {KitIdCard} from 'aristid-ds';
import {LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useGetLibraryNameQuery} from '../../../../__generated__';
import {PanelIdCardSkeleton} from './PanelIdCardSkeleton';

interface ILibraryIdCardProps {
    title: string | null;
    libraryId: string | null;
    avatarSize: 'l' | 'm';
}

export const LibraryIdCard: FunctionComponent<ILibraryIdCardProps> = ({title, libraryId, avatarSize}) => {
    const {lang} = useContext(LangContext);

    const {data, loading} = useGetLibraryNameQuery({
        variables: {
            libraryId,
        },
        skip: libraryId === null,
    });

    const libraryLabel = localizedTranslation(data?.libraries?.list?.[0]?.label, lang);

    if (title) {
        return (
            <KitIdCard
                size="s"
                title={title}
                avatarProps={{
                    shape: 'square',
                    label: libraryLabel,
                    size: avatarSize,
                }}
            />
        );
    }

    if (libraryId === null) {
        // PanelCustom case
        return null;
    }

    if (loading) {
        return <PanelIdCardSkeleton />;
    }

    return (
        <KitIdCard
            size="s"
            title={libraryLabel}
            avatarProps={{
                shape: 'square',
                label: libraryLabel,
                size: avatarSize,
            }}
        />
    );
};
