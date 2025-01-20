"use client";

import { keys } from "~~/utils/keys";
import { values } from "~~/utils/values";

// Wizard data (name, description, image)

export const wizardData = {
  Hufflepuff: {
    houseName: "Hufflepuff",
    description: "Not a main character",
    image: "/hufflepuff.jpg",
    color: "bg-hufflepuff-yellow",
    secondaryColor: "bg-hufflepuff-black",
    symbol: "🦡",
    houseNumber: 1,
  },
  Ravenclaw: {
    houseName: "Ravenclaw",
    description: "Pretentious",
    image: "/ravenclaw.jpg",
    color: "bg-ravenclaw-blue",
    secondaryColor: "bg-ravenclaw-bronze",
    symbol: "🦅",
    houseNumber: 2,
  },
  Gryffindor: {
    houseName: "Gryffindor",
    description: "Not Slytherin",
    image: "/gryffindor.jpg",
    color: "bg-gryffindor-red",
    secondaryColor: "bg-gryffindor-gold",
    symbol: "🦁",
    houseNumber: 0,
  },
  Slytherin: {
    houseName: "Slytherin",
    description: "Goth",
    image: "/slytherin.jpg",
    color: "bg-slytherin-green",
    secondaryColor: "bg-slytherin-silver",
    symbol: "🐍",
    houseNumber: 3,
  },
} as const;

export const wizardValues = values(wizardData);
export const wizardKeys = keys(wizardData);
export type WizardHouse = (typeof wizardKeys)[number];

export type WizardData = (typeof wizardData)[keyof typeof wizardData];
