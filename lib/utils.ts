import { createCn } from "cn/config";

/**
 * `cn` com os tamanhos de fonte do styleguide registrados (text-h1…h6, p16, p15,
 * p14, small). Sem isso o merge confunde `text-h5` com uma COR e descarta
 * classes como `text-primary-foreground` (ex.: texto escuro no botão azul).
 * Sempre importe `cn` daqui, e não direto do pacote "cn".
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "h4", "h5", "h6", "p16", "p15", "p14", "small"] }],
    },
  },
});
