"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

// Coleta o CSS gerado no servidor e injeta no <head>, para a página já chegar estilizada.
export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styleSheet.getStyleElement();
    styleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return <StyleSheetManager sheet={styleSheet.instance}>{children}</StyleSheetManager>;
}
