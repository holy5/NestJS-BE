import { IRequest } from "src/interface/request.interface"
import { UserStub } from "./user.stub"

export const RequestStub = () => {
    return {
        user: {
            userId: UserStub({})._id,
            username: UserStub({}).username,
            role: UserStub({}).role,
        },
    } as unknown as IRequest
}
