export default function Home() {
  return (
    <div className="min-h-screen px-6 py-16 sm:px-10 bg-gray-950 text-gray-200 font-sans">
      <main className="max-w-5xl mx-auto space-y-14">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bem-vindo ao Painel de Automação 🎯
          </h1>
          <p className="text-lg text-gray-400">
            Este painel controla todo o fluxo de postagens automatizadas nas
            redes sociais com controle de perfis, vídeos e logs detalhados.
          </p>
        </section>

        <section className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Postagem de Vídeos
            </h2>
            <p className="text-sm text-gray-400">
              Faça o envio de vídeos com descrições, selecione os grupos de
              perfis desejados, e o sistema cuida da publicação automática.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-white mb-2">
              2. Gerenciamento de Perfis
            </h2>
            <p className="text-sm text-gray-400">
              Crie, edite ou exclua perfis conectados ao AdsPower. Cada perfil
              representa uma conta social automatizada no processo.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-white mb-2">
              3. Logs e Execuções
            </h2>
            <p className="text-sm text-gray-400">
              Visualize logs completos das execuções, com filtros por status,
              data e perfil. Ideal para auditoria e debugging.
            </p>
          </div>
        </section>

        <section className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Desenvolvido por Davi Quaresma
          </p>
        </section>
      </main>
    </div>
  );
}
