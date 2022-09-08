import { HttpException, HttpStatus } from "@nestjs/common"
import mongoose from "mongoose"

export function checkObjectIdValidity(ids: string[]): void {
    for (const id of ids) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException("Invalid object id", HttpStatus.BAD_REQUEST)
        }
    }
}
