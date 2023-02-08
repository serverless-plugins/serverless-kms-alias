import { DescribeKeyCommand, KMSClient } from '@aws-sdk/client-kms';

import type { ServerlessInstance, ServerlessOptions } from './types';

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

  public constructor(serverless: ServerlessInstance, options: ServerlessOptions) {
    this.configurationVariablesSources = {
      kms: {
        async resolve({ address }: ResolveParams): Promise<ResolveResult> {
          if (!/^(alias\/[a-zA-Z]|arn:aws:kms:[\w-]*:[\d]*:alias)/i.test(address)) {
            throw new Error(`Expected variable in the form of 'kms:alias/foo'`);
          }

          if (serverless.service?.custom?.kmsAlias?.stages?.length) {
            const stage = options?.stage || serverless.config?.stage || serverless.service?.provider?.stage;
            if (stage) {
              if (!serverless.service.custom.kmsAlias.stages.includes(stage)) {
                serverless.cli.log(`Info: KMS Alias plugin not enabled for stage`);
                return {
                  value: address,
                };
              }
            } else {
              serverless.cli.log(`Warn: Unable to determine stage for KMS alias`);
            }
          }

          serverless.cli.log(`Info: Fetching KMS key for alias: ${address}`);

          const client = new KMSClient({
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

export = KmsAliasPlugin;
