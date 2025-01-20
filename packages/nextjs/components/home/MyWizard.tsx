import Image from "next/image";
import { WizardCard } from "~~/components/wizard/WizardCard";
import { useClient } from "~~/hooks/scaffold-eth/useClient";
import { WizardInfo } from "~~/types/hogwarts/hogwartsTypes";
import { wizardValues } from "~~/types/hogwarts/hogwartsTypes";

const MyWizard = ({
  myWizard,
  updateHouses,
}: {
  myWizard: WizardInfo | null | undefined; // Accept both null and undefined
  updateHouses: () => void;
}) => {
  const { client } = useClient();
  return myWizard ? (
    <div className="mt-16 mb-20">
      {/* Decorative elements */}
      <div className="flex items-center justify-center mb-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <Image src="/magicWand.jpg" alt="Wand" width={32} height={32} className="mx-4 opacity-70" />
        <h2 className="text-4xl font-bold text-center px-4 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          My Wizard
        </h2>
        <Image
          src="/magicWand.jpg"
          alt="Wand"
          width={32}
          height={32}
          className="mx-4 opacity-70 transform scale-x-[-1]"
        />
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      </div>

      {/* Card container with magical effects */}
      <div className="relative max-w-md mx-auto">
        {/* Animated glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl opacity-20 blur-xl animate-pulse"></div>
        {/* Star sparkles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="star-sparkle absolute w-1 h-1"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          >
            <svg
              className="w-full h-full animate-twinkle"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: "#ffd700" }}
            >
              <path d="M12 2L9.1 9.1H2L7.5 13.9L5.7 21L12 16.9L18.3 21L16.5 13.9L22 9.1H14.9L12 2Z" />
            </svg>
          </div>
        ))}
        {/* Magical floating particles */}
        <div className="absolute -inset-2 flex justify-around">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`
                w-1.5 h-1.5 rounded-full
                bg-gradient-to-br from-amber-300 to-yellow-500
                animate-float opacity-70
              `}
              style={{
                animationDelay: `${i * 0.3}s`,
                left: `${i * 15}%`,
                top: `${Math.sin(i) * 20}%`,
              }}
            ></div>
          ))}
        </div>
        {/* Wizard Card */}
        <div className="relative backdrop-blur-sm">
          <WizardCard
            wizard={myWizard}
            houseData={wizardValues.find(w => w.houseName === myWizard.house)!}
            client={client}
            myWizard={myWizard}
            onChange={updateHouses}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-16 mb-20 text-center">
      <div className="flex items-center justify-center mb-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
        <Image src="/sorting-hat.png" alt="Sorting Hat" width={40} height={40} className="mx-4 opacity-70" />
        <h2 className="text-4xl font-bold text-center px-4 bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent">
          No Wizard Yet
        </h2>
        <Image
          src="/sorting-hat.png"
          alt="Sorting Hat"
          width={40}
          height={40}
          className="mx-4 opacity-70 transform scale-x-[-1]"
        />
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
      </div>
      <p className="text-gray-500 text-lg">The Sorting Hat awaits! Mint a wizard to join the Hogwarts Tournament.</p>
    </div>
  );
};

export default MyWizard;
