'use client';

import { useForwardRef } from '@/hooks/use-forward-ref';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { faUpload, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDropzone } from 'react-dropzone';

export type FileDropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'onChange'
> & {
  onChange?: (files: Iterable<File>, target: HTMLInputElement) => void;
};

export const FileDropzone = React.forwardRef<
  HTMLInputElement,
  FileDropzoneProps
>(
  (
    {
      id = `files_${crypto.randomUUID()}`,
      multiple = false,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const [animationParent] = useAutoAnimate();
    const [files, setFiles] = useState<File[]>([]);
    const ref = useForwardRef(forwardedRef);
    const { getRootProps, getInputProps } = useDropzone({
      onDrop: (files) => {
        if (!ref.current) {
          return;
        }

        setFiles((existing) => {
          const fileList = [...existing, ...files];
          if (onChange) {
            onChange(fileList, ref.current!);
          }
          return fileList;
        });
      },
    });

    const onRemoveFile = useCallback(
      (file: File) => {
        setFiles((files) => {
          if (!ref.current) {
            return files;
          }
          const filtered = files.filter((f) => f !== file);

          return filtered;
        });
      },
      [files, ref]
    );

    useEffect(() => {
      if (ref.current) {
        const transfer = new DataTransfer();
        for (const file of files) {
          transfer.items.add(file);
        }
        ref.current.files = transfer.files;
      }
      return () => {};
    }, [files, ref]);

    return (
      <div>
        <label
          className="flex h-32 w-full cursor-pointer appearance-none items-center justify-center gap-4 rounded-md border-2 border-dashed border-zinc-200 bg-white px-4 transition hover:border-primary-600 focus:border-primary-600 focus:outline-none active:border-primary-600"
          htmlFor={id}
          {...getRootProps()}>
          <FontAwesomeIcon className="h-6 w-6 text-zinc-600" icon={faUpload} />
          <span className="flex items-center space-x-2">
            <span className="font-medium text-zinc-600">
              Drop files or&nbsp;
              <span className="text-primary-600 underline">browse</span>
            </span>
          </span>
          <input
            className="hidden"
            id={id}
            type="file"
            {...getInputProps({
              multiple,
              ...props,
              ref: ref,
            })}
          />
        </label>
        {files && files.length > 0 && (
          <ul
            ref={animationParent}
            className="mt-2 grid w-full grid-cols-3 gap-4">
            {files.map((file) => (
              <li
                className="group/file relative aspect-[4/3]"
                key={`${file.name}+${file.size}+${file.type}+${file.webkitRelativePath}`}>
                <img
                  className="h-full w-full object-cover"
                  src={URL.createObjectURL(file)}
                />
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-zinc-950/20 opacity-0 transition-opacity duration-300 ease-in-out group-hover/file:opacity-100"></div>
                <FontAwesomeIcon
                  className="absolute right-2 top-2 cursor-pointer text-zinc-50 opacity-0 group-hover/file:opacity-100"
                  icon={faXmarkCircle}
                  onClick={() => onRemoveFile(file)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

FileDropzone.displayName = 'FileDropzone';

export default FileDropzone;
