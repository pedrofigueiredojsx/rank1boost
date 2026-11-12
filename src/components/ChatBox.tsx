"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ErrorText, Input, Muted } from "@/ui/primitives";
import { Bubble, ChatClosed, ChatForm, ChatPanel, EventLine, Messages } from "@/ui/chat";

type Item = {
  kind: "message" | "event";
  id: string;
  text: string;
  createdAt: string;
  mine?: boolean;
  author?: string;
};

// Chat do pedido: consulta a rota a cada 4 segundos (polling).
export function ChatBox({ orderId, enabled }: { orderId: string; enabled: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [canWrite, setCanWrite] = useState(enabled);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Mudar este número força uma nova consulta imediata (usado depois de enviar).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      const res = await fetch(`/api/orders/${orderId}/messages`, { cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { items: Item[]; canWrite: boolean };
      if (cancelled) return;
      setItems(data.items);
      setCanWrite(data.canWrite);
    }

    void tick();
    const timer = setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderId, reloadKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [items.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setError("");
    const res = await fetch(`/api/orders/${orderId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Não foi possível enviar.");
      return;
    }
    setText("");
    setReloadKey((k) => k + 1);
  }

  return (
    <ChatPanel aria-label="Chat do pedido">
      <Messages>
        {items.length === 0 ? <Muted>Nenhuma mensagem ainda.</Muted> : null}
        {items.map((item) =>
          item.kind === "event" ? (
            <EventLine key={item.id}>
              {new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} · {item.text}
            </EventLine>
          ) : (
            <Bubble key={item.id} $mine={item.mine}>
              <small>{item.author}</small>
              <p>{item.text}</p>
            </Bubble>
          ),
        )}
        <div ref={endRef} />
      </Messages>

      {canWrite ? (
        <ChatForm onSubmit={send}>
          <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Escreva uma mensagem" aria-label="Mensagem" />
          <Button type="submit">Enviar</Button>
        </ChatForm>
      ) : (
        <ChatClosed>O chat abre quando houver um booster atribuído.</ChatClosed>
      )}
      {error ? <ErrorText style={{ padding: "0 16px 12px" }}>{error}</ErrorText> : null}
    </ChatPanel>
  );
}
