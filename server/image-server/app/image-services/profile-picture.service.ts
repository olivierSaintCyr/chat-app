import { S3ProfilePictureService } from '@app/s3-services/s3-profile-picture.service';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

@Service()
export class ProfilePictureService {
    constructor(private s3ProfilePictureService: S3ProfilePictureService) {}

    async uploadPicture(filePath: string) {
        const pictureId = uuidv4();
        const picturePath = await this.s3ProfilePictureService.uploadProfilePicture(
            pictureId,
            filePath,
        );
        this.removeTempFile(filePath);
        return picturePath;
    }

    async getPicture(pictureId: string) {
        const fileStream = await this.s3ProfilePictureService.getProfilePicture(
            pictureId,
        );
        return fileStream;
    }

    private removeTempFile(filepath: string) {
        fs.unlinkSync(filepath);
    }
}
