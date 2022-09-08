import { UserStub } from "../test/stubs/user.stub"

export const UserService = jest.fn().mockReturnValue({
    getAllUsers: jest.fn().mockResolvedValue([UserStub({})]),
    createUser: jest.fn().mockResolvedValue(UserStub({})),
    searchUser: jest.fn().mockResolvedValue(UserStub({})),
    deleteUser: jest.fn().mockResolvedValue(UserStub({})),
    updateUser: jest.fn().mockResolvedValue(UserStub({})),
    followUser: jest.fn().mockResolvedValue(UserStub({})),
})
