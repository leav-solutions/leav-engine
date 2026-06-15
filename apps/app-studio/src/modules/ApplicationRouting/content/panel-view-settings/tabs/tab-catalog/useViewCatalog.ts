import {useUser} from '@leav/ui';
import {type GetViewListQuery, useGetViewListQuery} from '../../../../../../__generated__';

export type View = GetViewListQuery['viewsV2']['list'][number];

interface IUseViewCatalogResult {
    myViews: View[];
    sharedViews: View[];
}

/**
 * Loads the view list of a library and splits it into the views owned by the current user
 * (`myViews`) and the views shared by other users (`sharedViews`).
 */
export const useViewCatalog = (libraryId: string): IUseViewCatalogResult => {
    const {data} = useGetViewListQuery({
        variables: {
            libraryId,
        },
    });

    const {userData} = useUser();

    return (data?.viewsV2.list ?? []).reduce<IUseViewCatalogResult>(
        (acc, view) => {
            if (view.created_by.id === userData?.userId) {
                acc.myViews.push(view);
            } else if (view.shared) {
                acc.sharedViews.push(view);
            }
            return acc;
        },
        {myViews: [], sharedViews: []},
    );
};
