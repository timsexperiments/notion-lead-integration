'use client';

import { uploadFiles } from '@/app/actions/upload-files';
import { LeadSearch } from '@/app/components/lead-search';
import FileDropzone from '@/components/file-drop';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormState, useFormStatus } from 'react-dom';

export const UploadForm = () => {
  const [state, formAction] = useFormState(uploadFiles, {
    message: '',
    failed: 0,
    success: 0,
  });
  const { pending } = useFormStatus();

  return (
    <form
      action={formAction}
      id="upload-form"
      encType="multipart/form-data"
      className="mt-6 space-y-4">
      {state.message && (
        <div className={state.failed ? 'text-red-600' : 'text-primary-600'}>
          {state.message}
        </div>
      )}
      <div>
        <Label htmlFor="address">Address</Label>
        <LeadSearch />
      </div>
      <div>
        <Label htmlFor="photo">Photo</Label>
        <FileDropzone id="files" name="files" multiple />
      </div>
      <div>
        <Label htmlFor="caption">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Add notes for your photo..."
          rows={3}
        />
      </div>
      <Button className="w-full" type="submit" disabled={pending}>
        Upload Photo
      </Button>
    </form>
  );
};

export default UploadForm;
