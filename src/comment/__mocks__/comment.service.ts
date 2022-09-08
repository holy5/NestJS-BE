import { CommentStub } from "../test/stubs/comment.stub"

export const CommentService = jest.fn().mockReturnValue({
    getAllComments: jest.fn().mockResolvedValue([CommentStub({})]),
    getCommentById: jest.fn().mockResolvedValue(CommentStub({})),
    getPostComments: jest.fn().mockResolvedValue([CommentStub({})]),
    createComment: jest.fn().mockResolvedValue(CommentStub({})),
    deleteComment: jest.fn().mockResolvedValue(CommentStub({})),
    updateComment: jest.fn().mockResolvedValue(CommentStub({})),
    updateReplies: jest.fn().mockResolvedValue(CommentStub({})),
    likeComment: jest.fn().mockResolvedValue(CommentStub({})),
    unlikeComment: jest.fn().mockResolvedValue(CommentStub({})),
    deleteAllUserComments: jest
        .fn()
        .mockResolvedValueOnce("success")
        .mockResolvedValueOnce("Something went wrong"),
    deleteAllPostComments: jest
        .fn()
        .mockResolvedValueOnce("success")
        .mockResolvedValueOnce("Something went wrong"),
})
