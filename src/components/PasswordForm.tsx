import { useState } from "react";
import { EyeOpenIcon, EyeNoneIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { LoadingSpinner } from "./Loading";

export interface PasswordSubmitResult {
  valid: boolean;
  errMsg: string;
}

interface PasswordFormParams {
  inputPlaceholder: string;
  submitButtonName: string;
  isLoading: boolean;
  handlePassword(password: string): Promise<PasswordSubmitResult>;
}

const PasswordForm = ({
  inputPlaceholder,
  submitButtonName,
  isLoading,
  handlePassword,
}: PasswordFormParams) => {
  const [password, setPassword] = useState("");
  const [eyeOpen, setEyeOpen] = useState(true);

  const handlePasswordSubmit = async () => {
    await handlePassword(password);
  };

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <input
            type={eyeOpen ? "password" : "text"}
            placeholder={inputPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handlePasswordSubmit();
              }
            }}
            className="input w-full rounded border bg-background p-2"
            required
          />
          <button
            onClick={() => setEyeOpen(!eyeOpen)}
            className="ml-2"
            title={eyeOpen ? "Show password" : "Hide password"}
          >
            {eyeOpen ? (
              <EyeOpenIcon className="h-5 w-5" />
            ) : (
              <EyeNoneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <button
          onClick={handlePasswordSubmit}
          className="flex items-center justify-center rounded border bg-primary p-2 hover:brightness-75"
        >
          {!isLoading && (
            <>
              <LockOpen1Icon className="mr-2" />
              {submitButtonName}
            </>
          )}
          {isLoading && (
            <div className="py-1">
              <LoadingSpinner />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordForm;
