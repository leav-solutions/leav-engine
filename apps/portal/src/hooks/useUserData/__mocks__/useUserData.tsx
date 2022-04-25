// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ME_me} from '_gqlTypes/ME';
import {mockUser} from '_tests/mocks/user';

const mockUseUserData = (): ME_me => {
    return mockUser;
};

export default mockUseUserData;
