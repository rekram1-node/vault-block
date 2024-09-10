import { FolderSync } from "lucide-react";
import React, { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface SyncNotionButtonProps {
  onClick?: () => void;
  disabled: boolean;
}

export const SyncNotionButton = forwardRef<
  HTMLSpanElement,
  SyncNotionButtonProps
>(({ onClick, disabled }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block" ref={ref}>
          <Button
            className="right-4 top-4 bg-transparent"
            variant="secondary"
            size="icon"
            disabled={disabled}
            onClick={onClick}
          >
            <FolderSync className="h-6 w-6" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent className="rounded px-3 py-2 shadow-lg" side="bottom">
        <p>Sync Vaults with Notion</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

SyncNotionButton.displayName = "TooltipButton";
