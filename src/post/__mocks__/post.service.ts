import { PostStub } from "../test/stubs/post.stub"

export const PostService = jest.fn().mockReturnValue({
    getAllPosts: jest.fn().mockResolvedValue([PostStub({})]),
    getUserPosts: jest.fn().mockResolvedValue([PostStub({})]),
    createPost: jest.fn().mockResolvedValue(PostStub({})),
    getPostById: jest.fn().mockResolvedValue(PostStub({})),
    deletePost: jest.fn().mockResolvedValue(PostStub({})),
    likePost: jest.fn().mockResolvedValue(PostStub({})),
    unlikePost: jest.fn().mockResolvedValue(PostStub({})),
})
