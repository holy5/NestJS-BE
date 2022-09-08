export const FileStub = () => {
    return {
        fieldname: 'avatar',
        originalname: 'sample.jpg',
        encoding: '7bit',
        size: 6969696,
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
    } as Express.Multer.File
}
