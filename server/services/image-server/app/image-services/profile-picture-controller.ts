import { ProfilePictureService } from '@app/image-services/profile-picture.service';
import { PROFILE_PICTURE_UPLOAD_DIR_PATH } from '@app/paths';
import { SUPPORTED_FILES } from '@app/supported-files';
import { Router } from 'express';
import multer from 'multer';
import internal from 'stream';


export class ProfilePictureController {
    readonly router = Router();

    private upload: multer.Multer = multer(
        { 
            dest: PROFILE_PICTURE_UPLOAD_DIR_PATH,
            fileFilter: (req, file, cb) => {
                const fileType = file.mimetype;
                this.checkFileType(fileType, cb);
            },
        }
    );

    private supportedTypes = new Set(SUPPORTED_FILES);

    constructor(private profilePictureService: ProfilePictureService) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/:imageId', async (req, res) => {
            const { imageId } = req.params;
            if (imageId === undefined) {
                return res.sendStatus(400);
            }
            const readStream: internal.Readable = await this.profilePictureService.getPicture(imageId);
            readStream.on('error', () => res.sendStatus(404));
            readStream.pipe(res);
        });

        this.router.post('/', this.upload.single('image'), async (req, res) => {
            const { file } = req;
            if (file === undefined) {
                return res.sendStatus(400);
            }
            const filePath = (file as Express.Multer.File).path;
            const imageId = await this.profilePictureService.uploadPicture(filePath);
            return res.send({ imageId });
        });
    }

    private checkFileType(fileType: string, cb: multer.FileFilterCallback) {
        if (!this.supportedTypes.has(fileType)) {
            const err = new Error(`The file type: ${fileType} is not accepted for a profile picture`);
            return cb(err);
        }
        cb(null, true);
    }
}
