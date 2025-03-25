"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, Calendar, Clock, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { Race } from '@/lib/db/schema';
import { useSession } from 'next-auth/react';
import { formatDistance, format, isPast, isFuture } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RacesPage() {
  const { data: session } = useSession();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/races');
        if (response.ok) {
          const data = await response.json();
          setRaces(data);
        }
      } catch (error) {
        console.error('Error fetching races:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  // Split races into upcoming, active, and past
  const upcomingRaces = races.filter(race =>
    !race.isCompleted && isFuture(new Date(race.date))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedRaces = races.filter(race =>
    race.isCompleted
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderRaceCard = (race: Race) => {
    const raceDate = new Date(race.date);
    const bettingDeadline = new Date(race.bettingDeadline);
    const isBettingOpen = new Date() < bettingDeadline && !race.isCompleted;

    return (
      <Card key={race.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                {race.name}
              </CardTitle>
              <CardDescription>
                {race.location} - Round {race.round}, {race.season} Season
              </CardDescription>
            </div>
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
        <CardContent className="pb-2">
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
            {race.isCompleted ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Trophy className="h-4 w-4" />
                <span>Results Available</span>
              </div>
            ) : isBettingOpen ? (
              <div className="text-blue-600 dark:text-blue-400">
                Betting closes {formatDistance(bettingDeadline, new Date(), { addSuffix: true })}
              </div>
            ) : !race.isCompleted ? (
              <div className="text-yellow-600 dark:text-yellow-400">
                Race starts {formatDistance(raceDate, new Date(), { addSuffix: true })}
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button asChild size="sm">
              <Link href={`/races/${race.id}`}>View Details</Link>
            </Button>
            {session && isBettingOpen && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/place-bet/${race.id}`}>Place Bet</Link>
              </Button>
            )}
            {race.isCompleted && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/races/${race.id}/results`}>See Results</Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">F1 Races</h1>
        <p className="text-muted-foreground">Browse upcoming and past Formula 1 races</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Races</TabsTrigger>
          <TabsTrigger value="completed">Completed Races</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {loading ? (
            <div className="text-center py-12">Loading races...</div>
          ) : upcomingRaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {upcomingRaces.map(renderRaceCard)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No upcoming races scheduled at this time.
            </div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {loading ? (
            <div className="text-center py-12">Loading races...</div>
          ) : completedRaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {completedRaces.map(renderRaceCard)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No completed races yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
