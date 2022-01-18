import type { AwsAuthInputConfig } from '@aws-sdk/middleware-signing/dist-types/configurations';

export interface ServerlessInstance {
  providers: {
    aws: {
      getCredentials(): AwsAuthInputConfig['credentials'];
      getRegion(): string;
    };
  };
  cli: {
    log(str: string, entity?: string): void;
  };
}
