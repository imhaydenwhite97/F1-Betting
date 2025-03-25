"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Calendar, Clock, Trophy, Users, CheckCircle, XCircle } from 'lucide-react';
import { Race, Driver, Bet, User } from '@/lib/db/schema';
import { useSession } from 'next-auth/react';
import { format, formatDistance } from 'date-fns';
import { toast } from 'sonner';

type RaceWithResults = Race & {
  results: Array<{
    id: string;
    position: number | null;
    dnf: boolean;
    fastestLap: boolean;
    driver: Driver;
  }>;
  bets: Array<Bet & { user: User }>;
};

export default function RacePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [race, setRace] = useState<RaceWithResults | null>(null);
  const [userBet, setUserBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRace = async () => {
      setLoading(true);
      try {
        // Fetch race details
        const raceResponse = await fetch(`/api/races/${id}`);
        if (raceResponse.ok) {
          const raceData = await raceResponse.json();
          setRace(raceData);
        } else {
          toast.error('Race not found');
        }

        // Fetch user's bet for this race if logged in
        if (session?.user?.id) {
          const betsResponse = await fetch('/api/bets');
          if (betsResponse.ok) {
            const betsData = await betsResponse.json();
            const bet = betsData.find((b: Bet) => b.raceId === id);
            if (bet) {
              setUserBet(bet);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching race:', error);
        toast.error('Failed to load race data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRace();
    }
  }, [id, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading race details...</p>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground mb-4">Race not found</p>
        <Button asChild>
          <Link href="/races">View All Races</Link>
        </Button>
      </div>
    );
  }

  const raceDate = new Date(race.date);
  const bettingDeadline = new Date(race.bettingDeadline);
  const now = new Date();
  const isBettingOpen = now < bettingDeadline && !race.isCompleted;

  // Sort bets by score if race is completed
  const sortedBets = race.isCompleted
    ? [...race.bets].sort((a, b) => (b.score || 0) - (a.score || 0))
    : race.bets;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{race.name}</h1>
        <p className="text-muted-foreground">
          Round {race.round}, {race.season} Season - {race.location}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              Race Details
            </CardTitle>
            {race.isCompleted ? (
              <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Completed
              </span>
            ) : isBettingOpen ? (
              <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Betting Open
              </span>
            ) : (
              <span className="text-sm px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Betting Closed
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Race Date: {format(raceDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Betting Deadline: {format(bettingDeadline, 'PPP p')}
              </span>
            </div>
            {isBettingOpen ? (
              <div className="text-blue-600 dark:text-blue-400">
                Betting closes {formatDistance(bettingDeadline, now, { addSuffix: true })}
              </div>
            ) : !race.isCompleted ? (
              <div className="text-yellow-600 dark:text-yellow-400">
                Race starts {formatDistance(raceDate, now, { addSuffix: true })}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            {isBettingOpen ? (
              session ? (
                userBet ? (
                  <Button asChild>
                    <Link href={`/place-bet/${race.id}`}>Update Bet</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/place-bet/${race.id}`}>Place Bet</Link>
                  </Button>
                )
              ) : (
                <Button asChild>
                  <Link href="/login">Sign In to Place Bet</Link>
                </Button>
              )
            ) : race.isCompleted ? (
              <Button asChild>
                <Link href={`/races/${race.id}/results`}>View Results</Link>
              </Button>
            ) : (
              <div className="text-muted-foreground text-sm">
                Betting is closed for this race
              </div>
            )}

            {userBet && (
              <Button asChild variant="outline">
                <Link href="/my-bets">View My Bet</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="lineup">Driver Lineup</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {race.isCompleted ? 'Results' : 'Current Bets'}
              </CardTitle>
              <CardDescription>
                {race.isCompleted
                  ? 'Final leaderboard with scores'
                  : race.bets.length > 0
                    ? `${race.bets.length} ${race.bets.length === 1 ? 'player has' : 'players have'} placed bets`
                    : 'No bets placed yet'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedBets.length > 0 ? (
                <div className="space-y-2">
                  {sortedBets.map((bet, index) => (
                    <div
                      key={bet.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        index === 0 && race.isCompleted
                          ? 'bg-yellow-100 dark:bg-yellow-900/20'
                          : index % 2 === 0
                            ? 'bg-muted/50'
                            : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {race.isCompleted && (
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full text-sm
                            ${index === 0
                              ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                              : index === 1
                                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                : index === 2
                                  ? 'bg-amber-800/70 text-amber-100 dark:bg-amber-800 dark:text-amber-200'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </div>
                        )}
                        <div className="font-medium">
                          {bet.user.name}
                          {bet.user.id === session?.user?.id && (
                            <span className="text-xs ml-1 text-muted-foreground">(You)</span>
                          )}
                        </div>
                      </div>

                      {race.isCompleted && bet.score !== null && (
                        <div className="font-bold">
                          {bet.score} pts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No bets have been placed yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineup" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Driver Lineup
              </CardTitle>
              <CardDescription>
                {race.isCompleted
                  ? 'Final race results'
                  : 'Participating drivers for this Grand Prix'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {race.results && race.results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {race.results
                    .sort((a, b) => {
                      // Sort by position if race is completed
                      if (race.isCompleted) {
                        if (a.position === null) return 1;
                        if (b.position === null) return -1;
                        return a.position - b.position;
                      }
                      // Otherwise sort by driver name
                      return a.driver.name.localeCompare(b.driver.name);
                    })
                    .map((result) => (
                      <div
                        key={result.id}
                        className={`flex items-center gap-2 p-2 rounded ${
                          race.isCompleted && result.position === 1
                            ? 'bg-yellow-100 dark:bg-yellow-900/20'
                            : ''
                        }`}
                      >
                        {race.isCompleted && result.position !== null ? (
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full text-sm
                            ${result.position === 1
                              ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                              : result.position === 2
                                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                : result.position === 3
                                  ? 'bg-amber-800/70 text-amber-100 dark:bg-amber-800 dark:text-amber-200'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {result.position}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-6 w-6 rounded-full text-sm bg-muted text-muted-foreground">
                            {result.driver.number}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{result.driver.name}</span>
                          <span className="text-xs ml-2 text-muted-foreground">
                            {result.driver.team}
                          </span>
                        </div>
                        {race.isCompleted && result.dnf && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            DNF
                          </span>
                        )}
                        {race.isCompleted && result.fastestLap && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                            Fastest Lap
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Driver lineup not available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
