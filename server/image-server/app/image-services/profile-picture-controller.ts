import { ProfilePictureService } from '@app/image-services/profile-picture.service';
import { PROFILE_PICTURE_UPLOAD_DIR_PATH } from '@app/path';
import { Router } from 'express';
import multer from 'multer';


export class ProfilePictureController {
    readonly router = Router();

    private upload = multer({ dest: PROFILE_PICTURE_UPLOAD_DIR_PATH });

    constructor(private profilePictureService: ProfilePictureService) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/:imageId', async (req, res) => {
            const { imageId } = req.params;
            if (imageId === undefined) {
                return res.sendStatus(400);
            }
            const readStream = await this.profilePictureService.getPicture(imageId);
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
}
