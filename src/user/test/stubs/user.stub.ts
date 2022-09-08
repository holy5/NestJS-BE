import { IUser } from "src/interface/user.interface"

export const UserStub = ({
    id = "62f524f35214538a12ec13bf",
    username = "test user",
    bio = "test bio",
    totalPosts = 0,
    followers = {
        total: 0,
        users: [],
    },
    followings = {
        total: 0,
        users: [],
    },
    posts = [],
    savedPosts = [],
    email = "testemail@email.com",
    password = "testpassword",
    avatar = "",
    privacy = "public" as "public" | "private",
    role = "user" as "user" | "admin",
}): IUser => {
    return {
        _id: id,
        username,
        bio,
        totalPosts,
        followers,
        followings,
        posts,
        savedPosts,
        email,
        password,
        avatar,
        privacy,
        role,
    }
}
