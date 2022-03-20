import { ProfilePictureService } from '@app/image-services/profile-picture.service';
import { Router } from 'express';

export class ProfilePictureController {
    readonly router = Router();

    constructor(private profilePictureService: ProfilePictureService) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/:imageId', (req, res) => {
            const { imageId } = req.params;
            if (imageId === undefined) {
                return res.sendStatus(400);
            }
            console.log(imageId);
            return res.sendStatus(200);
        });

        this.router.post('/', async (req, res) => {
            const filePath = './data/images/1_mk1-6aYaf_Bes1E3Imhc0A.jpeg';
            const imageId = await this.profilePictureService.uploadPicture(filePath);
            return res.send({ imageId });
        });
    }
}