import { Test } from "@nestjs/testing"
import { PostStub } from "../../post/test/stubs/post.stub"
import { RequestStub } from "../../user/test/stubs/request.stub"
import { CommentController } from "../comment.controller"
import { CommentService } from "../comment.service"
import { Comment } from "../schema/comment.schema"
import { CommentStub } from "./stubs/comment.stub"

jest.mock("../comment.service")
describe("CommentController", () => {
    let commentController: CommentController
    let commentService: CommentService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [CommentService],
        }).compile()
        commentController = module.get<CommentController>(CommentController)
        commentService = module.get<CommentService>(CommentService)
        jest.clearAllMocks()
    })

    test("it should be defined", () => {
        expect(commentController).toBeDefined()
    })

    describe("getAllComments", () => {
        let comments: Comment[]

        beforeEach(async () => {
            comments = await commentController.getAllComments()
        })

        test("should be called", () => {
            expect(commentService.getAllComments).toBeCalled()
        })
        test("should return array of comments", () => {
            expect(comments).toEqual([CommentStub({})])
        })
    })

    describe("getPostComments", () => {
        let comment: Comment[]

        beforeEach(async () => {
            comment = await commentController.getPostComments(
                PostStub({})._id,
                {
                    limit: 1,
                }
            )
        })
        test("should be called", () => {
            expect(commentService.getPostComments).toBeCalledWith(
                PostStub({})._id,
                {
                    limit: 1,
                }
            )
        })
        test("should return array of comments", () => {
            expect(comment).toEqual([CommentStub({})])
        })
    })

    describe("createComment", () => {
        let comment: Comment

        beforeEach(async () => {
            comment = await commentController.createComment(RequestStub(), {
                content: "helloWorld",
                postId: "00000020f51bb4362eee2a4e",
            })
        })

        test("should be called", () => {
            expect(commentService.createComment).toBeCalledWith({
                content: "helloWorld",
                postId: "00000020f51bb4362eee2a4e",
                commentOwnerId: RequestStub().user.userId,
            })
        })
        test("should return a comment", () => {
            expect(comment).toEqual(CommentStub({}))
        })
    })

    describe("likeComment", () => {
        let comment: Comment

        beforeEach(async () => {
            comment = await commentController.likeComment(
                "507f191e810c19729de860ea",
                RequestStub()
            )
        })

        test("should be called", () => {
            expect(commentService.likeComment).toBeCalledWith(
                "507f191e810c19729de860ea",
                RequestStub().user.userId
            )
        })

        test("should return a comment", () => {
            expect(comment).toEqual(CommentStub({}))
        })
    })

    describe("unlikeComment", () => {
        let comment: Comment

        beforeEach(async () => {
            comment = await commentController.unlikeComment(
                "507f191e810c19729de860ea",
                RequestStub()
            )
        })

        test("should be called", () => {
            expect(commentService.unlikeComment).toBeCalledWith(
                "507f191e810c19729de860ea",
                RequestStub().user.userId
            )
        })

        test("should return a comment", () => {
            expect(comment).toEqual(CommentStub({}))
        })
    })

    describe("deleteComment", () => {
        let comment: Comment

        beforeEach(async () => {
            comment = await commentController.deleteComment(
                "507f191e810c19729de860ea",
                RequestStub()
            )
        })

        test("should be called", () => {
            expect(commentService.deleteComment).toBeCalledWith(
                "507f191e810c19729de860ea",
                RequestStub().user.userId
            )
        })
        test("should return a comment", () => {
            expect(comment).toEqual(CommentStub({}))
        })
    })

    describe("updateComment", () => {
        let comment: Comment

        beforeEach(async () => {
            comment = await commentController.updateComment(
                "507f191e810c19729de860ea",
                RequestStub(),
                {
                    content: "hello",
                    reqUserId: RequestStub().user.userId,
                }
            )
        })
        test("should be called", () => {
            expect(commentService.updateComment).toBeCalledWith(
                "507f191e810c19729de860ea",
                {
                    content: "hello",
                    reqUserId: RequestStub().user.userId,
                }
            )
        })
        test("should return a comment", () => {
            expect(comment).toEqual(CommentStub({}))
        })
    })
})
