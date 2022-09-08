import { createMock } from "@golevelup/ts-jest"
import { ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { RolesGuard } from "../roles.guard"

describe("RolesGuard", () => {
    let guard: RolesGuard
    let reflector: Reflector

    beforeEach(() => {
        reflector = new Reflector()
        guard = new RolesGuard(reflector)
    })

    it("should be defined", () => {
        expect(guard).toBeDefined()
    })
    it("should return true if no roles are required", () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined)
        const context = createMock<ExecutionContext>()
        const canActivate = guard.canActivate(context)

        expect(canActivate).toBeTruthy()
    })
    it("should return true if user has one of the required roles", () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue("user")
        const context = createMock<ExecutionContext>()
        context.switchToHttp().getRequest.mockReturnValue({
            user: {
                role: "user",
            },
        })
        const canActivate = guard.canActivate(context)

        expect(canActivate).toBeTruthy()
    })
    it("should return false if user has no required roles", () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue("user")
        const context = createMock<ExecutionContext>()
        context.switchToHttp().getRequest.mockReturnValue({
            user: {
                role: "admin",
            },
        })
        const canActivate = guard.canActivate(context)

        expect(canActivate).toBeFalsy()
    })
})
