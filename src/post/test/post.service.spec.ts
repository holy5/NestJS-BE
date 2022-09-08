import { createMock } from "@golevelup/ts-jest"
import { getModelToken } from "@nestjs/mongoose"
import { Test } from "@nestjs/testing"
import mongoose, { Model, Query } from "mongoose"
import { FileStub } from "../../user/test/stubs/file.stub"
import * as uploadStream from "../../utils/uploadStream"
import { CommentService } from "../../comment/comment.service"
import { PostService } from "../post.service"
import { Post, PostDocument } from "../schema/post.schema"
import { HttpStatus } from "@nestjs/common"
import { PostStub } from "./stubs/post.stub"
import { RequestStub } from "../../user/test/stubs/request.stub"

class mockPostModel {
    constructor(private data: Post) {}
    new = jest.fn().mockResolvedValueOnce(PostStub(this.data))
    save = jest.fn().mockReturnValueOnce(PostStub(this.data))

    static find = jest.fn()
    static findOne = jest.fn()
    static findById = jest.fn()
    static findByIdAndUpdate = jest.fn()
    static select = jest.fn()
    static update = jest.fn()
}

describe("PostService,", () => {
    let service: PostService
    let model: Model<PostDocument>

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: getModelToken(Post.name),
                    useValue: mockPostModel,
                },
                {
                    provide: CommentService,
                    useValue: createMock<CommentService>(),
                },
            ],
        }).compile()
        service = module.get<PostService>(PostService)
        model = module.get<Model<PostDocument>>(getModelToken(Post.name))
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    test("service should be defined", () => {
        expect(service).toBeDefined()
    })
    test("model should be defined", () => {
        expect(model).toBeDefined()
    })

    describe("getAllPosts", () => {
        test("should return an array of posts", async () => {
            jest.spyOn(model, "find").mockResolvedValueOnce([
                PostStub({}),
                PostStub({
                    id: "630089583779289459691g82",
                }),
            ])

            const posts = await service.getAllPosts()

            expect(posts).toEqual([
                PostStub({}),
                PostStub({
                    id: "630089583779289459691g82",
                }),
            ])
        })
    })

    describe("createPost", () => {
        test("should return a post", async () => {
            jest.spyOn(uploadStream, "uploadStream").mockResolvedValueOnce([
                {
                    secure_url: "this is some url",
                },
            ])

            const post = await service.createPost({
                content: [FileStub()] as Express.Multer.File[],
                postOwnerId: RequestStub().user.userId,
            })
            expect(post).toEqual(
                PostStub({
                    content: ["this is some url"],
                })
            )
        })
    })

    describe("findPostById", () => {
        test("should return a post", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(PostStub({}))

            const post = await service.getPostById(PostStub({})._id)
            expect(post).toEqual(PostStub({}))
        })
    })

    describe("findUserPosts", () => {
        test("should return all posts of a user", async () => {
            jest.spyOn(model, "find").mockResolvedValueOnce([
                PostStub({}),
                PostStub({
                    id: "630089583779289459691g82",
                    content: ["this is some content"],
                }),
            ])

            const posts = await service.getUserPosts(PostStub({}).postOwnerId)

            expect(posts).toEqual([
                PostStub({}),
                PostStub({
                    id: "630089583779289459691g82",
                    content: ["this is some content"],
                }),
            ])
        })
    })

    describe("deletePost", () => {
        test("should delete and return a post", async () => {
            jest.spyOn(model, "findOne").mockReturnValueOnce({
                ...createMock<Query<PostDocument, PostDocument>>({
                    remove: jest.fn().mockResolvedValueOnce(PostStub({})),
                }),
                ...PostStub({}),
            })
            const post = await service.deletePost(
                PostStub({})._id,
                RequestStub().user.userId
            )
            expect(post).toEqual(PostStub({}))
        })

        test("should throw error if unauthorized", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            try {
                await service.deletePost(
                    PostStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You are not authorized to delete this post or it does not exist"
                )
            }
        })
    })

    describe("likePost", () => {
        test("should return a post that is liked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(PostStub({}))
            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)
            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                PostStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            const post = await service.likePost(
                PostStub({})._id,
                RequestStub().user.userId
            )

            expect(post).toEqual(
                PostStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )
        })
        test("should throw error if already liked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(PostStub({}))
            jest.spyOn(model, "findOne").mockResolvedValueOnce(
                PostStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            try {
                await service.likePost(
                    PostStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You have already liked this post"
                )
            }
        })
    })

    describe("unlikePost", () => {
        test("should return a post that is unliked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(
                PostStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            jest.spyOn(model, "findOne").mockResolvedValueOnce(
                PostStub({
                    like: {
                        total: 1,
                        users: [RequestStub().user.userId],
                    },
                })
            )

            jest.spyOn(model, "findByIdAndUpdate").mockResolvedValueOnce(
                PostStub({})
            )

            const post = await service.unlikePost(
                PostStub({})._id,
                RequestStub().user.userId
            )

            expect(post).toEqual(PostStub({}))
        })
        test("should throw error if already unliked", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(PostStub({}))

            jest.spyOn(model, "findOne").mockResolvedValueOnce(null)

            try {
                await service.unlikePost(
                    PostStub({})._id,
                    RequestStub().user.userId
                )
            } catch (error) {
                expect(error).toBeDefined()
                expect(error.status).toEqual(HttpStatus.BAD_REQUEST)
                expect(error.message).toEqual(
                    "You have already unliked this post"
                )
            }
        })
    })
})
