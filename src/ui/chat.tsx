"use client";

import styled from "styled-components";
import { color, radius } from "./theme";

export const ChatPanel = styled.section`
  display: flex;
  flex-direction: column;
  height: 28rem;
  background: ${color.surface};
  border-radius: ${radius};
  overflow: hidden;
`;

export const Messages = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
`;

export const EventLine = styled.p`
  text-align: center;
  font-size: 0.78rem;
  color: ${color.muted};
`;

export const Bubble = styled.div<{ $mine?: boolean }>`
  align-self: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  max-width: 85%;
  & > small { display: block; margin-bottom: 2px; font-size: 0.75rem; color: ${color.muted}; text-align: ${({ $mine }) => ($mine ? "right" : "left")}; }
  & > p {
    white-space: pre-wrap;
    word-break: break-word;
    padding: 10px 14px;
    border-radius: 12px;
    background: ${({ $mine }) => ($mine ? color.gold : color.raised)};
    color: ${({ $mine }) => ($mine ? color.onGold : color.text)};
  }
`;

export const ChatForm = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid ${color.line};
`;

export const ChatClosed = styled.p`
  padding: 14px 16px;
  border-top: 1px solid ${color.line};
  font-size: 0.9rem;
  color: ${color.muted};
`;
