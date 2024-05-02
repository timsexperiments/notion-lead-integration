import { inspect } from 'util';

interface AccessTokenResponse {
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
}

interface UploadFileResponse {
  '@odata.context': string;
  '@microsoft.graph.downloadUrl'?: string;
  id: string;
  name: string;
  eTag: string;
  cTag: string;
  size: number;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export type GetFilesResponse = {
  '@odata.context': string;
  value: {
    '@microsoft.graph.downloadUrl': string;
    '@microsoft.graph.Decorator': string;
    createdBy: {
      application: {
        id: string;
        displayName: string;
      };
      user: {
        displayName: string;
      };
    };
    createdDateTime: string;
    eTag: string;
    id: string;
    lastModifiedBy: {
      application: {
        id: string;
        displayName: string;
      };
      user: {
        displayName: string;
      };
    };
    lastModifiedDateTime: string;
    name: string;
    parentReference: {
      driveType: string;
      driveId: string;
      id: string;
      name: string;
      path: string;
      siteId: string;
    };
    webUrl: string;
    cTag: string;
    file: {
      hashes: {
        quickXorHash: string;
      };
      mimeType: string;
    };
    fileSystemInfo: {
      createdDateTime: string;
      lastModifiedDateTime: string;
    };
    image: {
      height: number;
      width: number;
    };
    location: {
      address: {
        city: string;
        countryOrRegion: string;
        locality: string;
        postalCode: string;
        state: string;
      };
      coordinates: {
        altitude: number;
        latitude: number;
        longitude: number;
      };
      displayName: string;
    };
    photo: {
      cameraMake: string;
      cameraModel: string;
      exposureDenominator: number;
      exposureNumerator: number;
      fNumber: number;
      focalLength: number;
      iso: number;
      orientation: string;
      takenDateTime: string;
    };
    size: number;
  }[];
};

export class OneDriveClient {
  private readonly tokenEndpoint: string;

  private accessToken?: string;
  private expiresAt?: number;

  constructor(
    private readonly tenantId = process.env.MICROSOFT_TENANT_ID!,
    private readonly clientId = process.env.MICROSOFT_APP_ID!,
    private readonly clientSecret = process.env.ONEDRIVE_CLIENT_SECRET!,
    private readonly driveId = process.env.ONEDRIVE_DRIVE_ID!
  ) {
    this.tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  }

  private fetchAccessToken = async () => {
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data: AccessTokenResponse = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${inspect(data)}`);
    }
    this.accessToken = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in - 300) * 1000; // Subtract 5 minutes for safety
  };

  private async ensureAccessToken() {
    if (!this.accessToken || !this.expiresAt || Date.now() >= this.expiresAt) {
      await this.fetchAccessToken();
    }
  }

  getFiles = async (location: string) => {
    await this.ensureAccessToken();
    const getURL = `https://graph.microsoft.com/v1.0/drives/${this.driveId}/root:/${location}:/children`;
    console.log(getURL);
    const response = await fetch(getURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data: GetFilesResponse = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to get files: ${inspect(data)}`);
    }
    return data.value;
  };

  uploadFile = async (filePath: string, fileContent: Buffer) => {
    await this.ensureAccessToken();
    // await this.getFiles();
    const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${this.driveId}/root:/${filePath}:/content`;
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileContent,
    });

    const data: UploadFileResponse = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${inspect(data)}`);
    }
    return data;
  };
}

type CreateOneDriveClientOptions = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

export function createOneDriveClient(opts?: CreateOneDriveClientOptions) {
  return new OneDriveClient(opts?.tenantId, opts?.clientId, opts?.clientSecret);
}

export default OneDriveClient;
