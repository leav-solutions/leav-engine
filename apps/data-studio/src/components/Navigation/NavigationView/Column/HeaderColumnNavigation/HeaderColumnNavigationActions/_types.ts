export interface IMessages {
    countValid: number;
    errors: {[x: string]: string[]};
}

export type OnMessagesFunc = (tMessageSuccess: string, tMessageFail: string, messages: IMessages) => void;
