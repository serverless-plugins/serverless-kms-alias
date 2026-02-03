import { DescribeKeyCommand, KMSClient } from '@aws-sdk/client-kms';

import type { ServerlessInstance } from './types/index.js';

interface ResolveParams {
  address: string;
  params?: string[];
  resolveVariable: (name: string) => Promise<string>;
}

interface ResolveResult {
  value: string;
}

interface ServerlessVariableSource {
  resolve(params: ResolveParams): Promise<ResolveResult>;
}

class KmsAliasPlugin {
  public configurationVariablesSources: Record<string, ServerlessVariableSource>;

  public constructor(serverless: ServerlessInstance) {
    this.configurationVariablesSources = {
      kms: {
        async resolve({ address }: ResolveParams): Promise<ResolveResult> {
          if (!/^(alias\/[a-z]|arn:aws:kms:[\w-]*:\d*:alias)/i.test(address)) {
            throw new Error(`Expected variable in the form of 'kms:alias/foo'`);
          }

          if (serverless.service?.custom?.kmsAlias?.enabled != null) {
            try {
              const isEnabled = serverless.service.custom.kmsAlias.enabled ? Boolean(JSON.parse(serverless.service.custom.kmsAlias.enabled.toLowerCase())) : false;
              if (!isEnabled) {
                serverless.cli.log(`Info: KMS Alias plugin not enabled`);
                return {
                  value: address,
                };
              }
            } catch (ex) {
              throw new Error(`Unable to get enabled configuration for kms alias.`, {
                cause: ex,
              });
            }
          }

          serverless.cli.log(`Info: Fetching KMS key for alias: ${address}`);

          const client = new KMSClient({
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...serverless.providers.aws.getCredentials(),
            region: serverless.providers.aws.getRegion(),
          });
          const command = new DescribeKeyCommand({
            KeyId: address,
          });
          const response = await client.send(command);

          const keyMetadata = response.KeyMetadata;

          if (!keyMetadata) {
            throw new Error(`Unable to get key metadata for kms alias: ${address}`);
          }

          if (!keyMetadata.Arn) {
            throw new Error(`Unable to determine ARN for kms alias: ${address}`);
          }

          serverless.cli.log(`Info: Found KMS key for alias (${address}): ${keyMetadata.Arn}`);

          return {
            value: keyMetadata.Arn,
          };
        },
      },
    };
  }
}

export default KmsAliasPlugin;
