// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {ME_me} from '_gqlTypes/ME';

const UserContext = React.createContext<ME_me | null>(null);

export default UserContext;
