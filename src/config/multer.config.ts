import { UnsupportedMediaTypeException } from '@nestjs/common'
import { Request } from 'express'
import multer, { memoryStorage, Multer } from 'multer'

export const multerConfig = {
    storage: memoryStorage(),
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
        const fileType = file.mimetype
        if (
            fileType === 'image/png' ||
            fileType === 'image/jpeg' ||
            fileType === 'image/jpg' ||
            fileType === 'video/mp4'
        ) {
            cb(null, true)
        } else {
            cb(
                new UnsupportedMediaTypeException(
                    'Only jpeg, jpg and png are allowed'
                )
            )
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 25, //25MB
        files: 10,
    },
}
