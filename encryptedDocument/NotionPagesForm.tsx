import { type Page } from "~/lib/notion/notion";
import { PlusCircledIcon } from "@radix-ui/react-icons";

type Props = {
  pages: Page[];
  closeModal: () => void;
  onAddPage: (pageId: string) => void;
};

const NotionPagesForm = ({ pages, closeModal, onAddPage }: Props) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModal}
    >
      <div
        className="rounded-lg border bg-background p-4 shadow-lg"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
        }}
      >
        <h2 className="text-lg font-bold">
          Select notion documents to add your protected Page to
        </h2>
        <div className="mt-4 h-auto max-h-96 w-full overflow-y-auto">
          <ul className="space-y-2">
            {pages.map((page) => (
              <li
                key={page.id}
                className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <span className="mr-4 flex-grow truncate font-medium">
                  {page.name}
                </span>
                <button
                  onClick={() => {
                    onAddPage(page.id);
                    closeModal();
                  }}
                  className="rounded-full p-2 transition-colors duration-200 focus:outline-none"
                >
                  <PlusCircledIcon className="h-6 w-6" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotionPagesForm;
