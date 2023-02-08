# serverless-kms-alias

[![NPM version](https://img.shields.io/npm/v/serverless-kms-alias.svg?style=flat)](https://npmjs.org/package/serverless-kms-alias)
[![node version](https://img.shields.io/node/v/serverless-kms-alias.svg?style=flat)](https://nodejs.org)

Serverless plugin to expand a KMS alias variable to the ARN of the KMS key

## Usage

`${kms:<alias>}` will expand to the ARN of the kms key. The variable can be used anywhere that other Serverless
variables are resolved.

### Example - Provider kmsKeyArn

```yaml
service: foo

provider:
  name: aws
  kmsKeyArn: '${kms:alias/aws/lambda}'
  runtime: nodejs16.x

plugins:
  - serverless-kms-alias

functions:
  foo:
    handler: foo.handler
```

### Example - Function kmsKeyArn

```yaml
service: foo
provider:
  name: aws
  runtime: nodejs16.x

plugins:
  - serverless-kms-alias

functions:
  foo:
    handler: foo.handler
    kmsKeyArn: '${kms:arn:aws:kms:${aws:region}:${aws:accountId}:alias/aws/lambda}'
```

### Example - Disable the plugin

```yaml
service: foo
provider:
  name: aws
  runtime: nodejs16.x

plugins:
  - serverless-kms-alias

custom:
  kmsAlias:
    enabled: false

functions:
  foo:
    handler: foo.handler
    kmsKeyArn: '${kms:arn:aws:kms:${aws:region}:${aws:accountId}:alias/aws/lambda}'
```
