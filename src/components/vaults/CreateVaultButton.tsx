import React, { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface CreateVaultButtonProps {
  onClick?: () => void;
  disabled: boolean;
}

export const CreateVaultButton = forwardRef<
  HTMLSpanElement,
  CreateVaultButtonProps
>(({ onClick, disabled }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block" ref={ref}>
          <Button
            className="right-4 top-4"
            disabled={disabled}
            onClick={disabled ? undefined : onClick}
          >
            New Vault
          </Button>
        </span>
      </TooltipTrigger>
      {disabled && (
        <TooltipContent
          className="rounded bg-gray-800 px-3 py-2 text-white shadow-lg"
          side="bottom"
        >
          <p>You've reached the maximum number of vaults.</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
));

CreateVaultButton.displayName = "TooltipButton";
