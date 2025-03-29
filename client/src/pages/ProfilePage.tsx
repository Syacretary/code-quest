import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { AvatarSelection } from "@/components/ui/avatar-selection";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useProgress } from "@/lib/stores/useProgress";
import { challenges } from "@/lib/challenges";

export default function ProfilePage() {
  const { currentLevel, experience, skills } = useCharacter();
  const { completedChallenges, achievements } = useProgress();
  
  // Calculate completion percentage
  const completionPercentage = Math.round((completedChallenges.length / challenges.length) * 100);

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Programmer Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Character Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Character Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Level {currentLevel}</div>
                  <ProgressIndicator 
                    value={experience.current} 
                    max={experience.required} 
                    label={`XP: ${experience.current}/${experience.required}`} 
                  />
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium mb-2">Coding Skills</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium mb-1">Variables: Level {skills.variables}</div>
                      <ProgressIndicator value={skills.variables} max={10} />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Loops: Level {skills.loops}</div>
                      <ProgressIndicator value={skills.loops} max={10} />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Functions: Level {skills.functions}</div>
                      <ProgressIndicator value={skills.functions} max={10} />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Logic: Level {skills.logic}</div>
                      <ProgressIndicator value={skills.logic} max={10} />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Data Structures: Level {skills.dataStructures}</div>
                      <ProgressIndicator value={skills.dataStructures} max={10} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Completed: {completionPercentage}%</div>
                  <ProgressIndicator value={completionPercentage} max={100} />
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium mb-2">Completed Challenges ({completedChallenges.length}/{challenges.length})</h3>
                  {completedChallenges.length > 0 ? (
                    <ul className="space-y-1">
                      {completedChallenges.map(id => {
                        const challenge = challenges.find(c => c.id === id);
                        return challenge ? (
                          <li key={id} className="text-sm py-1 px-2 bg-primary/10 rounded-md">
                            ✅ {challenge.title}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No challenges completed yet.</p>
                  )}
                </div>

                <div className="pt-2">
                  <Link 
                    to="/game" 
                    className="block w-full py-2 text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Continue Quest
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Character</CardTitle>
            </CardHeader>
            <CardContent>
              <AvatarSelection />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
