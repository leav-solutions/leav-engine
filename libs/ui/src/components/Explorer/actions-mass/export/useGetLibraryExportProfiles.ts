import {useMemo} from 'react';
import {useLibraryExportProfilesQuery} from '_ui/_gqlTypes';

interface IExportProfileColumn {
    columnLabel: string;
    attribute: string;
}

export interface IExportProfile {
    label: string;
    columns: IExportProfileColumn[];
    error?: {message: string};
}

interface IGetLibraryExportProfilesResult {
    profiles: IExportProfile[];
    defaultProfile: string;
    loading: boolean;
}

interface IUseGetLibraryExportProfilesParams {
    libraryId: string;
    skip?: boolean;
}

/**
 * Fetch and validate export profiles for a library
 * @param params - The library ID and optional skip flag
 * @returns Validated export profiles, default profile, loading state, and validation status
 */
export const useGetLibraryExportProfiles = ({
    libraryId,
    skip = false,
}: IUseGetLibraryExportProfilesParams): IGetLibraryExportProfilesResult => {
    const {data, loading} = useLibraryExportProfilesQuery({
        skip,
        fetchPolicy: 'no-cache',
        variables: {libraryId: [libraryId]},
    });

    const exportProfiles = data?.libraries?.list?.[0]?.exportProfiles;

    return useMemo(() => {
        if (loading) {
            return {
                profiles: [],
                defaultProfile: '',
                loading,
            };
        }

        if (!exportProfiles) {
            return {
                profiles: [],
                defaultProfile: '',
                loading,
            };
        }

        const {defaultProfile, profiles} = exportProfiles;

        if (!Array.isArray(profiles) || profiles.length === 0) {
            return {
                profiles: [],
                defaultProfile: '',
                loading,
            };
        }

        return {
            profiles: profiles as IExportProfile[],
            defaultProfile: typeof defaultProfile === 'string' ? defaultProfile : '',
            loading,
        };
    }, [exportProfiles, loading]);
};
