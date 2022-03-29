export interface IUseAuthToken {
    getToken: () => string;
    saveToken: (token: string) => void;
    deleteToken: () => void;
}
export declare function useAuthToken(): IUseAuthToken;
