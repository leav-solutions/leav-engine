// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';

export interface IUserContext {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
    permissions: {[name: string]: boolean};
}

const UserContext = React.createContext<IUserContext | null>(null);

export default UserContext;
