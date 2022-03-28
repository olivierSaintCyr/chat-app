import axios from 'axios';
import { Service } from 'typedi';
import fs from 'fs';
import FormData from 'form-data';

interface ImageServerResData {
    imageId: string;
}

@Service()
export class ProfilePictureService {
    private readonly imageServerUrl: string = process.env.IMAGE_SERVER_HOST as string;

    async updatePictureFile(file: Express.Multer.File) {
        const imageId = await this.sendImageToImageServer(file);
        return imageId;
    }

    private async sendImageToImageServer(file: Express.Multer.File) {
        const form = this.createFormDataForFile(file);
        const formHeaders = form.getHeaders();
        const reqParams = {
            headers: {
                ...formHeaders,
            }
        };
        try {
            const res = await axios.post<ImageServerResData>(
                this.imageServerUrl,
                form,
                reqParams,
            );
            const { imageId } = res.data;
            return imageId;
        } catch (e) {
            return null;
        }        
    }

    private createFormDataForFile(file: Express.Multer.File) {
        const form = new FormData();
        const contentType = file.mimetype;
        const filePath = file.path;
        const fileStream = fs.createReadStream(filePath);
        form.append('image', fileStream, { contentType });
        return form;
    }
}
