import { useState } from "react";
import { debounce } from "lodash";
import { LoadingSpinner } from "~/components/Loading";
import { useInitializeEncryptedDocument } from "./useInitializeEncryptedDocument";
import { type DocumentData } from "~/types/DocumentData";

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

const CreateForm = ({
  id,
  onCreation,
}: {
  id: string;
  onCreation: (data: DocumentData, key: Buffer) => void;
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validPassword =
    password !== "" && password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;
  const isError = !validPassword || !passwordsMatch;

  const disabled =
    isError || !password || !confirmPassword || confirmPassword !== password;

  const closeModal = (data: DocumentData, key: Buffer) => {
    setPassword("");
    setConfirmPassword("");
    onCreation(data, key);
  };
  const { mutate, isLoading } = useInitializeEncryptedDocument(id, closeModal);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
  };

  const onConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setConfirmPassword(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="max-h-screen overflow-auto rounded-lg bg-card p-4 shadow-lg"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
        }}
      >
        <h2 className="text-lg font-bold">Initialize Protected Page</h2>
        <form className="mt-2">
          <div className="-mx-3 mb-6">
            <div className="px-3 pt-2">
              <div className="mb-1">
                <label className="mb-1 block text-sm font-semibold">
                  Set Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="••••••••"
                  className={
                    password === "" || validPassword
                      ? "block w-full rounded-lg border px-4 py-3 leading-tight"
                      : "block w-full rounded-lg border border-error-light px-4 py-3 leading-tight focus:outline-none"
                  }
                  onChange={debounce(onPasswordChange, 600)}
                />
              </div>
              <div className="mb-4 block">
                <p
                  className={`text-xs italic text-error-light ${(password === "" || validPassword) && "text-transparent"}`}
                >
                  Password needs: 8 characters, at least one number, at least
                  one uppercase and one lowercase letter.
                </p>
              </div>
              <div className="mb-1">
                <label className="mb-1 block text-sm font-semibold">
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  required
                  placeholder="••••••••"
                  className={
                    confirmPassword === "" || passwordsMatch
                      ? "block w-full rounded-lg border px-4 py-3 leading-tight"
                      : "block w-full rounded-lg border border-error-light px-4 py-3 leading-tight focus:outline-none"
                  }
                  onChange={debounce(onConfirmPasswordChange, 600)}
                  onKeyDown={(e) => {
                    if (disabled || isLoading) return;
                    if (e.key === "Enter") {
                      void mutate(password);
                    }
                  }}
                />
              </div>
              <div className="mt-1 h-5">
                {confirmPassword !== "" && !passwordsMatch && (
                  <p className="text-xs italic text-error-light">
                    Passwords do not match.
                  </p>
                )}
              </div>
              <p className="text-s mt-4 italic">
                This password will be used to decrypt your page, remember it
              </p>
            </div>
          </div>
        </form>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className={`rounded bg-primary px-4 py-2 hover:brightness-75 ${disabled || isLoading ? "cursor-not-allowed opacity-20" : ""}`}
            onClick={async () => mutate(password)}
            disabled={disabled || isLoading}
          >
            {!isLoading ? "Create" : <LoadingSpinner />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateForm;
