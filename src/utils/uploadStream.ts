import { HttpException, HttpStatus } from '@nestjs/common'

import cloudinary from '../config/cloudinary.config'

export const uploadStream = async (
    folder: string,
    files: Express.Multer.File[]
): Promise<any> => {
    const multiplePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: folder,
                    },
                    async (error: any, result: any) => {
                        if (error) {
                            reject(error)
                            throw new HttpException(
                                error,
                                HttpStatus.BAD_REQUEST
                            )
                        }
                        resolve(result)
                        return result
                    }
                )
                .end(file.buffer)
        })
    })
    return await Promise.all(multiplePromises)
}
