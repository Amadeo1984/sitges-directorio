import 'server-only';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET ?? 'sitges-media';
const accessKeyId = process.env.S3_ACCESS_KEY ?? '';
const secretAccessKey = process.env.S3_SECRET_KEY ?? '';
const publicUrl = process.env.S3_PUBLIC_URL ?? endpoint ?? '';

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true, // necesario para MinIO
});

export const STORAGE_BUCKET = bucket;

export function publicUrlFor(key: string): string {
  if (!publicUrl) return '';
  return `${publicUrl.replace(/\/$/, '')}/${bucket}/${key}`;
}

export async function getUploadUrl(opts: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: opts.expiresIn ?? 300 });
  return url;
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
