import {useQuery} from '@apollo/client';
import {
    getActiveLibrary,
    IActiveLibrary,
    IGetActiveLibrary
} from '../queries/cache/activeLibrary/getActiveLibraryQuery';

export const useActiveLib = (): IActiveLibrary | undefined => {
    const {data} = useQuery<IGetActiveLibrary>(getActiveLibrary);

    const activeLib: IActiveLibrary | undefined = data?.activeLib;

    return activeLib;
};
