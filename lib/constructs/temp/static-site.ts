import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  CertificateValidation,
  DnsValidatedCertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  ErrorResponse,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginAccessIdentity,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import {
  BucketDeployment,
  BucketDeploymentProps,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { execSync } from 'child_process';
import { Construct } from 'constructs';
import * as path from 'path';

export interface StaticSiteProps {
  subdomain: string;
  bundling: {
    command: string;
    entry: string;
    outputDirs: Array<string>;
  };
  config?: Record<string, string>;
}

type CreateBucketDeploymentParams = {
  bucket: Bucket;
  distribution: Distribution;
};

export class StaticSite extends Construct {
  private readonly props: StaticSiteProps;

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id);
    this.props = props;

    this.executeBuildCommand(props);

    const { bucket, originAccessIdentity } = this.createBucket();

    const { domainName, certificate, hostedZone } =
      this.createVerifiedCustomDomain();

    const distribution = this.createCustomDomainDistribution({
      domainName,
      certificate,
      bucket,
      originAccessIdentity,
    });

    this.createAliasRecord({ hostedZone, distribution });

    this.createBucketDeployment({ bucket, distribution });
  }

  private executeBuildCommand(props: StaticSiteProps) {
    const { command, entry } = props.bundling;

    execSync(command, {
      cwd: entry,
      stdio: 'inherit',
    });
  }

  private createBucketDeployment({
    bucket,
    distribution,
  }: CreateBucketDeploymentParams) {
    const cacheEnabled = true;
    const bucketDeploymentProps = cacheEnabled
      ? this.getBucketDeploymentWithCacheInvalidationProps({
          bucket,
          distribution,
        })
      : this.getBucketDeploymentProps({ bucket, distribution });

    new BucketDeployment(this, 'Deployment', bucketDeploymentProps);
  }

  private getBucketDeploymentWithCacheInvalidationProps({
    bucket,
    distribution,
  }: CreateBucketDeploymentParams): BucketDeploymentProps {
    return {
      ...this.getBucketDeploymentProps({
        bucket,
        distribution,
      }),
      distribution: distribution,
      distributionPaths: ['/*'],
    };
  }

  private getBucketDeploymentProps({
    bucket,
  }: CreateBucketDeploymentParams): BucketDeploymentProps {
    const staticSiteSources = this.props.bundling.outputDirs.map((source) =>
      Source.asset(source),
    );

    const sources = [...staticSiteSources];

    if (this.props.config) {
      const configSource = this.getConfigSource();
      sources.push(configSource);
    }

    return {
      sources,
      destinationBucket: bucket,
    };
  }

  private getConfigSource() {
    const { config } = this.props;
    const parameterConfig: Record<string, string> = {};
    for (const key in config) {
      // Workaround for cross-stack refs: Replace tokens with parameter.stringValue
      // see https://github.com/aws/aws-cdk/issues/19257#issuecomment-1102807097
      parameterConfig[key] = new StringParameter(this, key + 'Parameter', {
        stringValue: config[key],
      }).stringValue;
    }

    const configSource = Source.jsonData('config/config.json', parameterConfig);
    return configSource;
  }

  private createAliasRecord({
    hostedZone,
    distribution,
  }: {
    hostedZone: IHostedZone;
    distribution: Distribution;
  }) {
    const namespace = 'TEMP'; // TODO: Replace this
    const { subdomain } = this.props;
    const recordName = namespace ? `${subdomain}.${namespace}` : subdomain;
    new ARecord(this, 'ARecord', {
      recordName: recordName,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }

  private createCustomDomainDistribution({
    domainName,
    certificate,
    bucket,
    originAccessIdentity,
  }: {
    domainName: string;
    certificate: DnsValidatedCertificate;
    bucket: Bucket;
    originAccessIdentity: OriginAccessIdentity;
  }) {
    const cloudfrontCachePolicy = CachePolicy.CACHING_OPTIMIZED;

    const addSecurityHeadersLambda = new Function(
      this,
      'AddSecurityHeadersExampleSite',
      {
        code: FunctionCode.fromFile({
          filePath: path.join(__dirname, 'cloudfront-functions', 'index.js'),
        }),
      },
    );

    const spaRedirectToIndex: ErrorResponse = {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
      ttl: Duration.seconds(0),
    };

    const distribution = new Distribution(this, 'Distribution', {
      domainNames: [domainName],
      certificate: certificate,
      defaultRootObject: 'index.html',
      errorResponses: [spaRedirectToIndex],
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: originAccessIdentity,
        }),
        functionAssociations: [
          {
            function: addSecurityHeadersLambda,
            eventType: FunctionEventType.VIEWER_RESPONSE,
          },
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfrontCachePolicy,
        originRequestPolicy: OriginRequestPolicy.USER_AGENT_REFERER_HEADERS,
      },
    });
    return distribution;
  }

  private createVerifiedCustomDomain() {
    const { subdomain } = this.props;
    const { hostedZoneName, hostedZoneId } = {
      hostedZoneId: 'TEMP',
      hostedZoneName: 'TEMP',
    }; // TODO: Replace this
    const { namespaceDomainName } = { namespaceDomainName: 'TEMP' }; // TODO: Replace this

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      zoneName: hostedZoneName,
      hostedZoneId: hostedZoneId,
    });

    const domainName = `${subdomain}.${namespaceDomainName}`;

    const certificate = new DnsValidatedCertificate(this, 'Certificate', {
      hostedZone: hostedZone,
      domainName: domainName,
      validation: CertificateValidation.fromDns(hostedZone),
    });
    return { domainName, certificate, hostedZone };
  }

  private createBucket() {
    const bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
    );
    bucket.grantRead(originAccessIdentity);
    return { bucket, originAccessIdentity };
  }
}
