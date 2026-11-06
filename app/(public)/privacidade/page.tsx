import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, SupportEmail } from "@/components/legal/legal-page";
import { LEGAL_RESPONSIBLE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Tripper coleta, usa e protege os seus dados pessoais.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      intro={
        <p>
          O Tripper é um aplicativo de planejamento de viagens desenvolvido por {LEGAL_RESPONSIBLE} como estudo
          de caso de UX/UI e Product Design. Esta política explica, em linguagem simples, quais dados pessoais
          usamos, para quê e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados
          (LGPD — Lei nº 13.709/2018).
        </p>
      }
    >
      <LegalSection title="1. Quem é o responsável pelos seus dados">
        <p>
          O controlador dos dados é {LEGAL_RESPONSIBLE}, responsável pelo Tripper. Para qualquer assunto sobre
          privacidade, fale com a gente pelo e-mail <SupportEmail />.
        </p>
      </LegalSection>

      <LegalSection title="2. Quais dados coletamos">
        <ul>
          <li>
            <strong>Dados da sua conta:</strong> nome, e-mail e foto de perfil. Eles vêm da sua Conta Google, quando
            você entra com o Google, ou só o e-mail, quando você entra com o link de acesso.
          </li>
          <li>
            <strong>Dados das suas viagens:</strong> destinos, datas, itens do roteiro (transporte, hospedagem,
            passeios, alimentação), valores estimados e anotações que você mesmo cadastra.
          </li>
          <li>
            <strong>Dados técnicos de acesso:</strong> um cookie de sessão para manter você conectado e registros
            técnicos básicos (como data, hora e endereço IP) gerados pela infraestrutura de hospedagem para
            segurança e correção de erros.
          </li>
          <li>
            <strong>Dados de assinatura (quando houver):</strong> se você assinar um plano pago, o pagamento é
            processado pelo Stripe. O Tripper não recebe nem armazena os dados do seu cartão.
          </li>
        </ul>
        <p>
          Não pedimos acesso aos seus contatos, e-mails, agenda, arquivos ou localização em tempo real, e não
          coletamos dados sensíveis.
        </p>
      </LegalSection>

      <LegalSection title="3. Para que usamos os seus dados">
        <ul>
          <li>Criar e manter a sua conta e permitir que você entre no app;</li>
          <li>Salvar e exibir os planejamentos de viagem que você cria;</li>
          <li>Enviar e-mails necessários ao serviço, como o link de acesso e avisos sobre a sua conta;</li>
          <li>Gerenciar o período de teste e a assinatura, quando houver;</li>
          <li>Manter o app seguro, evitar abusos e corrigir problemas.</li>
        </ul>
        <p>
          A base legal é a execução do serviço que você solicitou (art. 7º, V, da LGPD) e o legítimo interesse em
          manter o app seguro e funcionando (art. 7º, IX). <strong>Não vendemos seus dados</strong> e não os usamos
          para publicidade.
        </p>
      </LegalSection>

      <LegalSection title="4. Com quem compartilhamos">
        <p>Usamos serviços de terceiros apenas para fazer o app funcionar:</p>
        <ul>
          <li><strong>Google:</strong> login com a Conta Google;</li>
          <li><strong>Vercel:</strong> hospedagem do app;</li>
          <li><strong>Neon:</strong> banco de dados, hospedado em São Paulo (Brasil);</li>
          <li><strong>Resend:</strong> envio dos e-mails do app;</li>
          <li><strong>Stripe:</strong> processamento de pagamentos, quando houver assinatura;</li>
          <li>
            <strong>Wikipédia e OpenStreetMap:</strong> foto de capa e localização dos destinos. Recebem apenas o
            nome do destino ou o pedido das imagens do mapa, nunca os seus dados de conta.
          </li>
        </ul>
        <p>
          Alguns desses serviços podem processar dados fora do Brasil, sempre com medidas de segurança adequadas,
          como prevê a LGPD. Também poderemos compartilhar dados se houver obrigação legal ou ordem judicial.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies e armazenamento no aparelho">
        <p>
          Usamos apenas um cookie essencial, que mantém você conectado, e um registro no seu navegador para
          lembrar que você já viu a apresentação inicial do app. Não usamos cookies de publicidade nem de
          rastreamento.
        </p>
      </LegalSection>

      <LegalSection title="6. Por quanto tempo guardamos">
        <p>
          Guardamos os seus dados enquanto a sua conta existir. Se você pedir a exclusão da conta, apagamos a
          conta e todas as viagens em até 30 dias, exceto o que a lei nos obrigar a manter por mais tempo.
        </p>
      </LegalSection>

      <LegalSection title="7. Como protegemos">
        <p>
          A conexão com o app é sempre criptografada (HTTPS), não usamos senhas (o acesso é pelo Google ou por
          link de uso único enviado ao seu e-mail) e cada pessoa só consegue ver as próprias viagens.
        </p>
      </LegalSection>

      <LegalSection title="8. Seus direitos">
        <p>Pela LGPD, você pode a qualquer momento:</p>
        <ul>
          <li>Confirmar se tratamos seus dados e pedir uma cópia deles;</li>
          <li>Corrigir dados incompletos ou desatualizados;</li>
          <li>Pedir a exclusão da sua conta e dos seus dados;</li>
          <li>Pedir informações sobre com quem compartilhamos seus dados;</li>
          <li>Revogar o acesso do Tripper à sua Conta Google, nas configurações de segurança do Google.</li>
        </ul>
        <p>
          Para exercer qualquer direito, escreva para <SupportEmail />. Respondemos em até 15 dias. Você também
          pode procurar a Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </LegalSection>

      <LegalSection title="9. Crianças e adolescentes">
        <p>O Tripper é destinado a maiores de 18 anos.</p>
      </LegalSection>

      <LegalSection title="10. Mudanças nesta política">
        <p>
          Se esta política mudar, atualizaremos a data no topo da página e, quando a mudança for importante,
          avisaremos você pelo app ou por e-mail. Veja também os nossos{" "}
          <Link href="/termos" className="font-medium text-primary underline underline-offset-4">Termos de uso</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
