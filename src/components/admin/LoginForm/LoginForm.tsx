import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "../../../auth/useAuth";
import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./LoginForm.module.css";

type LoginStatus = "idle" | "loading" | "error";

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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-login-email">
          {t("admin.login.email")}
        </label>
        <input
          className={styles.input}
          id="admin-login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={values.email}
          onChange={handleChange}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-login-password">
          {t("admin.login.password")}
        </label>
        <input
          className={styles.input}
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
        <p className={styles.error} role="alert">
          {t("admin.login.error")}
        </p>
      )}
      <button
        className={styles.submit}
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? t("admin.login.loading") : t("admin.login.submit")}
      </button>
    </form>
  );
}
