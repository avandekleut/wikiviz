import { CfnOutput, Duration } from 'aws-cdk-lib';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface WikiVizDistributionProps {
  dataBucket: Bucket;
}

export class WikiVizDistribution extends Construct {
  private readonly props: WikiVizDistributionProps;

  constructor(scope: Construct, id: string, props: WikiVizDistributionProps) {
    super(scope, id);
    this.props = props;

    const distribution = this.createDomainDistribution({
      path: '/data*',
      bucket: props.dataBucket,
    });

    new CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
  }

  private createDomainDistribution({
    path,
    bucket,
  }: {
    path: string;
    bucket: Bucket;
  }) {
    const originAccessIdentity = this.createAccessId(bucket);

    const distribution = new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: originAccessIdentity,
        }),
      },
    });

    const s3Origin = new S3Origin(bucket, {
      originAccessIdentity: originAccessIdentity,
    });

    const dataCachePolicy = new CachePolicy(this, 'DataCachePolicy', {
      minTtl: Duration.minutes(5),
      maxTtl: Duration.minutes(5),
    });

    distribution.addBehavior(path, s3Origin, {
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      cachedMethods: AllowedMethods.ALLOW_GET_HEAD,
      cachePolicy: dataCachePolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
    });

    return distribution;
  }

  private createAccessId(bucket: Bucket) {
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
    );
    bucket.grantRead(originAccessIdentity);
    return originAccessIdentity;
  }
}
