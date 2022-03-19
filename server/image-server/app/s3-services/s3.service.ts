import { Service } from 'typedi';
import fs from 'fs';
import S3 from 'aws-sdk/clients/s3';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_S3_REGION;
const accessKeyId = process.env.AWS_ACCESS_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

@Service()
export class S3Service {
    private client = new S3({
        region,
        accessKeyId,
        secretAccessKey,
    });

    async putObject(filePath: string, key: string) {
        if (!bucketName) {
            throw Error('Bucket name not in .env');
        }

        const fileStream = fs.createReadStream(filePath);
        
        const uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: key,
        };

        const s3Res = await this.client.upload(uploadParams).promise();
        return s3Res.Key;
    }


    async getObject(key: string) {
        if (!bucketName) {
            throw Error('Bucket name not in .env');
        }

        const downloadParams = {
            Bucket: bucketName,
            Key: key,
        };

        return this.client.getObject(downloadParams).createReadStream();
    }
}
