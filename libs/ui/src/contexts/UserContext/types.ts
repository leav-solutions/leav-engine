// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordIdentityWhoAmI} from '_ui/types/records';

export interface IUserContextData {
    userId: string;
    userWhoAmI: IRecordIdentityWhoAmI;
}

export interface IUserContext {
    userData: IUserContextData;
    setUserData?: (userData: IUserContextData) => void;
}
