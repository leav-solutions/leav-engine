export interface IDiscussionTargetRecord {
    id: string;
    libraryId: string;
}

export interface IDiscussionMentions {
    users?: string[];
    url: string;
}

export interface IPostDiscussionCommentParams {
    message: string;
    targetRecord: IDiscussionTargetRecord;
    threadId?: string;
    mentions?: IDiscussionMentions;
}

export interface IDiscussionComment {
    id: string;
}
