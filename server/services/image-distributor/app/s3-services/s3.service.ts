import { Service } from 'typedi';
import fs from 'fs';
import S3 from 'aws-sdk/clients/s3';



@Service()
export class S3Service {

    private client: S3;

    private readonly bucketName = process.env.AWS_S3_NAME;
    private readonly region = process.env.AWS_S3_REGION;
    private readonly accessKeyId = process.env.AWS_ACCESS_ID;
    private readonly secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    constructor() {
        this.client = new S3({
            region: this.region,
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
        });
    }

    async putObject(key: string, filePath: string) {
        if (!this.bucketName) {
            console.log(this.bucketName, this.region, this.accessKeyId, this.secretAccessKey);
            throw Error('Bucket name not in .env');
        }

        const fileStream = fs.createReadStream(filePath);
        
        const uploadParams = {
            Bucket: this.bucketName,
            Body: fileStream,
            Key: key,
        };

        const s3Res = await this.client.upload(uploadParams).promise();
        return s3Res.Key;
    }


    async getObject(key: string) {
        if (!this.bucketName) {
            throw Error('Bucket name not in .env');
        }

        const downloadParams = {
            Bucket: this.bucketName,
            Key: key,
        };

        return this.client.getObject(downloadParams).createReadStream();
    }
}
