import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import { PostService } from "src/post/__mocks__/post.service"
import { createUserDto } from "../dto/create-user.dto"
import { updateUserDto } from "../dto/update-user.dto"

import { User } from "../schema/user.schema"
import { UserController } from "../user.controller"
import { UserService } from "../user.service"
import { FileStub } from "./stubs/file.stub"
import { RequestStub } from "./stubs/request.stub"
import { UserStub } from "./stubs/user.stub"

jest.mock("../user.service.ts")

describe("UserController", () => {
    let userController: UserController
    let userService: UserService

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [UserController],
            providers: [UserService],
        }).compile()
        userController = moduleRef.get<UserController>(UserController)
        userService = moduleRef.get<UserService>(UserService)
        jest.clearAllMocks()
    })

    test("it should be defined", () => {
        expect(userController).toBeDefined()
    })

    describe("getAllUsers", () => {
        let user: User[]

        beforeEach(async () => {
            user = await userController.getAllUsers()
        })
        test("then it should call getAllUsers on the userService", () => {
            expect(userService.getAllUsers).toBeCalled()
        })
        test("it should return an array of users", () => {
            expect(user).toEqual([UserStub({})])
        })
    })

    describe("createUser", () => {
        let user: User
        let createUserDto: createUserDto

        beforeEach(async () => {
            createUserDto = {
                username: UserStub({}).username,
                password: UserStub({}).password,
                email: UserStub({}).email,
                role: UserStub({}).role,
                avatar: FileStub() as Express.Multer.File,
            }
            user = await userController.createUser(
                createUserDto,
                FileStub() as Express.Multer.File
            )
        })
        test("then it should call createUser on the userService", () => {
            expect(userService.createUser).toHaveBeenCalledWith(createUserDto)
        })
        test("it should return a user", () => {
            expect(user).toEqual(UserStub({}))
        })
    })

    describe("searchUser", () => {
        let user: User
        beforeEach(async () => {
            user = await userController.searchUser(UserStub({}).username)
        })
        test("then it should call searchUser on the userService", () => {
            expect(userService.searchUser).toHaveBeenCalledWith(
                UserStub({}).username
            )
        })
        test("it should return a user", () => {
            expect(user).toEqual(UserStub({}))
        })
    })

    describe("deleteUser", () => {
        let user: User
        beforeEach(async () => {
            user = await userController.deleteUser(RequestStub())
        })
        test("then it should call deleteUser on the userService", () => {
            expect(userService.deleteUser).toHaveBeenCalledWith(
                RequestStub().user.userId
            )
        })
        test("it should return a user", () => {
            expect(user).toEqual(UserStub({}))
        })
    })

    describe("updateUser", () => {
        let user: User
        let updateUserDto: updateUserDto

        beforeEach(async () => {
            updateUserDto = {
                email: UserStub({}).email,
                reqUserId: UserStub({})._id,
            }
            user = await userController.updateUser(RequestStub(), updateUserDto)
        })
        test("then it should call updateUser on the userService", () => {
            expect(userService.updateUser).toHaveBeenCalledWith(
                RequestStub().user.userId,
                updateUserDto
            )
        })
        test("it should return a user", () => {
            expect(user).toEqual(UserStub({}))
        })
    })

    describe("followUser", () => {
        let user: User

        beforeEach(async () => {
            user = await userController.followUser(
                RequestStub(),
                "6318bcc92a5dd9414f515c0a"
            )
        })
        test("then it should call followUser on the userService", () => {
            expect(userService.followUser).toHaveBeenCalledWith(
                RequestStub().user.userId,
                "6318bcc92a5dd9414f515c0a"
            )
        })
        test("it should return a user", () => {
            expect(user).toEqual(UserStub({}))
        })
    })
})
