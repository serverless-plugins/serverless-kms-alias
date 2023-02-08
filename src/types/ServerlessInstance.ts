import type { AwsAuthInputConfig } from '@aws-sdk/middleware-signing/dist-types/configurations';

import type { KmsAliasSettings } from './KmsAliasSettings';

export interface ServerlessInstance {
  config?: {
    stage?: string;
  };
  providers: {
    aws: {
      getCredentials(): AwsAuthInputConfig['credentials'];
      getRegion(): string;
    };
  };
  service: {
    provider: {
      stage?: string;
    };
    custom: {
      kmsAlias?: KmsAliasSettings;
    };
  };
  cli: {
    log(str: string, entity?: string): void;
  };
}
