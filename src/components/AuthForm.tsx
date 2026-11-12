"use client";

import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/form";
import type { pt } from "@/messages/pt";
import {
  ErrorText, Fieldset, FormCard, H2, Hint, Input, Label, Legend, Notice, RadioLabel, Small, TextLink,
} from "@/ui/primitives";

type Dict = typeof pt.auth;

export function AuthForm({ mode, next, t }: { mode: "login" | "signup"; next?: string; t: Dict }) {
  const [state, action] = useActionState<FormState, FormData>(mode === "login" ? login : signup, {});
  const isSignup = mode === "signup";
  const errors = (name: string) => state.fieldErrors?.[name]?.map((m) => <ErrorText key={m}>{m}</ErrorText>);

  return (
    <FormCard action={action} $max={440}>
      <H2>{isSignup ? t.signupTitle : t.loginTitle}</H2>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {isSignup ? (
        <div>
          <Label htmlFor="name">{t.name}</Label>
          <Input id="name" name="name" autoComplete="name" required />
          {errors("name")}
        </div>
      ) : null}

      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {errors("email")}
      </div>

      <div>
        <Label htmlFor="password">{t.password}</Label>
        <Input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required />
        {isSignup ? <Hint>{t.passwordHint}</Hint> : null}
        {errors("password")}
      </div>

      {isSignup ? (
        <Fieldset>
          <Legend>{t.accountType}</Legend>
          <RadioLabel><input type="radio" name="accountType" value="CLIENT" defaultChecked /> {t.client}</RadioLabel>
          <br />
          <RadioLabel><input type="radio" name="accountType" value="BOOSTER" /> {t.booster}</RadioLabel>
        </Fieldset>
      ) : null}

      {state.error ? <Notice $tone={state.ok ? "ok" : "error"} role="status">{state.error}</Notice> : null}

      <SubmitButton>{isSignup ? t.signupButton : t.loginButton}</SubmitButton>

      <Small>
        {isSignup ? t.hasAccount : t.noAccount}{" "}
        <TextLink href={isSignup ? "/login" : "/signup"}>{isSignup ? t.loginButton : t.signupButton}</TextLink>
      </Small>
    </FormCard>
  );
}
