import { fetchLeadRecords } from '@/lib/notion/lead';
import UploadForm from './components/upload-form';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  return (
    <main className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Upload Photos for Your Address
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Upload photos associated with a specific address and view them in a
            gallery.
          </p>
          <UploadForm leadOptions={await fetchLeadRecords()} />
        </div>
      </div>
    </main>
  );
}
