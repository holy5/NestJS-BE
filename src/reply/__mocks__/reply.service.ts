import { ReplyStub } from "../test/stub/reply.stub"

export const ReplyService = jest.fn().mockReturnValue({
    getAllReplies: jest.fn().mockResolvedValue([
        ReplyStub({}),
        ReplyStub({
            id: "63146c115150e55b064609c3",
        }),
    ]),
    createReply: jest.fn().mockResolvedValue(ReplyStub({})),
    getCommentReplies: jest.fn().mockResolvedValue([
        ReplyStub({}),
        ReplyStub({
            id: "63146ce0fdaebb001999f44b",
        }),
    ]),
    updateReply: jest.fn().mockResolvedValue(
        ReplyStub({
            content: "hello this is a new content",
        })
    ),
    deleteReply: jest.fn().mockResolvedValue(ReplyStub({})),
    likeReply: jest.fn().mockResolvedValue(ReplyStub({})),
    unlikeReply: jest.fn().mockResolvedValue(ReplyStub({})),
})
