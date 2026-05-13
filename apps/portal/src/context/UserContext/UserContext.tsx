import React from 'react';
import {type ME_me} from '../../_gqlTypes/ME';

const UserContext = React.createContext<ME_me | null>(null);

export default UserContext;
