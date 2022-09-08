import { getModelToken } from "@nestjs/mongoose"
import { Test } from "@nestjs/testing"
import { Reply, ReplyDocument } from "../schema/reply.schema"
import { ReplyService } from "../reply.service"
import { ReplyStub } from "./stub/reply.stub"
import { Model, Query } from "mongoose"
import { CommentService } from "../../comment/comment.service"
import { createMock } from "@golevelup/ts-jest"
import { RequestStub } from "../../user/test/stubs/request.stub"
import { HttpStatus } from "@nestjs/common"

const QUERY_LIMIT = 2

class mockReplyModel {
    constructor(private data: Reply) {}
    new = jest.fn().mockResolvedValue(ReplyStub(this.data))
    save = jest.fn().mockReturnValueOnce(ReplyStub(this.data))

    static find = jest.fn()
    static findOne = jest.fn()
    static findById = jest.fn()
    static findByIdAndUpdate = jest.fn()
    static select = jest.fn()
    static remove = jest.fn()
}

describe("ReplyService", () => {
    let service: ReplyService
    let model: Model<ReplyDocument>

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ReplyService,
                {
                    provide: getModelToken(Reply.name),
                    useValue: mockReplyModel,
                },
                {
                    provide: CommentService,
                    useValue: createMock<CommentService>(),
                },
            ],
        }).compile()
        service = module.get<ReplyService>(ReplyService)
        model = module.get<Model<ReplyDocument>>(getModelToken(Reply.name))
    })
    afterEach(() => jest.clearAllMocks())

    test("service should be defined", () => {
        expect(service).toBeDefined()
    })
    test("model should be defined", () => {
        expect(model).toBeDefined()
    })

    describe("getAllReplies", () => {
        test("should return an array of replies", async () => {
            jest.spyOn(model, "find").mockResolvedValueOnce([
                ReplyStub({}),
                ReplyStub({
                    id: "6315bf24a4c5aea8355c00c0",
                }),
            ])

            const replies = await service.getAllReplies()

            expect(replies).toEqual([
                ReplyStub({}),
                ReplyStub({
                    id: "6315bf24a4c5aea8355c00c0",
                }),
            ])
        })
    })

    describe("createReply", () => {
        test("should create a new reply", async () => {
            // jest.spyOn(model,)

            const reply = await service.createReply({
                content: ReplyStub({}).content,
                commentId: ReplyStub({}).commentId,
                postId: ReplyStub({}).postId,
                replyOwnerId: ReplyStub({}).replyOwnerId,
            })

            expect(reply).toEqual(ReplyStub({}))
        })
    })

    describe("getCommentReplies", () => {
        test("should return an array of replies with limit", async () => {
            jest.spyOn(model, "find").mockReturnValueOnce(
                createMock<Query<ReplyDocument, ReplyDocument>>({
                    limit: jest.fn().mockResolvedValueOnce([
                        ReplyStub({}),
                        ReplyStub({
                            id: "6315c403a60cd7d744c62d0e",
                        }),
                    ]),
                }) as any
            )

            const replies = await service.getCommentReplies(
                ReplyStub({}).commentId,
                {
                    limit: QUERY_LIMIT,
                }
            )

            expect(replies).toHaveLength(QUERY_LIMIT)
            expect(replies).toEqual([
                ReplyStub({}),
                ReplyStub({
                    id: "6315c403a60cd7d744c62d0e",
                }),
            ])
        })
    })

    describe("updateReply", () => {
        test("should update a reply properly", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(ReplyStub({}))
            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                ReplyStub({
                    content: "updated content",
                })
            )
            const reply = await service.updateReply(ReplyStub({})._id, {
                content: "updated content",
                reqUserId: RequestStub().user.userId,
            })
            expect(reply).toEqual(
                ReplyStub({
                    content: "updated content",
                })
            )
        })
        test("should throw error if reply not found or unauthorized", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)
            try {
                await service.updateReply(ReplyStub({})._id, {
                    content: "updated content",
                    reqUserId: RequestStub().user.userId,
                })
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You are not authorized to edit this reply or it does not exist"
                )
            }
        })
    })

    describe("deleteReply", () => {
        test("should delete a reply properly", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce({
                ...ReplyStub({}),
                ...createMock<Query<ReplyDocument, ReplyDocument>>({
                    remove: jest.fn().mockResolvedValueOnce(ReplyStub({})),
                }),
            })

            const reply = await service.deleteReply(
                ReplyStub({})._id,
                RequestStub().user.userId
            )

            expect(reply).toEqual(ReplyStub({}))
        })

        test("should throw error if reply not found or unauthorized", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)
            try {
                await service.deleteReply(
                    ReplyStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You are not authorized to delete this reply or it does not exist"
                )
            }
        })
    })

    describe("likeReply", () => {
        test("should return the like reply", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(ReplyStub({}))

            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                ReplyStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            const reply = await service.likeReply(
                ReplyStub({})._id,
                RequestStub().user.userId
            )

            expect(reply).toEqual(
                ReplyStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )
        })
        test("should throw error if already liked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(ReplyStub({}))

            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            jest.spyOn(model, "findOne").mockResolvedValueOnce(
                ReplyStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            try {
                await service.likeReply(
                    ReplyStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual("Already liked this reply")
            }
        })
        test("should throw error if not found", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(null)
            try {
                await service.likeReply(
                    ReplyStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.NOT_FOUND)
                expect(error.message).toEqual("Reply not found")
            }
        })
    })

    describe("unlikeReply", () => {
        test("should return the unliked reply", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(
                ReplyStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            jest.spyOn(model, "findOne").mockResolvedValueOnce(
                ReplyStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                ReplyStub({})
            )

            const reply = await service.unlikeReply(
                ReplyStub({})._id,
                RequestStub().user.userId
            )

            expect(reply).toEqual(ReplyStub({}))
        })
        test("should throw error if already unliked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(ReplyStub({}))

            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            try {
                await service.unlikeReply(
                    ReplyStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual("Already unliked this reply")
            }
        })
        test("should throw error if not found", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(null)
            try {
                await service.unlikeReply(
                    ReplyStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.NOT_FOUND)
                expect(error.message).toEqual("Reply not found")
            }
        })
    })
})
