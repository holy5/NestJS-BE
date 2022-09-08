import { createMock } from "@golevelup/ts-jest"
import { HttpStatus } from "@nestjs/common"
import { getModelToken } from "@nestjs/mongoose"
import { Test } from "@nestjs/testing"
import { Model, Query } from "mongoose"
import { PostService } from "../../post/post.service"
import { User, UserDocument } from "../schema/user.schema"
import { UserService } from "../user.service"
import { RequestStub } from "./stubs/request.stub"
import { UserStub } from "./stubs/user.stub"

const { password, ...userWithoutPasswordField } = UserStub({})

class mockUserModel {
    constructor(private data: User) {}
    new = jest.fn().mockResolvedValue(UserStub(this.data))
    save = jest.fn().mockReturnValueOnce(UserStub(this.data))

    static find = jest.fn()
    static findOne = jest.fn()
    static findById = jest.fn()
    static findByIdAndUpdate = jest.fn()
    static select = jest.fn()
    static update = jest.fn()
    static remove = jest.fn()
}

describe("UserService", () => {
    let service: UserService
    let model: Model<UserDocument>

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: PostService,
                    useValue: createMock<UserService>(),
                },
            ],
        }).compile()

        service = module.get<UserService>(UserService)
        model = module.get<Model<UserDocument>>(getModelToken(User.name))
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

    describe("createUser", () => {
        test("create should create a new user if user doesn't exist", async () => {
            jest.spyOn(model, "findOne").mockResolvedValue(null)
            jest.spyOn(model, "findById").mockReturnValueOnce(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest
                        .fn()
                        .mockResolvedValueOnce(userWithoutPasswordField),
                })
            )

            const newUser = await service.createUser({
                username: UserStub({}).username,
                email: UserStub({}).email,
                password: UserStub({}).password,
            })

            expect(newUser).toEqual(userWithoutPasswordField)
        })
        test("should throw an error if user already exists", async () => {
            jest.spyOn(model, "findOne").mockResolvedValue(UserStub({}))
            try {
                await service.createUser({
                    username: UserStub({}).username,
                    email: UserStub({}).email,
                    password: UserStub({}).password,
                })
            } catch (error) {
                expect(error.status).toEqual(HttpStatus.CONFLICT)
                expect(error.message).toEqual("User already exists")
            }
        })
    })

    describe("getAllUsers", () => {
        test("should return all users", async () => {
            jest.spyOn(model, "find").mockResolvedValueOnce([
                UserStub({}),
                UserStub({
                    id: "6318bcc92a5dd9414f515c0a",
                }),
            ])
            const users = await service.getAllUsers()
            expect(users).toEqual([
                UserStub({}),
                UserStub({
                    id: "6318bcc92a5dd9414f515c0a",
                }),
            ])
        })
    })

    describe("searchUser", () => {
        test("it should search for a user that match username or email", async () => {
            jest.spyOn(model, "findOne").mockReturnValueOnce(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest
                        .fn()
                        .mockResolvedValueOnce(userWithoutPasswordField),
                }) as any
            )

            const user = await service.searchUser(UserStub({}).username)
            expect(user).toEqual(userWithoutPasswordField)
        })
    })

    describe("getUserFullInfo", () => {
        test("should return a user with password field", async () => {
            jest.spyOn(model, "findOne").mockResolvedValueOnce(UserStub({}))
            const user = await service.getUserFullInfo(UserStub({}).username)

            expect(user).toEqual(UserStub({}))
        })
    })

    describe("deleteUser", () => {
        test("should delete a user properly and return the deleted user without a password field", async () => {
            jest.spyOn(model, "findById").mockReturnValueOnce(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest.fn().mockImplementationOnce(() => ({
                        remove: jest
                            .fn()
                            .mockResolvedValueOnce(userWithoutPasswordField),
                    })),
                })
            )
            const deletedUser = await service.deleteUser(UserStub({})._id)
            expect(deletedUser).toEqual(userWithoutPasswordField)
        })
        test("should throw error when user doesn't exist", async () => {
            jest.spyOn(model, "findById").mockReturnValueOnce(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest.fn().mockImplementationOnce(() => ({
                        remove: jest
                            .fn()
                            .mockResolvedValueOnce(userWithoutPasswordField),
                    })),
                })
            )
            try {
                await service.deleteUser("6318c092d55d9916574fe4ed")
            } catch (error) {
                expect(error.status).toEqual(HttpStatus.NOT_FOUND)
                expect(error.message).toEqual("User doesn't exist")
            }
        })
    })

    describe("updateUser", () => {
        test("should update user properly", async () => {
            jest.spyOn(model, "findByIdAndUpdate").mockReturnValueOnce(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest.fn().mockResolvedValueOnce({
                        ...userWithoutPasswordField,
                        email: "newemail@mail.com",
                    }),
                })
            )
            const updatedUser = await service.updateUser(UserStub({})._id, {
                email: "newemail@mail.com",
                reqUserId: RequestStub().user.userId,
            })
            expect(updatedUser).toEqual({
                ...userWithoutPasswordField,
                email: "newemail@mail.com",
            })
        })
    })

    describe("followUser", () => {
        test("should follow a user properly", async () => {
            jest.spyOn(model, "findById").mockReturnValue(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest
                        .fn()
                        .mockResolvedValueOnce({
                            _id: "630089583779289459691d81",
                            ...userWithoutPasswordField,
                        })
                        .mockResolvedValueOnce({
                            _id: "630089583779289459691d82",
                            ...userWithoutPasswordField,
                        }),
                })
            )

            jest.spyOn(model, "findByIdAndUpdate").mockReturnValue(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest
                        .fn()
                        .mockResolvedValueOnce({
                            followers: {
                                total: 1,
                                users: ["630089583779289459691d81"],
                            },
                            _id: "630089583779289459691d82",
                        })
                        .mockResolvedValueOnce({
                            followings: {
                                total: 1,
                                users: ["630089583779289459691d82"],
                            },
                            _id: "630089583779289459691d81",
                        }),
                })
            )

            // console.log(userWithoutPasswordField)
            const followingUser = await service.followUser(
                "630089583779289459691d81",
                "630089583779289459691d82"
            )

            expect(followingUser.followings.total).toEqual(1)
            expect(followingUser.followings.users).toEqual([
                "630089583779289459691d82",
            ])
        })
    })

    describe("unfollowUser", () => {
        test("should unfollow a user properly", async () => {
            jest.spyOn(model, "findById").mockReturnValue(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest
                        .fn()
                        .mockResolvedValueOnce({
                            ...userWithoutPasswordField,
                            _id: "630089583779289459691d81",
                            followings: {
                                total: 1,
                                users: ["630089583779289459691d82"],
                            },
                        })
                        .mockResolvedValueOnce({
                            ...userWithoutPasswordField,
                            _id: "630089583779289459691d82",
                            followers: {
                                total: 1,
                                users: ["630089583779289459691d81"],
                            },
                        }),
                })
            )

            jest.spyOn(model, "findByIdAndUpdate").mockReturnValue(
                createMock<Query<UserDocument, UserDocument>>({
                    select: jest
                        .fn()
                        .mockResolvedValueOnce({
                            ...userWithoutPasswordField,
                            followers: {
                                total: 0,
                                users: [],
                            },
                            _id: "630089583779289459691d82",
                        })
                        .mockResolvedValueOnce({
                            ...userWithoutPasswordField,
                            followings: {
                                total: 0,
                                users: [],
                            },
                            _id: "630089583779289459691d81",
                        }),
                })
            )

            const followingUser = await service.unfollowUser(
                "630089583779289459691d81",
                "630089583779289459691d82"
            )

            expect(followingUser.followings.total).toEqual(0)
            expect(followingUser.followings.users).toEqual([])
        })
    })
})
