import { HttpStatus } from "@nestjs/common"
import { checkObjectIdValidity } from "../checkObjectIdValidity"

describe("checkObjectIdValidity", () => {
    it("should throw error if objectId is valid", () => {
        try {
            const ids = ["asdfasdgsdg"]
            checkObjectIdValidity(ids)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.status).toBe(HttpStatus.BAD_REQUEST)
            expect(error.message).toBe("Invalid object id")
        }
    })
})
