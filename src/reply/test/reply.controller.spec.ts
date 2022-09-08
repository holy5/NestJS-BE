import { Test } from "@nestjs/testing"

import { RequestStub } from "../../user/test/stubs/request.stub"
import { ReplyController } from "../reply.controller"
import { ReplyService } from "../reply.service"
import { Reply } from "../schema/reply.schema"
import { ReplyStub } from "./stub/reply.stub"

jest.mock("../reply.service.ts")

describe("ReplyController", () => {
    let replyController: ReplyController
    let replyService: ReplyService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [ReplyController],
            providers: [ReplyService],
        }).compile()

        replyController = module.get<ReplyController>(ReplyController)
        replyService = module.get<ReplyService>(ReplyService)
        jest.clearAllMocks()
    })

    test("should be defined", () => {
        expect(replyController).toBeDefined()
    })

    describe("getAllReplies", () => {
        let replies: Reply[]

        beforeEach(async () => {
            replies = await replyController.getAllReplies()
        })

        test("then it should call getAllReplies on the replyService", () => {
            expect(replyService.getAllReplies).toBeCalled()
        })
        test("should return an array of replies", () => {
            expect(replies).toEqual([
                ReplyStub({}),
                ReplyStub({
                    id: "63146c115150e55b064609c3",
                }),
            ])
        })
    })

    describe("createReply", () => {
        let reply: Reply

        beforeEach(async () => {
            reply = await replyController.createReply(RequestStub(), {
                commentId: ReplyStub({}).commentId,
                content: ReplyStub({}).content,
                postId: ReplyStub({}).postId,
                replyOwnerId: ReplyStub({}).replyOwnerId,
            })
        })

        test("then it should call createReply on the replyService", () => {
            expect(replyService.createReply).toBeCalledWith({
                commentId: ReplyStub({}).commentId,
                content: ReplyStub({}).content,
                replyOwnerId: ReplyStub({}).replyOwnerId,
                postId: ReplyStub({}).postId,
            })
        })
        test("should return a reply", () => {
            expect(reply).toEqual(ReplyStub({}))
        })
    })

    describe("getCommentReplies", () => {
        let replies: Reply[]

        beforeEach(async () => {
            replies = await replyController.getCommentReplies(
                ReplyStub({}).commentId,
                {
                    limit: 2,
                }
            )
        })

        test("then it should call getCommentReplies on the replyService", () => {
            expect(replyService.getCommentReplies).toBeCalledWith(
                ReplyStub({}).commentId,
                {
                    limit: 2,
                }
            )
        })
        test("should return an array of replies", () => {
            expect(replies).toEqual([
                ReplyStub({}),
                ReplyStub({
                    id: "63146ce0fdaebb001999f44b",
                }),
            ])
        })
    })

    describe("updateReply", () => {
        let reply: Reply

        beforeEach(async () => {
            reply = await replyController.updateReply(
                ReplyStub({})._id,
                {
                    content: "hello this is a new content",
                    reqUserId: RequestStub().user.userId,
                },
                RequestStub()
            )
        })

        test("then it should call updateReply on the replyService", () => {
            expect(replyService.updateReply).toBeCalledWith(ReplyStub({})._id, {
                content: "hello this is a new content",
                reqUserId: RequestStub().user.userId,
            })
        })
        test("should return an updated reply", () => {
            expect(reply).toEqual(
                ReplyStub({
                    content: "hello this is a new content",
                })
            )
        })
    })

    describe("deleteReply", () => {
        let reply: Reply

        beforeEach(async () => {
            reply = await replyController.deleteReply(
                ReplyStub({})._id,
                RequestStub()
            )
        })

        test("then it should call deleteReply on the replyService", () => {
            expect(replyService.deleteReply).toBeCalledWith(
                ReplyStub({})._id,
                RequestStub().user.userId
            )
        })
        test("should return the deleted reply", () => {
            expect(reply).toEqual(ReplyStub({}))
        })
    })

    describe("likeReply", () => {
        let reply: Reply

        beforeEach(async () => {
            reply = await replyController.likeReply(
                ReplyStub({})._id,
                RequestStub()
            )
        })

        test("then it should call likeReply on the replyService", () => {
            expect(replyService.likeReply).toBeCalledWith(
                ReplyStub({})._id,
                RequestStub().user.userId
            )
        })
        test("should return the liked reply", () => {
            expect(reply).toEqual(ReplyStub({}))
        })
    })

    describe("unlikeReply", () => {
        let reply: Reply

        beforeEach(async () => {
            reply = await replyController.unlikeReply(
                ReplyStub({})._id,
                RequestStub()
            )
        })

        test("then it should call unlikeReply on the replyService", () => {
            expect(replyService.unlikeReply).toBeCalledWith(
                ReplyStub({})._id,
                RequestStub().user.userId
            )
        })
        test("should return the unliked reply", () => {
            expect(reply).toEqual(ReplyStub({}))
        })
    })
})
