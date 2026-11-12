"use client";

import { useActionState, useMemo, useState } from "react";
import { createOrder } from "@/app/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import { calcOrderPrice, type PricingModelName } from "@/lib/pricing";
import { TIER_LABEL, TIER_ORDER, type BoosterTierName } from "@/lib/tiers";
import { SPECS_BY_CLASS, WOW_CLASSES, type WowClass } from "@/lib/wow";
import { formatMoney } from "@/lib/format";
import type { FormState } from "@/lib/form";
import {
  ErrorText, Fieldset, FormCard, Grid, H2, Hint, Input, Label, Legend, Money, Muted, Notice,
  RadioLabel, Row, Select, Small, Textarea,
} from "@/ui/primitives";

type ServiceProp = {
  id: string;
  name: string;
  pricingModel: PricingModelName;
  priceCents: number;
  currency: string;
  noGearSurchargeBps: number;
};

export function OrderForm({ service }: { service: ServiceProp }) {
  const [state, action] = useActionState<FormState, FormData>(createOrder, {});

  // Tudo controlado: o React 19 limpa campos não controlados depois de cada envio.
  const [tier, setTier] = useState<BoosterTierName>("STANDARD");
  const [profileUrl, setProfileUrl] = useState("");
  const [wowClass, setWowClass] = useState<WowClass | "">("");
  const [spec, setSpec] = useState("");
  const [currentRating, setCurrentRating] = useState("");
  const [targetRating, setTargetRating] = useState("");
  const [hours, setHours] = useState("1");
  const [gear, setGear] = useState<"" | "yes" | "no">("");
  const [notes, setNotes] = useState("");

  const isRating = service.pricingModel === "PER_RATING";
  const isHour = service.pricingModel === "PER_HOUR";
  const errors = (name: string) => state.fieldErrors?.[name]?.map((m) => <ErrorText key={m}>{m}</ErrorText>);

  // Estimativa só para mostrar na tela. O preço de verdade é calculado no servidor.
  const estimate = useMemo(() => {
    if (gear === "") return null;
    try {
      return calcOrderPrice({
        pricingModel: service.pricingModel,
        basePriceCents: service.priceCents,
        currentRating: currentRating === "" ? null : Number(currentRating),
        targetRating: targetRating === "" ? null : Number(targetRating),
        hours: Number(hours),
        tier,
        hasSeasonGear: gear === "yes",
        noGearSurchargeBps: service.noGearSurchargeBps,
      });
    } catch {
      return null;
    }
  }, [service, currentRating, targetRating, hours, tier, gear]);

  return (
    <FormCard action={action} $max={680}>
      <div>
        <H2>{service.name}</H2>
        <Muted>Preencha os dados do personagem. O pagamento vem depois, na tela do pedido.</Muted>
      </div>

      <input type="hidden" name="serviceId" value={service.id} />

      <div>
        <Label htmlFor="requestedTier">Nível do booster</Label>
        <Select id="requestedTier" name="requestedTier" value={tier} onChange={(e) => setTier(e.target.value as BoosterTierName)}>
          {TIER_ORDER.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
        </Select>
        <Hint>Níveis maiores têm preço maior.</Hint>
      </div>

      <div>
        <Label htmlFor="profileUrl">Link do Armory ou do Check-PvP</Label>
        <Input id="profileUrl" name="profileUrl" type="url" placeholder="https://check-pvp.fr/..." value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} required />
        {errors("profileUrl")}
      </div>

      <Grid $cols="1fr 1fr" $gap={16}>
        <div>
          <Label htmlFor="wowClass">Classe</Label>
          <Select id="wowClass" name="wowClass" value={wowClass} onChange={(e) => { setWowClass(e.target.value as WowClass | ""); setSpec(""); }} required>
            <option value="">Escolha...</option>
            {WOW_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          {errors("wowClass")}
        </div>
        <div>
          <Label htmlFor="spec">Spec</Label>
          <Select id="spec" name="spec" value={spec} onChange={(e) => setSpec(e.target.value)} disabled={!wowClass} required>
            <option value="">{wowClass ? "Escolha..." : "Escolha a classe primeiro"}</option>
            {wowClass ? SPECS_BY_CLASS[wowClass].map((s) => <option key={s} value={s}>{s}</option>) : null}
          </Select>
          {errors("spec")}
        </div>
      </Grid>

      {isRating ? (
        <Grid $cols="1fr 1fr" $gap={16}>
          <div>
            <Label htmlFor="currentRating">Rating atual</Label>
            <Input id="currentRating" name="currentRating" type="number" min={0} max={4000} value={currentRating} onChange={(e) => setCurrentRating(e.target.value)} required />
            {errors("currentRating")}
          </div>
          <div>
            <Label htmlFor="targetRating">Rating desejado</Label>
            <Input id="targetRating" name="targetRating" type="number" min={0} max={4000} value={targetRating} onChange={(e) => setTargetRating(e.target.value)} required />
            {errors("targetRating")}
          </div>
        </Grid>
      ) : null}

      {isHour ? (
        <div>
          <Label htmlFor="hours">Quantas horas?</Label>
          <Input id="hours" name="hours" type="number" min={1} max={40} value={hours} onChange={(e) => setHours(e.target.value)} required />
          <Hint>Você compra um bloco de horas adiantado. Se passar do tempo, é só fazer um novo pedido.</Hint>
          {errors("hours")}
        </div>
      ) : null}

      <Fieldset>
        <Legend>Você tem o gear PvP da season?</Legend>
        <Row $gap={28}>
          <RadioLabel><input type="radio" name="hasSeasonGear" value="yes" checked={gear === "yes"} onChange={() => setGear("yes")} required /> Sim</RadioLabel>
          <RadioLabel><input type="radio" name="hasSeasonGear" value="no" checked={gear === "no"} onChange={() => setGear("no")} /> Não</RadioLabel>
        </Row>
        {service.noGearSurchargeBps > 0 ? <Hint>Sem o gear, o serviço tem um acréscimo de {service.noGearSurchargeBps / 100}%.</Hint> : null}
        {errors("hasSeasonGear")}
      </Fieldset>

      <div>
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" name="notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
        {errors("notes")}
      </div>

      {state.error ? <Notice role="alert">{state.error}</Notice> : null}

      <Row $justify="space-between" $gap={16}>
        <div>
          <Small>Preço estimado</Small>
          <br />
          <Money $size="2rem">{estimate == null ? "—" : formatMoney(estimate, service.currency)}</Money>
        </div>
        <SubmitButton>Criar pedido</SubmitButton>
      </Row>
    </FormCard>
  );
}
