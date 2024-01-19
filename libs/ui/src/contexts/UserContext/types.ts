import {IRecordIdentityWhoAmI} from '_ui/types/records';

export interface IUserContextData {
    userId: string;
    userWhoAmI: IRecordIdentityWhoAmI;
}

export interface IUserContext {
    userData: IUserContextData;
    setUserData?: (userData: IUserContextData) => void;
}
