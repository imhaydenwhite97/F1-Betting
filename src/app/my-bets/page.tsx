"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Calendar, Clock, Trophy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, isBefore } from 'date-fns';
import { Bet, Race, Driver } from '@/lib/db/schema';
import { toast } from 'sonner';
import { Prediction, ScoringBreakdown, ScoringDetail } from '@/lib/scoring';

type UserBet = Bet & {
  race: Race;
  scoringDetails?: ScoringBreakdown | null;
};

export default function MyBetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bets, setBets] = useState<UserBet[]>([]);
  const [drivers, setDrivers] = useState<Record<string, Driver>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') return;

      setLoading(true);
      try {
        // Fetch user bets
        const betsResponse = await fetch('/api/bets');
        if (betsResponse.ok) {
          const betsData: UserBet[] = await betsResponse.json();
          setBets(betsData);
        }

        // Fetch drivers for reference
        const driversResponse = await fetch('/api/drivers');
        if (driversResponse.ok) {
          const driversData: Driver[] = await driversResponse.json();
          const driversMap: Record<string, Driver> = {};
          driversData.forEach((driver: Driver) => {
            driversMap[driver.id] = driver;
          });
          setDrivers(driversMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load bets');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  // Split bets into upcoming and completed races
  const upcomingBets = bets.filter(bet => !bet.race.isCompleted)
    .sort((a, b) => new Date(a.race.date).getTime() - new Date(b.race.date).getTime());

  const completedBets = bets.filter(bet => bet.race.isCompleted)
    .sort((a, b) => new Date(a.race.date).getTime() - new Date(b.race.date).getTime());

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bets</h1>
        <p className="text-muted-foreground">Track your F1 race predictions and scores</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Races</TabsTrigger>
          <TabsTrigger value="completed">Completed Races</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">Loading bets...</div>
          ) : upcomingBets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {upcomingBets.map(bet => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  drivers={drivers}
                  showEdit={isBefore(new Date(), new Date(bet.race.bettingDeadline))}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              You haven't placed any bets for upcoming races yet.
              <div className="mt-4">
                <Button asChild>
                  <Link href="/races">View Upcoming Races</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">Loading bets...</div>
          ) : completedBets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {completedBets.map(bet => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  drivers={drivers}
                  showResults={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              You don't have any bets for completed races.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

type BetCardProps = {
  bet: UserBet;
  drivers: Record<string, Driver>;
  showEdit?: boolean;
  showResults?: boolean;
};

function BetCard({ bet, drivers, showEdit = false, showResults = false }: BetCardProps) {
  const predictions = bet.predictions as Prediction;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              {bet.race.name}
            </CardTitle>
            <CardDescription>
              {bet.race.location} - Round {bet.race.round}, {bet.race.season} Season
            </CardDescription>
          </div>
          {bet.score !== null && (
            <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {bet.score} points
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Race Date: {format(new Date(bet.race.date), 'PPP')}</span>
          </div>

          {!bet.race.isCompleted && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Betting Deadline: {format(new Date(bet.race.bettingDeadline), 'PPP p')}
              </span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Your Prediction:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {predictions.positions.slice(0, 10).map((pos) => (
              <div key={pos.position} className="flex items-center gap-2 text-sm">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full
                  ${pos.position === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                    pos.position === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' :
                      pos.position === 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100' :
                        'bg-muted text-muted-foreground'}`
                }>
                  {pos.position}
                </div>
                <span>{drivers[pos.driverId]?.code || 'Unknown'}</span>
              </div>
            ))}
          </div>
        </div>

        {predictions.fastestLap && (
          <div>
            <h3 className="text-sm font-medium mb-1">Fastest Lap:</h3>
            <span className="text-sm">{drivers[predictions.fastestLap]?.code || 'Unknown'}</span>
          </div>
        )}

        {predictions.dnfs && predictions.dnfs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">DNF Predictions:</h3>
            <div className="flex flex-wrap gap-1">
              {predictions.dnfs.map(driverId => (
                <span
                  key={driverId}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  {drivers[driverId]?.code || 'Unknown'}
                </span>
              ))}
            </div>
          </div>
        )}

        {bet.score !== null && bet.scoringDetails && 'details' in bet.scoringDetails && (
          <div>
            <h3 className="text-sm font-medium mb-1">Scoring Breakdown:</h3>
            <div className="max-h-40 overflow-y-auto text-xs space-y-1">
              {(bet.scoringDetails as ScoringBreakdown).details.map((detail: ScoringDetail, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{detail.description}</span>
                  <span className={detail.points > 0 ? 'text-green-500' : 'text-red-500'}>
                    {detail.points > 0 ? `+${detail.points}` : detail.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button asChild size="sm">
            <Link href={`/races/${bet.race.id}`}>View Race</Link>
          </Button>

          {showEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/place-bet/${bet.race.id}`}>Edit Bet</Link>
            </Button>
          )}

          {showResults && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/races/${bet.race.id}/results`}>View Results</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
