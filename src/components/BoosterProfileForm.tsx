"use client";

import { useActionState, useState } from "react";
import { saveBoosterProfile } from "@/app/actions/booster";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/form";
import { ErrorText, FormCard, Grid, H2, Hint, Input, Label, Muted, Notice, Textarea } from "@/ui/primitives";

type Initial = {
  country: string;
  profileUrl: string;
  paypalEmail: string;
  languages: string;
  regions: string;
  bio: string;
};

export function BoosterProfileForm({ initial }: { initial: Initial }) {
  const [state, action] = useActionState<FormState, FormData>(saveBoosterProfile, {});
  const [v, setV] = useState(initial);
  const set = (key: keyof Initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [key]: e.target.value }));
  const err = (name: string) => state.fieldErrors?.[name]?.map((m) => <ErrorText key={m}>{m}</ErrorText>);

  return (
    <FormCard action={action} $max={680}>
      <div>
        <H2>Perfil de booster</H2>
        <Muted>A equipe confere seus dados e define o seu nível (Standard, Multi-Glad, R1 ou AWC) antes de aprovar.</Muted>
      </div>

      <Grid $cols="8rem 1fr" $gap={16}>
        <div>
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" maxLength={2} placeholder="BR" style={{ textTransform: "uppercase" }} value={v.country} onChange={set("country")} required />
          {err("country")}
        </div>
        <div>
          <Label htmlFor="paypalEmail">E-mail do PayPal (onde você recebe)</Label>
          <Input id="paypalEmail" name="paypalEmail" type="email" value={v.paypalEmail} onChange={set("paypalEmail")} required />
          {err("paypalEmail")}
        </div>
      </Grid>

      <div>
        <Label htmlFor="profileUrl">Link do seu personagem (Armory ou Check-PvP)</Label>
        <Input id="profileUrl" name="profileUrl" type="url" value={v.profileUrl} onChange={set("profileUrl")} required />
        <Hint>É por aqui que a equipe confere o seu histórico.</Hint>
        {err("profileUrl")}
      </div>

      <Grid $cols="1fr 1fr" $gap={16}>
        <div>
          <Label htmlFor="languages">Idiomas</Label>
          <Input id="languages" name="languages" placeholder="pt, en" value={v.languages} onChange={set("languages")} required />
          <Hint>Separe por vírgula.</Hint>
          {err("languages")}
        </div>
        <div>
          <Label htmlFor="regions">Regiões em que joga</Label>
          <Input id="regions" name="regions" placeholder="US, EU, BR" value={v.regions} onChange={set("regions")} required />
          <Hint>Separe por vírgula.</Hint>
          {err("regions")}
        </div>
      </Grid>

      <div>
        <Label htmlFor="bio">Sobre você (opcional)</Label>
        <Textarea id="bio" name="bio" rows={3} maxLength={500} value={v.bio} onChange={set("bio")} />
        {err("bio")}
      </div>

      {state.error ? <Notice>{state.error}</Notice> : null}
      <SubmitButton>Salvar perfil</SubmitButton>
    </FormCard>
  );
}
