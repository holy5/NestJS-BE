import { IReply } from "src/interface/reply.interface"
import { RequestStub } from "../../../user/test/stubs/request.stub"

export const ReplyStub = ({
    id = "507f191e810c19729de860ea",
    postId = "507f191e810c19729de860ef",
    commentId = "6315c46d99b0c15cc6853abc",
    content = "test reply",
    replyOwnerId = RequestStub().user.userId,
    like = {
        total: 0,
        users: [],
    },
}): IReply => {
    return {
        _id: id,
        postId,
        commentId,
        content,
        replyOwnerId,
        like,
    }
}
