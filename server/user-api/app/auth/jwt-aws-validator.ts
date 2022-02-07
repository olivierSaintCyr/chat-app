import jwkToPerm from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { AwsAuthConfig } from '@app/auth/aws-auth-config.interface';
import { Service } from 'typedi';

interface Key {
    alg: string;
    e: string;
    kid: string;
    kty: string;
    n: string;
    use: string;
}

@Service()
export class JWTValidatorService {
    private pems = new Map<string, string>();

    private readonly config: AwsAuthConfig = {
        region: process.env.AWS_COGNITO_CONFIG_REGION as string,
        userPoolId: process.env.AWS_COGNITO_CONFIG_IDENTITY_POOL_ID as string
    };

    constructor() {
        this.init();
    }

    get iss() {
        return `https://cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}`;
    }

    get jwksUrl() {
        return `${this.iss}/.well-known/jwks.json`;
    }

    private getPem(decodedToken: jwt.Jwt) {
        const { kid } = decodedToken.header;
        if (!kid) {
            throw Error(`Kid value is undefined`);
        }
        return this.pems.get(kid);
    }

    async validate(token: string) {
        const decodedToken = jwt.decode(token, { complete : true });
        if (!decodedToken) {
            throw Error('jwt invalid');
        }

        const pem = this.getPem(decodedToken);
        if (pem) {
            return jwt.verify(token, pem, { algorithms: ['RS256'] });
        }
        await this.refresh();
        const retryPem = this.getPem(decodedToken);
        if (!retryPem) {
            throw Error('Invalid JWT');
        }
        return jwt.verify(token, retryPem, { algorithms: ['RS256'] });
    }

    async init() {
        if (this.pems.size !== 0) return;

        const resp = await this.fetchJwks();
        const keys = resp.data.keys;
        console.log('keys', keys)
        keys.forEach((jwk) => {
            const kid = (jwk as Key).kid;
            const pem = jwkToPerm(jwk, { private : false });
            this.pems.set(kid, pem);
        });
    }

    async refresh() {
        this.pems = new Map<string, string>();
        await this.init();
    }

    async fetchJwks() {
        return axios.get<{keys: jwkToPerm.JWK[]}>(this.jwksUrl);
    }
}
