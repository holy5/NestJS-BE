import { createMock } from "@golevelup/ts-jest"
import { HttpStatus } from "@nestjs/common"
import { getModelToken } from "@nestjs/mongoose"
import { Test, TestingModule } from "@nestjs/testing"
import { Model, Query } from "mongoose"
import { IComment } from "../../interface/comment.interface"
import { RequestStub } from "../../user/test/stubs/request.stub"
import { ReplyService } from "../../reply/reply.service"
import { CommentService } from "../comment.service"
import { CommentDocument, Comment } from "../schema/comment.schema"
import { CommentStub } from "./stubs/comment.stub"
import { ReplyStub } from "../../reply/test/stub/reply.stub"
import { PostStub } from "../../post/test/stubs/post.stub"

const QUERY_LIMIT = 2

class mockCommentModel {
    constructor(private data: IComment) {}

    new = jest.fn().mockResolvedValueOnce(CommentStub(this.data))
    save = jest.fn().mockReturnValueOnce(CommentStub(this.data))

    static find = jest.fn()
    static findOne = jest.fn()
    static findById = jest.fn()
    static findByIdAndUpdate = jest.fn()
    static findByIdAndDelete = jest.fn()
    static deleteMany = jest.fn()
    static populate = jest.fn()
}

describe("CommentService", () => {
    let service: CommentService
    let model: Model<CommentDocument>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: getModelToken(Comment.name),
                    useValue: mockCommentModel,
                },
                {
                    provide: ReplyService,
                    useValue: createMock<ReplyService>(),
                },
            ],
        }).compile()

        service = module.get<CommentService>(CommentService)
        model = module.get<Model<CommentDocument>>(getModelToken(Comment.name))
    })
    test("service should be defined", () => {
        expect(service).toBeDefined()
    })
    test("model should be defined", () => {
        expect(model).toBeDefined()
    })
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("getAllComments", () => {
        test("should return all comments", async () => {
            jest.spyOn(model, "find").mockReturnValueOnce(
                createMock<Query<CommentDocument, CommentDocument>>({
                    populate: jest
                        .fn()
                        .mockResolvedValueOnce([
                            CommentStub({}),
                            CommentStub({ id: "123", content: "hi" }),
                        ]),
                }) as any
            )

            const comments = await service.getAllComments()
            expect(comments).toEqual([
                CommentStub({}),
                CommentStub({ id: "123", content: "hi" }),
            ])
        })
    })

    describe("getCommentById", () => {
        test("should return comment by id", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(CommentStub({}))
            const comment = await service.getCommentById(CommentStub({})._id)
            expect(comment).toEqual(CommentStub({}))
        })
    })

    describe("getPostComment", () => {
        test("should return comments of a post", async () => {
            jest.spyOn(model, "find").mockReturnValue(
                createMock<Query<CommentDocument, CommentDocument>>({
                    limit: jest.fn().mockReturnValueOnce([
                        CommentStub({}),
                        CommentStub({
                            id: "123456",
                            content: "helloWorld",
                        }),
                    ]),
                }) as any
            )

            const comments = await service.getPostComments(PostStub({})._id, {
                limit: QUERY_LIMIT,
            })

            expect(comments).toHaveLength(QUERY_LIMIT)
            expect(comments).toEqual([
                CommentStub({}),
                CommentStub({
                    id: "123456",
                    content: "helloWorld",
                }),
            ])
        })
    })

    describe("createComment", () => {
        test("should create a comment", async () => {
            const comment = await service.createComment({
                content: CommentStub({}).content,
                postId: CommentStub({}).postId,
                commentOwnerId: CommentStub({}).commentOwnerId,
            })

            expect(comment).toEqual(CommentStub({}))
        })
    })

    describe("deleteComment", () => {
        test("should delete a comment and replies if comment exist", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(CommentStub({}))

            jest.spyOn(model, "findByIdAndDelete").mockResolvedValueOnce(
                CommentStub({})
            )

            const comment = await service.deleteComment(
                CommentStub({})._id,
                RequestStub().user.userId
            )

            expect(comment).toEqual(CommentStub({}))
        })
        test("should throw error if unauthorized or comment not found", async () => {
            jest.spyOn(model, "findOne").mockReturnValueOnce(null)

            try {
                await service.deleteComment(
                    CommentStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You are not authorized to delete this comment or it does not exist"
                )
            }
        })
    })

    describe("updateComment", () => {
        test("should return an updated comment", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(CommentStub({}))
            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                CommentStub({
                    content: "updated comment",
                })
            )

            const comment = await service.updateComment(CommentStub({})._id, {
                content: "updated comment",
                reqUserId: RequestStub().user.userId,
            })
            expect(comment).toEqual(
                CommentStub({
                    content: "updated comment",
                })
            )
        })
    })

    describe("updateReplies", () => {
        test("should return a comment with updated replies", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(CommentStub({}))

            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                CommentStub({
                    replies: [ReplyStub({})],
                })
            )

            const comment = await service.updateReplies(
                CommentStub({})._id,
                ReplyStub({})
            )

            expect(comment).toEqual(
                CommentStub({
                    replies: [ReplyStub({})],
                })
            )
        })
        test("should throw error if unauthorized or comment does not exist", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(null)

            try {
                await service.updateReplies(CommentStub({})._id, ReplyStub({}))
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.NOT_FOUND)
                expect(error.message).toEqual("Comment not found")
            }
        })
    })

    describe("likeComment", () => {
        test("should return a the liked comment", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(CommentStub({}))

            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                CommentStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )
            const comment = await service.likeComment(
                CommentStub({})._id,
                RequestStub().user.userId
            )

            expect(comment).toEqual(
                CommentStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )
        })
        test("should throw error if already liked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(
                CommentStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            jest.spyOn(model, "findOne").mockResolvedValueOnce(
                CommentStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )
            try {
                await service.likeComment(
                    CommentStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual("Already liked this comment")
            }
        })
        test("should throw error if not found", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(null)
            try {
                await service.likeComment(
                    CommentStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.NOT_FOUND)
                expect(error.message).toEqual("Comment not found")
            }
        })
    })

    describe("unlikeComment", () => {
        test("should return a the unliked comment ", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(
                CommentStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            jest.spyOn(model, "findOne").mockResolvedValueOnce(CommentStub({}))

            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                CommentStub({})
            )
            const comment = await service.unlikeComment(
                CommentStub({})._id,
                RequestStub().user.userId
            )

            expect(comment).toEqual(CommentStub({}))
        })
        test("should throw error if already unliked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(CommentStub({}))

            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            try {
                await service.unlikeComment(
                    CommentStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You already unliked this comment"
                )
            }
        })
        test("should throw error if not found", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(null)

            try {
                await service.unlikeComment(
                    CommentStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.NOT_FOUND)
                expect(error.message).toEqual("Comment not found")
            }
        })
    })

    describe("deleteAllUserComments", () => {
        test("should return success when delete is successful", async () => {
            jest.spyOn(model, "deleteMany").mockResolvedValueOnce(true as any)
            try {
                const res = await service.deleteAllUserComments(
                    RequestStub().user.userId
                )
                expect(res).toEqual("success")
            } catch (error) {
                expect(error).toBeDefined()
            }
        })
    })

    describe("deleteAllPostComments", () => {
        test("should return success when delete is successful", async () => {
            jest.spyOn(model, "deleteMany").mockResolvedValueOnce(true as any)
            try {
                const res = await service.deleteAllPostComments(
                    PostStub({})._id
                )
                expect(res).toEqual("success")
            } catch (error) {
                expect(error).toBeDefined()
            }
        })
    })
})
