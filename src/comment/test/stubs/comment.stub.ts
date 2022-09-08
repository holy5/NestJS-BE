import { IComment } from "src/interface/comment.interface"
import { RequestStub } from "../../../user/test/stubs/request.stub"

export const CommentStub = ({
    id = "507f191e810c19729de860ea",
    postId = "00000020f51bb4362eee2a4d",
    commentOwnerId = RequestStub().user.userId,
    content = "this is a comment",
    replies = [],
    like = {
        total: 0,
        users: [],
    },
}): IComment => {
    return {
        _id: id,
        postId,
        commentOwnerId,
        content,
        like,
        replies,
    }
}
