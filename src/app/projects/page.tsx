import OneDriveClient from '@/lib/onedrive/client';
import { Metadata } from 'next';
import Link from 'next/link';

export const runtime = 'edge';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { project: string };
}) {
  const address = getAddressFromSearchParams(searchParams);

  return {
    title: address,
  } satisfies Metadata;
}

export default async function Project({
  searchParams,
}: {
  searchParams: { project: string };
}) {
  const address = getAddressFromSearchParams(searchParams);

  const onedrive = new OneDriveClient();
  let fileResponses;
  try {
    fileResponses = await onedrive.getFiles(searchParams.project);
  } catch (e) {
    console.error(e);
  }

  let files;
  try {
    files = (fileResponses ?? []).map(
      (fileResponse) => fileResponse['@microsoft.graph.downloadUrl']
    );
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <main className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {address}
          </h1>
          <Link
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-zinc-50 ring-offset-white transition-colors hover:bg-primary-600/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-primary-400 dark:text-zinc-400 dark:ring-offset-zinc-950 dark:hover:bg-zinc-400/90 dark:focus-visible:ring-zinc-300"
            href="/">
            Submit project photos
          </Link>
        </div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          View all the photos uploaded for {address}.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(files ?? []).map((fileUrl) => (
            <img
              key={fileUrl}
              alt="Photo"
              className="aspect-video w-[300px] rounded-md object-cover"
              src={fileUrl}
            />
          ))}
          {(files ?? []).length === 0 && (
            <p className="text-center">No photos were uploaded.</p>
          )}
        </div>
      </main>
    </>
  );
}

function getAddressFromSearchParams(searchParams: { project: string }) {
  console.log(searchParams);
  const addressLocation = searchParams.project;
  const addressLocationParts = addressLocation.split('/');
  return addressLocationParts[addressLocationParts.length - 1].replaceAll(
    '_',
    ' '
  );
}
