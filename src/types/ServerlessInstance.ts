import type { HttpAuthSchemeInputConfig } from '@aws-sdk/client-kms/dist-types/auth/httpAuthSchemeProvider';

import type { KmsAliasSettings } from './KmsAliasSettings.js';

export interface ServerlessInstance {
  providers: {
    aws: {
      getCredentials(): HttpAuthSchemeInputConfig['credentials'];
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
