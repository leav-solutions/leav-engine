import {useEffect, useState} from 'react';
import {useGetLibraryPreviewsSettingsQuery} from '_ui/_gqlTypes';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const SELECT_ALL_KEY = 'select-all';

export type PreviewSizesTreeNode = {
    title: string;
    key: string;
    children?: PreviewSizesTreeNode[];
};

interface IUseGetPreviewSizesDataReturn {
    previewSizesTreeData: PreviewSizesTreeNode[];
    allPreviewSizes: string[];
    loading: boolean;
    error: Error | undefined;
}

/**
 * Hook that fetches library preview settings and transforms them into tree data
 * for the preview sizes selection in the GeneratePreviewsModal
 */
export const useGetPreviewSizesData = (libraryId: string): IUseGetPreviewSizesDataReturn => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const [previewSizesTreeData, setPreviewSizesTreeData] = useState<PreviewSizesTreeNode[]>([]);
    const [allPreviewSizes, setAllPreviewSizes] = useState<string[]>([]);

    const {
        data: libraryPreviewsSettingsData,
        error: libraryPreviewsSettingsError,
        loading: libraryPreviewsSettingsLoading,
    } = useGetLibraryPreviewsSettingsQuery({
        variables: {
            id: libraryId,
        },
    });

    useEffect(() => {
        if (libraryPreviewsSettingsData?.libraries?.list) {
            const selectAllPreviewSizesNode = {
                title: t('files.previews_generation_select_all'),
                key: SELECT_ALL_KEY,
            };
            const libraryPreviewSettings = libraryPreviewsSettingsData.libraries.list?.[0]?.previewsSettings || [];
            const previewSizes: string[] = [];

            const libraryPreviewSizesTreeData = libraryPreviewSettings.map(s => {
                const children = s.versions.sizes.map(vs => ({title: `${vs.name} (${vs.size}px)`, key: vs.name}));
                previewSizes.push(...children.map(c => c.key));

                return {
                    title: localizedTranslation(s.label, lang),
                    key: localizedTranslation(s.label, lang) + Math.random(),
                    children,
                };
            });

            setPreviewSizesTreeData([
                {
                    ...selectAllPreviewSizesNode,
                    children: libraryPreviewSizesTreeData,
                },
            ]);
            setAllPreviewSizes(previewSizes);
        }
    }, [libraryPreviewsSettingsData, lang, t]);

    return {
        previewSizesTreeData,
        allPreviewSizes,
        loading: libraryPreviewsSettingsLoading,
        error: libraryPreviewsSettingsError,
    };
};
