import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-alchemy";

export const CounterUI = () => {
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({ contractName: "Counter" });
  const { data: count, refetch: refetchCount } = useScaffoldReadContract({
    contractName: "Counter",
    functionName: "x",
  });

  const handleIncrement = async () => {
    try {
      writeYourContractAsync({
        functionName: "increment",
      }).then(() => refetchCount());
    } catch (e) {
      console.error("Error incrementing:", e);
    }
  };

  const handleDecrement = async () => {
    try {
      writeYourContractAsync({
        functionName: "decrement",
      }).then(() => refetchCount());
    } catch (e) {
      console.error("Error decrementing:", e);
    }
  };

  return (
    <div className="flex flex-col items-center border-2 border-base-300 rounded-xl p-6">
      <div className="text-sm mb-2 font-semibold uppercase text-base-content/70">Your Counter</div>
      <div className="text-4xl font-bold mb-4">X: {count?.toString() || "0"}</div>
      <div className="flex gap-4">
        <button className="btn btn-primary" onClick={handleIncrement}>
          Increment
        </button>
        <button className="btn btn-secondary" onClick={handleDecrement}>
          Decrement
        </button>
      </div>
    </div>
  );
};
