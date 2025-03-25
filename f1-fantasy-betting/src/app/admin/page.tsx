"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Flag, Users, Plus, Loader2, CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Race } from '@/lib/db/schema';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState<Race[]>([]);
  const [creatingRace, setCreatingRace] = useState(false);

  // New race form state
  const [raceName, setRaceName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [round, setRound] = useState('');
  const [bettingDeadline, setBettingDeadline] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (status === 'authenticated') {
      if (!session?.user?.isAdmin) {
        toast.error('You do not have access to the admin panel');
        router.push('/');
      } else {
        // Fetch races
        fetchRaces();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const fetchRaces = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/races');
      if (response.ok) {
        const data = await response.json();
        setRaces(data);
      } else {
        toast.error('Failed to fetch races');
      }
    } catch (error) {
      toast.error('Error fetching races');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!raceName || !location || !date || !season || !round || !bettingDeadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreatingRace(true);

    try {
      const response = await fetch('/api/races', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: raceName,
          location,
          date: new Date(date).toISOString(),
          season: parseInt(season),
          round: parseInt(round),
          bettingDeadline: new Date(bettingDeadline).toISOString(),
          isCompleted: false,
          isActive: true,
        }),
      });

      if (response.ok) {
        toast.success('Race created successfully');
        // Reset form
        setRaceName('');
        setLocation('');
        setDate('');
        setSeason(new Date().getFullYear().toString());
        setRound('');
        setBettingDeadline('');
        // Refresh races
        fetchRaces();
      } else {
        const error = await response.json();
        toast.error(`Failed to create race: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Error creating race: ${error}`);
    } finally {
      setCreatingRace(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user?.isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage races, results, and settings
        </p>
      </div>

      <Tabs defaultValue="races" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="races">Races</TabsTrigger>
          <TabsTrigger value="invite">Invite Players</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="races" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Create New Race
              </CardTitle>
              <CardDescription>
                Add a new race to the calendar
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateRace}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Race Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Brazilian Grand Prix"
                      value={raceName}
                      onChange={(e) => setRaceName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. São Paulo"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Race Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="datetime-local"
                        className="pl-10"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Betting Deadline</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deadline"
                        type="datetime-local"
                        className="pl-10"
                        value={bettingDeadline}
                        onChange={(e) => setBettingDeadline(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Season</Label>
                    <Input
                      id="season"
                      type="number"
                      placeholder="e.g. 2025"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="round">Round</Label>
                    <Input
                      id="round"
                      type="number"
                      placeholder="e.g. 5"
                      value={round}
                      onChange={(e) => setRound(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={creatingRace}
                  className="w-full"
                >
                  {creatingRace ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Race...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Race
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Races</CardTitle>
              <CardDescription>
                Manage existing races and enter results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {races.length > 0 ? (
                <div className="space-y-2">
                  {races.map((race) => (
                    <div
                      key={race.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{race.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {race.location} - {format(new Date(race.date), 'PPP')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`/admin/races/${race.id}`}>
                            Manage
                          </a>
                        </Button>
                        {race.isCompleted ? (
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            Completed
                          </div>
                        ) : (
                          <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            Upcoming
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No races found. Create one above.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Invite Players
              </CardTitle>
              <CardDescription>
                Invite friends to join your F1 Fantasy Betting league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    className="flex-1"
                  />
                  <Button>Send Invite</Button>
                </div>
              </div>

              <div className="border rounded p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Share Your League</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Share this link with friends to invite them to join your F1 Fantasy Betting league.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={typeof window !== 'undefined' ? window.location.origin : ''}
                    readOnly
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  The invite functionality is for demonstration purposes only in this version.<br />
                  In a production version, you would be able to create private leagues and invite friends.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Configure app settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="league-name">League Name</Label>
                <Input
                  id="league-name"
                  placeholder="My F1 Fantasy League"
                  defaultValue="F1 Fantasy Betting"
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="private"
                    name="visibility"
                    defaultChecked
                  />
                  <Label htmlFor="private">Private (Invite only)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="public"
                    name="visibility"
                  />
                  <Label htmlFor="public">Public (Anyone can join)</Label>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  The settings functionality is for demonstration purposes only in this version.<br />
                  In a production version, you would be able to customize the league settings.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
