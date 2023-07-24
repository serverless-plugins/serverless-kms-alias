import type { AwsAuthInputConfig } from '@aws-sdk/middleware-signing/dist-types';

import type { KmsAliasSettings } from './KmsAliasSettings';

export interface ServerlessInstance {
  providers: {
    aws: {
      getCredentials(): AwsAuthInputConfig['credentials'];
      getRegion(): string;
    };
  };
  service?: {
    custom?: {
      kmsAlias?: KmsAliasSettings;
    };
  };
  cli: {
    log(str: string, entity?: string): void;
  };
}
