import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Textura de "papel de engenharia": uma grade fina atrás do conteúdo, calibrada
 * para light e dark. Renderiza num ::before com z-index 0 — o conteúdo precisa
 * ficar acima (position relative + zIndex >= 1).
 *
 * Pensada como plano de trabalho discreto (não ornamento sobreposto): linhas a
 * baixa opacidade, com fade vertical para não competir com cards e tabelas.
 */
export function gridBackdrop(mode: "light" | "dark"): SxProps<Theme> {
  // Tom da linha: ink esverdeado da marca no light; quase-branco no dark.
  const line =
    mode === "light" ? "rgba(32, 42, 38, 0.09)" : "rgba(244, 242, 238, 0.08)";

  return {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      backgroundImage: `
        linear-gradient(to right, ${line} 1px, transparent 1px),
        linear-gradient(to bottom, ${line} 1px, transparent 1px)
      `,
      backgroundSize: "32px 32px",
      // Desvanece de cima (mais visível) para baixo, mantendo a grade discreta.
      maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.5))",
      WebkitMaskImage:
        "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.5))",
    },
  };
}
