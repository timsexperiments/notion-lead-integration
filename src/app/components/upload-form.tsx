'use client';

import FileDropzone from '@/components/file-drop';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Combobox from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/lib/types';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type UploadError = {
  error: string;
};

type UploadFormProps = {
  leadOptions: Lead[];
};

export const UploadForm = ({ leadOptions }: UploadFormProps) => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const formSchema = z.object({
    address: z
      .string({ required_error: 'Address cannot be empty.' })
      .min(1, 'Address cannot be empty.'),
    files: z.any().refine(
      () => !validateFiles(),
      () => ({
        message: validateFiles()?.message,
      })
    ),
    notes: z.string().optional(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
  });
  const [error, setError] = useState<string>('');

  const options = leadOptions.map(({ id, name, address }) => ({
    key: id,
    displayName: `${name} - ${address}`,
    value: address,
  }));

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const formData = new FormData();
    formData.append('address', values.address);
    for (const file of files) {
      formData.append('files', file);
    }
    if (values.notes) {
      formData.append('notes', values.notes);
    }
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data: UploadError | null = await response.json();
      if (!response.ok && data) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log(e);
    }
    router.push(
      `/projects?project=${encodeURIComponent(`awake-solar/project-upload/${values.address.replaceAll(' ', '_')}`)}`
    );
  }

  function validateFiles() {
    if (!files.length) {
      return {
        message: 'At least 1 photo is required.',
        type: 'required',
      };
    }

    const invalidFiles = files.filter((file) => file.size / 1000000 > 100);
    if (invalidFiles.length) {
      return {
        message: 'Photos cannot be larger than 100 MB.',
        type: 'min',
      };
    }

    return undefined;
  }

  return (
    <Form {...form}>
      <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {error && (
          <Alert variant="destructive">
            <FontAwesomeIcon className="h-4 w-4" icon={faCircleExclamation} />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Combobox
                  id="address"
                  className="flex w-full justify-between text-left"
                  placeholder="Select an address..."
                  options={options}
                  {...field}
                  onChange={(value) => {
                    form.setValue('address', value);
                  }}
                />
              </FormControl>
              <FormDescription>
                This is the address the photos where the photos were taken.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <FileDropzone
                  id="files"
                  multiple
                  onChange={(files, target) => {
                    field.value = target.value;
                    setFiles(Array.from(files));
                  }}
                />
              </FormControl>
              <FormDescription>
                Upload the images of the installation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  id="notes"
                  placeholder="Add notes for your photo..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any additional notes about the installation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={loading}>
          Upload Installation Photos
        </Button>
      </form>
    </Form>
  );
};

export default UploadForm;
