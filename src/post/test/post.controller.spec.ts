import { Test } from "@nestjs/testing"
import { FileStub } from "../../user/test/stubs/file.stub"
import { RequestStub } from "../../user/test/stubs/request.stub"
import { PostController } from "../post.controller"
import { PostService } from "../post.service"
import { Post } from "../schema/post.schema"
import { PostStub } from "./stubs/post.stub"

jest.mock("../post.service.ts")

describe("PostController", () => {
    let postController: PostController
    let postService: PostService

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [PostController],
            providers: [PostService],
        }).compile()

        postController = moduleRef.get<PostController>(PostController)
        postService = moduleRef.get<PostService>(PostService)
        jest.clearAllMocks()
    })
    test("should be defined", () => {
        expect(postController).toBeDefined()
    })

    describe("getAllPosts", () => {
        let posts: Post[]

        beforeEach(async () => {
            posts = await postController.getAllPosts()
        })
        test("should call getAllPosts on the PostService", () => {
            expect(postService.getAllPosts).toBeCalled()
        })
        test("should return an array of posts", () => {
            expect(posts).toEqual([PostStub({})])
        })
    })

    describe("findUserPosts", () => {
        let posts: Post[]

        beforeEach(async () => {
            posts = await postController.getUserPosts(RequestStub())
        })
        test("should call findUserPosts on the PostService", () => {
            expect(postService.getUserPosts).toBeCalledWith(
                RequestStub().user.userId
            )
        })
        test("should return an array of posts", () => {
            expect(posts).toEqual([PostStub({})])
        })
    })

    describe("createPost", () => {
        let post: Post
        beforeEach(async () => {
            post = await postController.createPost(RequestStub(), [FileStub()])
        })
        test("should call createPost on the PostService", () => {
            expect(postService.createPost).toBeCalledWith({
                postOwnerId: RequestStub().user.userId,
                content: [FileStub()],
            })
        })
        test("should return a post", () => {
            expect(post).toEqual(PostStub({}))
        })
    })

    describe("findPostById", () => {
        let post: Post
        beforeEach(async () => {
            post = await postController.getPostById(PostStub({})._id)
        })
        test("should call findPostById on the PostService", () => {
            expect(postService.getPostById).toBeCalledWith(PostStub({})._id)
        })
        test("should return a post", () => {
            expect(post).toEqual(PostStub({}))
        })
    })

    describe("deletePost", () => {
        let post: Post
        beforeEach(async () => {
            post = await postController.deletePost(
                PostStub({})._id,
                RequestStub()
            )
        })
        test("should call deletePost on the PostService", () => {
            expect(postService.deletePost).toBeCalledWith(
                PostStub({})._id,
                RequestStub().user.userId
            )
        })
        test("it should return a post", () => {
            expect(post).toEqual(PostStub({}))
        })
    })

    describe("unlikePost", () => {
        let post: Post
        beforeEach(async () => {
            post = await postController.unlikePost(
                PostStub({})._id,
                RequestStub()
            )
        })
        test("should call unlikePost on the PostService", () => {
            expect(postService.unlikePost).toBeCalledWith(
                PostStub({})._id,
                RequestStub().user.userId
            )
        })
        test("it should return a post", () => {
            expect(post).toEqual(PostStub({}))
        })
    })
})
