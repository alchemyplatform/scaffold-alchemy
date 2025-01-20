import { wizardData } from "~~/components/wizard/wizardData";
import { House } from "~~/types/hogwarts/hogwartsTypes";

export const fromHouseNumber = (house: number): House => {
  switch (house) {
    case wizardData.Gryffindor.houseNumber:
      return "Gryffindor";
    case wizardData.Hufflepuff.houseNumber:
      return "Hufflepuff";
    case wizardData.Ravenclaw.houseNumber:
      return "Ravenclaw";
    case wizardData.Slytherin.houseNumber:
      return "Slytherin";
  }
  throw new Error(`Invalid house number: ${house}`);
};

export const urlFromHouseNumber = (house: number): string => {
  switch (house) {
    case wizardData.Gryffindor.houseNumber:
      return "/gryffindor.jpg";
    case wizardData.Hufflepuff.houseNumber:
      return "/hufflepuff.jpg";
    case wizardData.Ravenclaw.houseNumber:
      return "/ravenclaw.jpg";
    case wizardData.Slytherin.houseNumber:
      return "/slytherin.jpg";
  }
  throw new Error(`Invalid house number: ${house}`);
};
