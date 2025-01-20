import { graphQlClient } from "./graphQlClient";
import { wizardQuery } from "./graphQlQueries";
import { WizardsInHouses } from "~~/types/hogwarts/hogwartsTypes";
import { fromHouseNumber, urlFromHouseNumber } from "~~/utils/hogwarts/hogwartUtils";

export function nftWizardsByHouse(): Promise<WizardsInHouses> {
  return graphQlClient.request(wizardQuery).then(({ wizards }: any) => {
    return wizards.reduce(
      (acc: WizardsInHouses, wizard: any) => {
        const house = fromHouseNumber(Number(wizard.house));
        acc[house].push({
          imageUrl: urlFromHouseNumber(Number(wizard.house)),
          name: String(wizard.name),
          stunned: !!wizard.stunnedStatus,
          tokenId: String(wizard.id),
          house,
        });
        return acc;
      },
      {
        Hufflepuff: [],
        Ravenclaw: [],
        Gryffindor: [],
        Slytherin: [],
      },
    );
  });
}
