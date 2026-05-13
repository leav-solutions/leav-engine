import {type ME_me} from '../../../_gqlTypes/ME';
import {mockUser} from '../../../_tests/mocks/user';

const mockUseUserData = (): ME_me => mockUser;

export default mockUseUserData;
