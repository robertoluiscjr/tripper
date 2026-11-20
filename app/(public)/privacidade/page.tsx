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
        <p>
          <strong>Canal de privacidade:</strong> como agente de tratamento de pequeno porte, o Tripper não é obrigado a
          indicar um encarregado (Resolução CD/ANPD nº 2/2022, art. 11). Esse e-mail é o canal oficial para você
          exercer seus direitos, tirar dúvidas e fazer reclamações sobre o uso dos seus dados.
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
          <li>
            <strong>Localização (opcional):</strong> em Buscar, o botão &quot;Destinos próximos&quot; pede a sua
            localização ao navegador, só quando você toca nele. Ela é usada apenas no seu aparelho, para ordenar os
            destinos por distância: não é enviada ao Tripper nem guardada. Você pode negar ou revogar essa permissão
            nas configurações do navegador.
          </li>
        </ul>
        <p>
          Não pedimos acesso aos seus contatos, e-mails, agenda ou arquivos, não guardamos a sua localização e não
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
        <p>As bases legais (art. 7º da LGPD) são:</p>
        <ul>
          <li>
            <strong>Execução do serviço que você contratou</strong> (art. 7º, V): conta, viagens, e-mails do
            serviço e assinatura;
          </li>
          <li>
            <strong>Cumprimento de obrigação legal</strong> (art. 7º, II): registros de pagamento exigidos pela
            legislação fiscal, quando houver assinatura;
          </li>
          <li>
            <strong>Legítimo interesse</strong> (art. 7º, IX): segurança, prevenção de abusos e correção de erros;
          </li>
          <li>
            <strong>Consentimento</strong> (art. 7º, I): localização para &quot;Destinos próximos&quot;, que você
            pode revogar a qualquer momento.
          </li>
        </ul>
        <p>
          <strong>Não vendemos seus dados</strong> e não os usamos para publicidade.
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
          <strong>Transferência internacional:</strong> Google, Vercel, Resend e Stripe processam dados em servidores
          fora do Brasil, principalmente nos Estados Unidos. Essa transferência é necessária para prestar o serviço
          que você pediu (art. 33, IX, da LGPD) e esses fornecedores seguem padrões reconhecidos de segurança. O
          banco de dados com as suas viagens fica no Brasil.
        </p>
        <p>
          <strong>Parceiros de reserva:</strong> os links da aba Buscar (Booking.com, GetYourGuide, Skyscanner e
          Decolar) abrem o site do parceiro. O Tripper não envia os seus dados a eles; no site do parceiro vale a
          política de privacidade dele. Alguns links podem ter um código de afiliado, que só identifica que a visita
          veio do Tripper.
        </p>
        <p>Também poderemos compartilhar dados se houver obrigação legal ou ordem judicial.</p>
      </LegalSection>

      <LegalSection title="5. Cookies e armazenamento no aparelho">
        <p>
          Usamos apenas um cookie essencial, que mantém você conectado. No seu navegador também guardamos, sem
          enviar a ninguém: que você já viu a apresentação inicial do app, a última categoria escolhida em Buscar e,
          por alguns minutos, o rascunho de uma nova viagem começada antes do login. Não usamos cookies de
          publicidade nem de rastreamento, por isso o app não precisa de aviso de cookies.
        </p>
      </LegalSection>

      <LegalSection title="6. Por quanto tempo guardamos">
        <p>
          Guardamos os seus dados enquanto a sua conta existir. Quando você exclui a conta (em Conta → Excluir
          conta), a conta, as viagens e os itens do roteiro são apagados na hora e uma assinatura ativa é
          cancelada. Cópias de segurança automáticas do banco de dados podem manter esses dados por até 30 dias,
          até serem substituídas. Registros de pagamento ficam com o Stripe pelo prazo que a legislação fiscal
          exige.
        </p>
      </LegalSection>

      <LegalSection title="7. Como protegemos">
        <p>
          A conexão com o app é sempre criptografada (HTTPS), não usamos senhas (o acesso é pelo Google ou por
          link de uso único enviado ao seu e-mail) e cada pessoa só consegue ver as próprias viagens.
        </p>
      </LegalSection>

      <LegalSection title="8. Seus direitos">
        <p>Pela LGPD (art. 18), você pode a qualquer momento:</p>
        <ul>
          <li>Confirmar se tratamos seus dados e ter acesso a eles;</li>
          <li>Receber uma cópia dos seus dados em formato aberto (portabilidade);</li>
          <li>Corrigir dados incompletos ou desatualizados;</li>
          <li>Pedir a exclusão da sua conta e dos seus dados;</li>
          <li>Pedir informações sobre com quem compartilhamos seus dados;</li>
          <li>Revogar um consentimento dado (como o da localização) e se opor a um tratamento;</li>
          <li>Revogar o acesso do Tripper à sua Conta Google, nas configurações de segurança do Google.</li>
        </ul>
        <p>
          <strong>Direto no app</strong>, na tela Conta, você pode baixar uma cópia dos seus dados (Baixar meus
          dados), corrigir seu nome (Editar perfil) e excluir sua conta (Excluir conta), sem precisar pedir.
        </p>
        <p>
          Para os demais pedidos, ou para trocar o e-mail, escreva para <SupportEmail />. Respondemos em até 15
          dias. Você também pode procurar a Autoridade Nacional de Proteção de Dados (ANPD).
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
