"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, Calendar, Trophy, Users, Clock } from 'lucide-react';
import { Race, Bet, User } from '@/lib/db/schema';
import { useSession, signIn } from 'next-auth/react';
import { formatDistance, format } from 'date-fns';
import { DbInitializer } from '@/components/db-initializer'; // Added import

type Winner = {
  id: string;
  score: number;
  user: User;
  race: Race;
};

export default function Home() {
  const { data: session } = useSession();
  const [activeRace, setActiveRace] = useState<Race | null>(null);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the active race
        const racesResponse = await fetch('/api/races');
        if (racesResponse.ok) {
          const races = await racesResponse.json();
          const active = races.find((r: Race) => r.isActive && !r.isCompleted);
          setActiveRace(active || null);
        }

        // Fetch recent winners
        const winnersResponse = await fetch('/api/winners');
        if (winnersResponse.ok) {
          const winners = await winnersResponse.json();
          setRecentWinners(winners.slice(0, 3)); // Only show top 3
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <DbInitializer /> {/* Added DbInitializer component */}

      <section className="space-y-4">
        <h1 className="text-4xl font-bold">F1 Fantasy Betting</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Make your predictions for the exact finishing order of F1 Grand Prix races and compete with friends!
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Race Card */}
        <Card className="col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              {activeRace ? activeRace.name : 'No Active Race'}
            </CardTitle>
            <CardDescription>
              {activeRace ? `Round ${activeRace.round}, ${activeRace.season} Season` : 'Check back later for the next race'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRace ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Race Date: {format(new Date(activeRace.date), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Betting Deadline: {format(new Date(activeRace.bettingDeadline), 'PPP p')}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  {new Date() < new Date(activeRace.bettingDeadline) ? (
                    <span className="text-green-500">
                      Betting is open! Closes in {formatDistance(new Date(activeRace.bettingDeadline), new Date(), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="text-red-500">Betting is closed</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No active race at the moment
              </div>
            )}
          </CardContent>
          <CardFooter>
            {activeRace && (
              <div className="w-full flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button asChild size="sm">
                  <Link href={`/races/${activeRace.id}`}>View Race Details</Link>
                </Button>
                {session && new Date() < new Date(activeRace.bettingDeadline) && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/place-bet/${activeRace.id}`}>Place Bet</Link>
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Winners Card */}
        <Card className="col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Recent Winners
            </CardTitle>
            <CardDescription>
              Top players from recently completed races
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentWinners.length > 0 ? (
              <div className="space-y-4">
                {recentWinners.map((winner, i) => (
                  <div key={winner.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-7 w-7 rounded-full
                        ${i === 0 ? 'bg-yellow-200 text-yellow-800' :
                          i === 1 ? 'bg-gray-200 text-gray-800' :
                            'bg-amber-800 text-amber-200'}`
                      }>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{winner.user.name}</p>
                        <p className="text-sm text-muted-foreground">{winner.race.name}</p>
                      </div>
                    </div>
                    <div className="font-bold">{winner.score} pts</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent winners
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="w-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Scoring system for the F1 Fantasy Betting game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Base Scoring</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+25 points</span> - Correct Position
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+15 points</span> - One Position Off
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+10 points</span> - Two Positions Off
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+5 points</span> - Three Positions Off
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+2 points</span> - Driver in Top 10 but Wrong Spot
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">-5 points</span> - Driver Not in Top 10 at All
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Bonus Points</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+30 points</span> - Perfect Podium (Top 3 in exact order)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+50 points</span> - Perfect Top 5 (Exact Order)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+100 points</span> - Perfect Top 10 (Exact Order)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+20 points</span> - Correct Winner
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+10 points</span> - Fastest Lap Prediction
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">+15 points</span> - Correct DNF Prediction
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-2 md:justify-between">
          <Button asChild size="sm">
            <Link href="/races">View Upcoming Races</Link>
          </Button>
          {session ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/my-bets">My Bets</Link>
            </Button>
          ) : (
            <Button onClick={() => signIn()} variant="outline" size="sm">
              Sign In to Place Bets
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
