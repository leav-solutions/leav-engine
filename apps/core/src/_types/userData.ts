export interface IUserData {
    global: boolean;
    data: any;
}

/**
 * Same idea as IRecordIdentity but for users
 */
export interface IUserIdentity {
    id: string;

    /**
     * @throw if user have no email
     */
    getEmail: () => Promise<string>;

    getLabel: () => Promise<string>;
}
