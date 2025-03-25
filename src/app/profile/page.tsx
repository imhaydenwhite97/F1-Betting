"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Flame, Flag, User, BarChart } from 'lucide-react';
import { Bet } from '@/lib/db/schema';
import { toast } from 'sonner';

type UserStats = {
  totalBets: number;
  completedBets: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  bestRace?: string;
  winCount: number;
  podiumCount: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userBets, setUserBets] = useState<any[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBets: 0,
    completedBets: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    winCount: 0,
    podiumCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserBets = async () => {
      if (status !== 'authenticated') return;

      setLoading(true);
      try {
        // Fetch user bets
        const betsResponse = await fetch('/api/bets');
        if (betsResponse.ok) {
          const betsData = await betsResponse.json();
          setUserBets(betsData);

          // Calculate stats
          if (betsData.length > 0) {
            const completedBets = betsData.filter((bet: any) => bet.score !== null);
            const totalScore = completedBets.reduce((sum: number, bet: any) => sum + (bet.score || 0), 0);
            const bestBet = completedBets.reduce((best: any, bet: any) =>
              (bet.score || 0) > (best?.score || 0) ? bet : best, null);

            // Count 1st, 2nd, 3rd place finishes
            const racesWithUser = completedBets.map((bet: any) => bet.race.id);
            const raceWinners = completedBets.filter((bet: any) => {
              const raceId = bet.race.id;
              const raceScores = completedBets
                .filter((b: any) => b.race.id === raceId)
                .sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

              return raceScores.length > 0 && raceScores[0].id === bet.id;
            });

            const racePodiums = completedBets.filter((bet: any) => {
              const raceId = bet.race.id;
              const raceScores = completedBets
                .filter((b: any) => b.race.id === raceId)
                .sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

              return raceScores.length > 2 &&
                (raceScores[0].id === bet.id ||
                 raceScores[1].id === bet.id ||
                 raceScores[2].id === bet.id);
            });

            setStats({
              totalBets: betsData.length,
              completedBets: completedBets.length,
              totalScore,
              averageScore: completedBets.length > 0 ? Math.round(totalScore / completedBets.length) : 0,
              bestScore: bestBet?.score || 0,
              bestRace: bestBet?.race?.name,
              winCount: raceWinners.length,
              podiumCount: racePodiums.length,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBets();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View your account details and betting statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {session?.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-center">{session?.user?.name}</CardTitle>
            <CardDescription className="text-center">{session?.user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Username</span>
              <span className="font-medium">{session?.user?.username || 'Not set'}</span>
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Member Since</span>
              <span className="font-medium">March 2025</span>
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Account Type</span>
              <span className="font-medium">
                {session?.user?.isAdmin ? 'Administrator' : 'Regular User'}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Edit Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Stats Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              Your Betting Statistics
            </CardTitle>
            <CardDescription>
              Track your performance across all F1 races
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-2xl font-bold">{stats.totalBets}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Completed Races</p>
                <p className="text-2xl font-bold">{stats.completedBets}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold">{stats.totalScore}</p>
              </div>
              <div className="border rounded p-3 text-center">
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="font-bold text-lg">{stats.bestScore}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.bestRace ? `at ${stats.bestRace}` : 'No races completed yet'}
                </p>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">1st Place Finishes</p>
                  <p className="font-bold text-lg">{stats.winCount}</p>
                </div>
                <div className="flex justify-center">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Podium Finishes</p>
                  <p className="font-bold text-lg">{stats.podiumCount}</p>
                </div>
                <div className="flex justify-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <Trophy className="h-4 w-4 text-gray-400" />
                  <Trophy className="h-4 w-4 text-amber-700" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button asChild>
                <Link href="/my-bets">
                  <Flame className="mr-2 h-4 w-4" />
                  View My Bets
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/races">
                  <Flag className="mr-2 h-4 w-4" />
                  Browse Races
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest bets and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userBets.length > 0 ? (
            <div className="space-y-4">
              {userBets.slice(0, 5).map((bet: any) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{bet.race.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bet.race.date) > new Date()
                        ? `Race on ${format(new Date(bet.race.date), 'PPP')}`
                        : `Raced on ${format(new Date(bet.race.date), 'PPP')}`}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {bet.score !== null ? (
                      <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {bet.score} points
                      </div>
                    ) : (
                      <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Bet Placed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No bets placed yet
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/my-bets">View All Bets</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
