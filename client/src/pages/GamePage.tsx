import { Layout } from "@/components/ui/layout";
import { GameScene } from "@/components/game/GameScene";

export default function GamePage() {
  return (
    <Layout>
      <div className="relative w-full h-full">
        <GameScene />
      </div>
    </Layout>
  );
}
