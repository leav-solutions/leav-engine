// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Space, Tag, Tooltip} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useLang} from 'hooks/LangHook/LangHook';
import useLibraryVersionTrees from 'hooks/useLibraryVersionTrees';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IValueVersion} from '_types/types';

const VersionTag = styled(Tag)`
    cursor: pointer;
`;

interface IValuesVersionSummaryProps {
    libraryId: string;
    version: IValueVersion;
    onVersionClick: () => void;
}

function ValuesVersionSummary({libraryId, version, onVersionClick}: IValuesVersionSummaryProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const {loading, error, trees} = useLibraryVersionTrees(libraryId);

    const _handleClick = () => {
        onVersionClick();
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message="error.message" />;
    }

    return (
        <Space size="small">
            <span>{t('values_version.version')}:</span>
            <div>
                {trees
                    .filter(tree => !!version?.[tree.id])
                    .map(tree => (
                        <Tooltip key={tree.id} title={localizedTranslation(tree.label, lang)}>
                            <VersionTag onClick={_handleClick}>{version?.[tree.id]?.label}</VersionTag>
                        </Tooltip>
                    ))}
            </div>
        </Space>
    );
}

export default ValuesVersionSummary;
