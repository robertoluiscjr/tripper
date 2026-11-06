import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, SupportEmail } from "@/components/legal/legal-page";
import { LEGAL_RESPONSIBLE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "As regras de uso do Tripper, o app de planejamento de viagens.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de uso"
      intro={
        <p>
          Estes termos explicam as regras para usar o Tripper, aplicativo de planejamento de viagens desenvolvido
          por {LEGAL_RESPONSIBLE}. Ao criar uma conta ou usar o app, você concorda com eles.
        </p>
      }
    >
      <LegalSection title="1. O que é o Tripper">
        <p>
          O Tripper ajuda você a organizar viagens: montar o roteiro dia a dia, registrar transportes,
          hospedagens e passeios, estimar gastos e acompanhar o planejamento. O app nasceu como estudo de caso de
          UX/UI e Product Design e está em evolução: funcionalidades podem ser adicionadas, alteradas ou
          removidas.
        </p>
        <p>
          <strong>O Tripper não é uma agência de viagens.</strong> Hoje o app não vende passagens, hospedagens ou
          passeios. Se essa função for lançada, as compras terão condições próprias, informadas antes do
          pagamento.
        </p>
      </LegalSection>

      <LegalSection title="2. Sua conta">
        <ul>
          <li>Você precisa ter pelo menos 18 anos para usar o Tripper;</li>
          <li>O acesso é feito pela sua Conta Google ou por um link enviado ao seu e-mail;</li>
          <li>
            Você é responsável por manter o seu e-mail e a sua Conta Google seguros, já que eles dão acesso à sua
            conta no Tripper;
          </li>
          <li>Você pode pedir a exclusão da sua conta a qualquer momento pelo e-mail de suporte.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Uso adequado">
        <p>Ao usar o Tripper, você concorda em não:</p>
        <ul>
          <li>Usar o app para atividades ilegais ou para prejudicar outras pessoas;</li>
          <li>Tentar acessar contas ou dados de outras pessoas;</li>
          <li>Tentar sobrecarregar, invadir ou interferir no funcionamento do app;</li>
          <li>Copiar ou revender o app ou partes dele sem autorização.</li>
        </ul>
        <p>Contas que descumprirem estas regras podem ser suspensas.</p>
      </LegalSection>

      <LegalSection title="4. Seu conteúdo">
        <p>
          Os planejamentos e anotações que você cria são seus. Nós apenas os armazenamos e exibimos para que o app
          funcione, como explicado na{" "}
          <Link href="/privacidade" className="font-medium text-primary underline underline-offset-4">
            Política de Privacidade
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Planos e pagamentos">
        <p>
          O Tripper pode oferecer um plano gratuito, um período de teste e um plano pago (Tripper PRO). Os valores,
          limites e condições ficam na página de{" "}
          <Link href="/pricing" className="font-medium text-primary underline underline-offset-4">planos</Link>{" "}
          e serão sempre mostrados antes de qualquer cobrança. Os pagamentos são processados pelo Stripe, e a
          assinatura pode ser cancelada a qualquer momento, valendo até o fim do período já pago.
        </p>
      </LegalSection>

      <LegalSection title="6. Informações de terceiros">
        <p>
          Fotos, mapas e descrições de destinos vêm de fontes públicas, como Wikipédia e OpenStreetMap, e podem
          conter imprecisões. Valores de gastos são estimativas feitas por você. Antes de viajar, confirme
          horários, preços, documentos e exigências diretamente com as empresas e órgãos responsáveis.
        </p>
      </LegalSection>

      <LegalSection title="7. Disponibilidade e responsabilidade">
        <p>
          Fazemos o possível para manter o Tripper funcionando e seus dados seguros, mas o app é oferecido “como
          está” e pode ter interrupções ou erros. Não nos responsabilizamos por prejuízos decorrentes de decisões
          de viagem tomadas com base nas informações do app, nos limites permitidos pela lei, incluindo o Código
          de Defesa do Consumidor.
        </p>
      </LegalSection>

      <LegalSection title="8. Mudanças nestes termos">
        <p>
          Podemos atualizar estes termos. A data no topo da página mostra a versão atual e, quando a mudança for
          importante, avisaremos você pelo app ou por e-mail.
        </p>
      </LegalSection>

      <LegalSection title="9. Contato e lei aplicável">
        <p>
          Estes termos seguem as leis do Brasil. Dúvidas, sugestões ou pedidos: <SupportEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
