import { TabButton } from "./nft-page-parts";

import type { NftPageModel } from "../types/nft-page-model";

export function NftDetailsTabs({
  tab,
  setTab,
  nft,
}: Pick<NftPageModel, "tab" | "setTab" | "nft">) {
  return (
    <section className="mt-16 hidden lg:block">
      <div
        role="tablist"
        aria-label="Informações do NFT"
        className="flex gap-8 border-b border-border"
      >
        <TabButton
          id="nft-tab-details"
          active={tab === "details"}
          onClick={() => setTab("details")}
        >
          Detalhes do NFT
        </TabButton>
        <TabButton
          id="nft-tab-reviews"
          active={tab === "reviews"}
          onClick={() => setTab("reviews")}
        >
          Avaliações de colecionadores ({nft.reviews})
        </TabButton>
      </div>

      <div
        id="nft-tabpanel"
        aria-labelledby={`nft-tab-${tab}`}
        role="tabpanel"
        className="space-y-5 pt-5 text-sm text-secondary"
      >
        {tab === "details" ? (
          <>
            <p>
              {nft.name} é uma obra digital 1/50 finalizada à mão da coleção
              Kurio Editions. Cada atributo fica armazenado nos metadados do
              token e verificado na Ethereum.
            </p>
            <p>
              A propriedade inclui a arte em alta resolução, lançamentos
              exclusivos para colecionadores e um registro permanente de
              procedência registrada na rede.
            </p>

            <div>
              <h3 className="font-bold text-foreground">Rede:</h3>
              <p>
                Cunhado na Ethereum com procedência imutável e metadados
                armazenados no IPFS.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground">Contrato:</h3>
              <p>
                Direitos autorais do criador: 5% nas vendas secundárias, pagos
                automaticamente pelos mercados compatíveis.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground">Direitos autorais:</h3>
              <p>0x7A42...19E8 · Contrato inteligente ERC-721 verificado.</p>
            </div>
          </>
        ) : (
          <p>Nenhuma avaliação para exibir ainda.</p>
        )}
      </div>
    </section>
  );
}
