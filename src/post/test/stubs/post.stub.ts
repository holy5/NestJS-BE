import { IPost } from "src/interface/post.interface"
import { RequestStub } from "../../../user/test/stubs/request.stub"

export const PostStub = ({
    id = "63174de8e7b307364bf3c6e4",
    content = ["hello"],
    postOwnerId = RequestStub().user.userId,
    like = {
        total: 0,
        users: [],
    },
    comments = [],
}): IPost => {
    return {
        _id: id,
        content,
        postOwnerId,
        like,
        comments,
    }
}
