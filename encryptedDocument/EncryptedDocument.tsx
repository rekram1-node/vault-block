import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { api } from "~/utils/api";
import {
  OpenInNewWindowIcon,
  CopyIcon,
  TrashIcon,
  FileTextIcon,
  DotsVerticalIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import Modal from "../Modal";

export interface EncryptedDocument {
  id: string;
  name: string;
}

interface EncryptedDocumentProps {
  document: EncryptedDocument;
  onAddToNotion: () => void;
  setSelectedPage: (pageId: string) => void;
}

const EncryptedDocument = ({
  document,
  onAddToNotion,
  setSelectedPage,
}: EncryptedDocumentProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const { mutate, isLoading: isDeleteLoading } =
    api.encryptedDocuments.delete.useMutation({
      onSuccess: () => {
        void utils.encryptedDocuments.getAll.invalidate();
        setIsDeleteModalVisible(false);
        enqueueSnackbar(`Deleted ${document.name}`, {
          autoHideDuration: 3000,
          variant: "success",
        });
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          enqueueSnackbar(errorMessage[0], {
            autoHideDuration: 3000,
            variant: "error",
          });
        } else {
          enqueueSnackbar(
            "Failed to delete protected page! Please try again later.",
            {
              autoHideDuration: 3000,
              variant: "error",
            },
          );
        }
      },
    });

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
    setBaseUrl(baseUrl);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    window.document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const link = `${baseUrl}/protected/${document.id}`;

  const onCopy = () => {
    void navigator.clipboard.writeText(link);
    enqueueSnackbar(`Copied url to clipboard`, {
      autoHideDuration: 3000,
      variant: "info",
    });
    setIsDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="relative mt-4 flex w-full flex-col items-center rounded-xl border-2 bg-card shadow-md">
          <div className="w-full">
            <div className="card variant-glass flex items-center justify-start p-6">
              <FileTextIcon className="mr-4 h-6 w-6" />
              <h5 className="h5 text-xl">{document.name}</h5>
              <div className="ml-auto flex items-center">
                <button
                  className="relative"
                  onClick={() => {
                    toggleDropdown();
                    setSelectedPage(document.id);
                  }}
                  title="More options"
                >
                  <DotsVerticalIcon className="h-6 w-6" />
                </button>
                {isDropdownVisible && (
                  <div
                    ref={dropdownRef}
                    className="card absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border-2 bg-card ring-black ring-opacity-5"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onAddToNotion();
                          toggleDropdown();
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <PlusIcon className="mr-3 h-5 w-5" />
                        Add to Notion
                      </button>
                      <button
                        onClick={onCopy}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <CopyIcon className="mr-3 h-5 w-5" />
                        Copy URL
                      </button>
                      <Link
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsDropdownVisible(false)}
                      >
                        <div className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent">
                          <OpenInNewWindowIcon className="mr-3 h-5 w-5" />
                          Open in new tab
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setIsDeleteModalVisible(true);
                          setIsDropdownVisible(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <TrashIcon className="mr-3 h-5 w-5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isDeleteModalVisible && (
        <Modal
          title="Confirm Deletion"
          content={
            <p className="">Are you sure you want to delete {document.name}?</p>
          }
          isLoading={isDeleteLoading}
          onCancel={() => setIsDeleteModalVisible(false)}
          onConfirm={() => mutate({ id: document.id })}
        />
      )}
    </>
  );
};

export default EncryptedDocument;
