import {localizedTranslation} from '@leav/utils';
import {type ApolloError} from '@apollo/client';
import {useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import useLang from '_ui/hooks/useLang/useLang';
import {type SystemTranslation} from '_ui/types/scalars';
import {AntSkeleton} from 'aristid-ds';
import {type FunctionComponent} from 'react';
import {type Entrypoint, type IEntrypointLink} from './_types';

interface IExplorerTitleProps {
    title?: string;
    libraryLabel: SystemTranslation | null;
    isLibraryLabelLoading: boolean;
    /** Error from the upstream library metadata query (`useExplorerLibraryMetadata`), if any. */
    libraryError?: ApolloError;
    entrypoint: Entrypoint;
}

// TODO: use <h1 /> tag
export const ExplorerTitle: FunctionComponent<IExplorerTitleProps> = ({
    title,
    libraryLabel,
    isLibraryLabelLoading,
    libraryError,
    entrypoint,
}) => {
    const {
        data: attributeData,
        loading: attributeLoading,
        error: attributeError,
    } = useExplorerLinkAttributeQuery({
        skip: !!title || entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId,
        },
    });

    const {lang} = useLang();

    if (title) {
        return <span>{title}</span>;
    }

    if (isLibraryLabelLoading || attributeLoading) {
        return <AntSkeleton.Input style={{width: 400}} active />;
    }

    // TODO: handle error and bad library ID
    if (libraryError || attributeError) {
        return <span>{libraryError?.message ?? attributeError?.message}</span>;
    }

    let label;

    if (entrypoint.type === 'library') {
        if (!libraryLabel) {
            // TODO: make it i18n
            return <span>Unknown library</span>;
        }

        label = libraryLabel;
    } else {
        const linkAttributeData = attributeData?.attributes?.list[0];

        if (!linkAttributeData) {
            return <span>Unknown link attribute</span>;
        }

        label = 'label' in linkAttributeData ? linkAttributeData.label : null;
    }

    return <span>{localizedTranslation(label, lang)}</span>;
};
