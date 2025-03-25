"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flag, Trophy, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Race, Driver, Bet, User } from '@/lib/db/schema';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ScoringDetail } from '@/lib/scoring';

type RaceResult = {
  id: string;
  position: number | null;
  dnf: boolean;
  fastestLap: boolean;
  driver: Driver;
};

type BetWithUser = Bet & {
  user: User;
  scoringDetails?: {
    totalScore: number;
    details: ScoringDetail[];
  } | null;
}

type RaceWithResults = Race & {
  results: RaceResult[];
  bets: Array<BetWithUser>;
};

export default function RaceResultsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [race, setRace] = useState<RaceWithResults | null>(null);
  const [userBet, setUserBet] = useState<BetWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaceResults = async () => {
      setLoading(true);
      try {
        // Fetch race with results
        const raceResponse = await fetch(`/api/races/${id}`);
        if (raceResponse.ok) {
          const raceData = await raceResponse.json();
          setRace(raceData);

          // Find user's bet if logged in
          if (session?.user?.id && raceData.bets) {
            const userBet = raceData.bets.find((bet: BetWithUser) =>
              bet.user.id === session.user.id
            );
            if (userBet) {
              setUserBet(userBet);
            }
          }
        } else {
          toast.error('Race not found');
        }
      } catch (error) {
        console.error('Error fetching race results:', error);
        toast.error('Failed to load race results');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRaceResults();
    }
  }, [id, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading race results...</p>
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

  if (!race.isCompleted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{race.name} Results</h1>
          <p className="text-muted-foreground">
            Round {race.round}, {race.season} Season - {race.location}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Results Not Available
            </CardTitle>
            <CardDescription>
              This race has not been completed yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Race results will be available once the race is completed and the results are recorded.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/races/${race.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Race Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Sort results by position
  const sortedResults = [...race.results].sort((a, b) => {
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });

  // Sort bets by score
  const sortedBets = [...race.bets].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{race.name} Results</h1>
        <p className="text-muted-foreground">
          Round {race.round}, {race.season} Season - {race.location}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Race Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              Final Standings
            </CardTitle>
            <CardDescription>
              Official race results from {format(new Date(race.date), 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Pos</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      {result.position !== null ? (
                        result.position
                      ) : (
                        <span className="text-red-500">DNF</span>
                      )}
                      {result.fastestLap && (
                        <span className="ml-2 text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          FL
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{result.driver.name}</TableCell>
                    <TableCell className="text-right">{result.driver.team}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Fantasy Leaderboard
            </CardTitle>
            <CardDescription>
              {sortedBets.length} {sortedBets.length === 1 ? 'player' : 'players'} participated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBets.map((bet, index) => (
                  <TableRow key={bet.id} className={bet.user.id === session?.user?.id ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {bet.user.name}
                      {bet.user.id === session?.user?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {bet.score !== null ? bet.score : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* User's Bet Scoring Breakdown */}
      {userBet && userBet.scoringDetails && 'details' in userBet.scoringDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Your Scoring Breakdown</CardTitle>
            <CardDescription>
              Detailed points calculation for your bet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="text-lg font-semibold mb-2">Total Score: {userBet.score} points</h3>
                <div className="space-y-2">
                  {userBet.scoringDetails.details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                      <span>{detail.description}</span>
                      <span className={`font-medium ${
                        detail.points > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {detail.points > 0 ? `+${detail.points}` : detail.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/my-bets">View All My Bets</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href={`/races/${race.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Race Details
          </Link>
        </Button>

        <Button asChild>
          <Link href="/races">View All Races</Link>
        </Button>
      </div>
    </div>
  );
}
