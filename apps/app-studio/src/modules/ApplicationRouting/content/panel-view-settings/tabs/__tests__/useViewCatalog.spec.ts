import * as leavUi from '@leav/ui';
import {renderHook} from '_ui/_tests/testUtils';
import * as graphqlClient from '../../../../../../__generated__';
import {useViewCatalog} from '../useViewCatalog';

describe('useViewCatalog', () => {
    const spyOnUseGetViewListQuery = jest.spyOn(graphqlClient, 'useGetViewListQuery');
    const spyOnUseUser = jest.spyOn(leavUi, 'useUser');

    const currentUserId = 'user-1';
    const libraryId = 'products';

    const myView = {id: 'view-1', created_by: {id: currentUserId}, shared: false};
    const mySharedView = {id: 'view-2', created_by: {id: currentUserId}, shared: true};
    const otherSharedView = {id: 'view-3', created_by: {id: 'user-2'}, shared: true};
    const otherPrivateView = {id: 'view-4', created_by: {id: 'user-2'}, shared: false};

    beforeEach(() => {
        spyOnUseUser.mockReturnValue({userData: {userId: currentUserId}} as any);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should split the view list into the current user views and the shared views', () => {
        spyOnUseGetViewListQuery.mockReturnValue({
            data: {views: {list: [myView, mySharedView, otherSharedView, otherPrivateView]}},
        } as any);

        const {result} = renderHook(() => useViewCatalog(libraryId));

        expect(result.current.myViews).toEqual([myView, mySharedView]);
        expect(result.current.sharedViews).toEqual([otherSharedView]);
    });
});
