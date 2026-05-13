import React from 'react';
import {type RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';

export interface IUserContext {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
    permissions: {[name: string]: boolean};
}

const UserContext = React.createContext<IUserContext | null>(null);

export default UserContext;
