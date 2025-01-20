import { wizardData } from "~~/components/wizard/wizardData";
import { Client } from "~~/hooks/scaffold-eth/useClient";
import { keys } from "~~/utils/keys";
import { values } from "~~/utils/values";

export const wizardValues = values(wizardData);
export const wizardKeys = keys(wizardData);
export type WizardHouse = (typeof wizardKeys)[number];

export type WizardData = (typeof wizardData)[keyof typeof wizardData];

export type House = WizardData["houseName"];

export type WizardInfo = {
  imageUrl: string;
  name: string;
  stunned: boolean;
  house: House;
  tokenId: string;
};

export type CurrentWizardProps = {
  onChange: () => void;
  client: Client | undefined;
  myWizard: WizardInfo | null;
  otherWizard: WizardInfo;
};

export type WizardsInHouses = Record<House, WizardInfo[]>;
