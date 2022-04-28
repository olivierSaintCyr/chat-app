import { ProfilePictureService } from '@app/image-services/profile-picture.service';
import { Router } from 'express';
import internal from 'stream';


export class ProfilePictureController {
    readonly router = Router();

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
    }
}
