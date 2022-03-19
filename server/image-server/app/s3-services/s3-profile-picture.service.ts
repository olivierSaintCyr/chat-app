import { S3Service } from '@app/s3-services/s3.service';
import { Service } from 'typedi';

const PROFILE_PICTURES_PATH = 'profile-pictures/';

@Service()
export class S3ProfilePictureService {
    constructor(private s3Service: S3Service) {}

    async uploadProfilePicture(pictureId: string, filePath: string) {
        const key = `${PROFILE_PICTURES_PATH}${pictureId}`;
        const s3ObjectKey = await this.s3Service.putObject(key, filePath);
        return s3ObjectKey;
    }

    async getProfilePicture(pictureId: string) {
        const key = `${PROFILE_PICTURES_PATH}${pictureId}`;
        const fileStream = await this.s3Service.getObject(key);
        return fileStream;
    }
}
