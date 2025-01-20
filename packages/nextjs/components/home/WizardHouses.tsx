import { useEffect, useState } from "react";
import Image from "next/image";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { wizardValues } from "~~/types/hogwarts/hogwartsTypes";
import { WizardsInHouses } from "~~/types/hogwarts/hogwartsTypes";
import { sum } from "~~/utils/sum";

const WizardHouses = ({ wizards }: { wizards: WizardsInHouses }) => {
  const [points, setPoints] = useState({
    Hufflepuff: { frozen: 0, points: 0 },
    Ravenclaw: { frozen: 0, points: 0 },
    Gryffindor: { frozen: 0, points: 0 },
    Slytherin: { frozen: 0, points: 0 },
  });

  const gryffindorPoints = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    args: [0],
  });

  const hufflepuffPoints = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    args: [1],
  });

  const ravenclawPoints = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    args: [2],
  });

  const slytherinPoints = useScaffoldReadContract({
    contractName: "HogwartsTournament",
    functionName: "getHousePoints",
    args: [3],
  });

  useEffect(() => {
    setPoints({
      Hufflepuff: {
        frozen: wizards.Hufflepuff.map(x => +x.stunned).reduce(sum, 0),
        points: Number(hufflepuffPoints.data || 0),
      },
      Ravenclaw: {
        frozen: wizards.Ravenclaw.map(x => +x.stunned).reduce(sum, 0),
        points: Number(ravenclawPoints.data || 0),
      },
      Gryffindor: {
        frozen: wizards.Gryffindor.map(x => +x.stunned).reduce(sum, 0),
        points: Number(gryffindorPoints.data || 0),
      },
      Slytherin: {
        frozen: wizards.Slytherin.map(x => +x.stunned).reduce(sum, 0),
        points: Number(slytherinPoints.data || 0),
      },
    });
  }, [gryffindorPoints.data, hufflepuffPoints.data, ravenclawPoints.data, slytherinPoints.data, wizards]);
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-6 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        House Points
      </h1>
      <div className="flex space-x-8 p-8">
        {wizardValues.map(wizard => (
          <div key={wizard.houseNumber} className="flex flex-col items-center">
            <div
              className={`
                  p-6 text-white rounded-xl 
                  hover:scale-105 transition-all duration-300 ease-in-out
                  shadow-xl hover:shadow-2xl
                  bg-gradient-to-br from-${wizard.color.replace("bg-", "")} to-${wizard.secondaryColor.replace("bg-", "")}
                `}
            >
              <Image
                src={wizard.image}
                alt={wizard.houseName}
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded-full mb-4 border-4 border-white/20 shadow-lg"
              />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold mb-3">{wizard.houseName}</h2>
                <div className="space-y-1">
                  <p className="text-white/90">
                    Points: <span className="font-semibold">{points[wizard.houseName].points}</span>
                  </p>
                  <p className="text-white/90">
                    Frozen: <span className="font-semibold">{points[wizard.houseName].frozen}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WizardHouses;
