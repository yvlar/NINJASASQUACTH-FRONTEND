import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";

type LoginStatus = "idle" | "loading" | "error";

// Champ de saisie partagé (courriel, mot de passe).
const inputBase =
  "rounded-lg border border-charcoal bg-white px-3 py-2.5 text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export default function LoginForm() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<LoginStatus>("idle");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    const { error } = await signIn(values.email.trim(), values.password);
    setStatus(error ? "error" : "idle");
  };

  return (
    <form
      className="mx-auto flex max-w-[22rem] flex-col gap-4"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold" htmlFor="admin-login-email">
          {t("admin.login.email")}
        </label>
        <input
          className={inputBase}
          id="admin-login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={values.email}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold" htmlFor="admin-login-password">
          {t("admin.login.password")}
        </label>
        <input
          className={inputBase}
          id="admin-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={values.password}
          onChange={handleChange}
        />
      </div>
      {status === "error" && (
        <p className="font-semibold text-error" role="alert">
          {t("admin.login.error")}
        </p>
      )}
      <button
        className="cursor-pointer rounded-lg bg-forest px-4 py-2.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:cursor-wait disabled:opacity-70"
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? t("admin.login.loading") : t("admin.login.submit")}
      </button>
    </form>
  );
}
