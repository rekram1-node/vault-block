import { useState } from "react";
import { debounce } from "lodash";
import { LoadingSpinner } from "~/components/Loading";
import { useCreateEncryptedDocument } from "./useCreateEncryptedDocument";

const CreateForm = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const { mutate, isLoading } = useCreateEncryptedDocument(() => closeModal());

  const validPassword =
    password !== "" && password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;
  const isError = !validPassword || !passwordsMatch;

  const disabled =
    isError ||
    !name ||
    !password ||
    !confirmPassword ||
    confirmPassword !== password;

  const closeModal = () => {
    setPassword("");
    setConfirmPassword("");
    setName("");
    onClose();
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
  };

  const onConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setConfirmPassword(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeModal}
    >
      <div
        className="rounded-lg border bg-card p-4 shadow-lg"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
        }}
      >
        <h2 className="text-lg font-bold">Create New Protected Page</h2>
        <form className="mt-2 h-auto w-full" style={{ minWidth: "600px" }}>
          <div className="-mx-3 mb-6 flex-wrap">
            <div className="px-3 pt-2">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold">
                  Page Name
                </label>
                <input
                  name="name"
                  id="name"
                  required
                  placeholder="Name of the page"
                  className="block w-full rounded-lg border px-4 py-3 leading-tight"
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setName(value);
                  }}
                />
              </div>
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
              <div className="mb-4">
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
                      void mutate(name, password);
                    }
                  }}
                />
              </div>
              <div className="mt-1 h-5 w-full max-w-md">
                {confirmPassword !== "" && !passwordsMatch && (
                  <p className="text-xs italic text-error-light">
                    Passwords do not match.
                  </p>
                )}
              </div>
              <p className="text-s mt-4 italic text-secondary">
                This password will be used to decrypt your page, remember it
              </p>
            </div>
          </div>
        </form>
        <div className="mt-4 flex justify-end space-x-2 font-semibold">
          <button
            className={"rounded bg-error-light px-4 py-2 hover:brightness-75"}
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className={`rounded bg-primary px-4 py-2 hover:brightness-75 ${disabled || isLoading ? "cursor-not-allowed opacity-20" : ""}`}
            onClick={async () => mutate(name, password)}
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
