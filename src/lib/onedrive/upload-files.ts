'use server';

import { createOneDriveClient } from '@/lib/onedrive/client';

export async function uploadFiles(data: FormData) {
  const onedrive = createOneDriveClient();

  const address = data.get('address')! as string;
  const files = data.getAll('files') as File[];

  const failed = [];
  const success = [];
  const baseUploadPath = `awake-solar/project-upload/${address.replaceAll(' ', '_')}/`;
  for (const file of files) {
    const fileParts = file.name.split('.');
    const extension =
      fileParts.length > 1 ? `.${fileParts[fileParts.length - 1]}` : '';
    try {
      await onedrive.uploadFile(
        `${baseUploadPath}/${crypto.randomUUID()}${extension}`,
        Buffer.from(await file.arrayBuffer())
      );
      success.push(file.name);
    } catch (e) {
      console.error(`Failed to upload ${file.name} - ${e}`);
      failed.push(file.name);
    }
  }

  const messageParts = [];
  if (success.length) {
    messageParts.push(`Successfully uploaded [${success}].`);
  }

  if (failed.length) {
    messageParts.push(`Failed to upload [${failed}].`);
  }

  const message = messageParts.join(' ');

  if (failed.length > 0) {
    throw new Error(message);
  }
}
