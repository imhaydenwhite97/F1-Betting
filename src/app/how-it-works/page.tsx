"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Flag, HelpCircle, LucideCalculator, Share2, Trophy, Users } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">How F1 Fantasy Betting Works</h1>
        <p className="text-muted-foreground max-w-3xl">
          Learn how to use the F1 Fantasy Betting app, invite friends, and understand the scoring system.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="races">Races</TabsTrigger>
          <TabsTrigger value="betting">Betting</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="friends">Inviting Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                F1 Fantasy Betting Overview
              </CardTitle>
              <CardDescription>
                Learn how the app works and how to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">What is F1 Fantasy Betting?</h3>
                <p className="mt-2">
                  F1 Fantasy Betting is a web application that allows you to predict the exact finishing order of Formula 1 Grand Prix races and compete with friends for points.
                  It's a fun way to make watching F1 races even more exciting!
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">How does it work?</h3>
                <ol className="mt-2 space-y-2 list-decimal list-inside">
                  <li>Sign up with your name and email</li>
                  <li>Browse upcoming races in the race calendar</li>
                  <li>Place bets by predicting the exact finishing order of drivers</li>
                  <li>Also predict fastest lap and potential DNFs (Did Not Finish)</li>
                  <li>Earn points based on how accurate your predictions are</li>
                  <li>Compare your scores with friends on the leaderboard</li>
                </ol>
              </div>

              <div className="bg-muted p-4 rounded">
                <h3 className="text-lg font-medium">Getting Started</h3>
                <p className="mt-2">
                  1. <strong>Initialize the database</strong> from the homepage (this is only needed for the demo)<br />
                  2. <strong>Sign in</strong> with any name and email (no password required for the demo)<br />
                  3. <strong>Browse races</strong> and place your bets before the betting deadline<br />
                  4. <strong>Check results</strong> after the race to see your score
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="races" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                How Races Work
              </CardTitle>
              <CardDescription>
                Learn how races are added and managed in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Where do races come from?</h3>
                <p className="mt-2">
                  In this demo version, races are created in two ways:
                </p>
                <ul className="mt-2 space-y-2 list-disc list-inside">
                  <li><strong>Sample Data:</strong> When you initialize the database, sample races are created automatically</li>
                  <li><strong>Admin Dashboard:</strong> Administrators can add new races through the admin dashboard</li>
                </ul>
                <p className="mt-2">
                  In a production version, races would typically be imported from the official F1 calendar API or entered by league administrators.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Race Information</h3>
                <p className="mt-2">
                  Each race includes the following information:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Race name (e.g., "Japanese Grand Prix")</li>
                  <li>Location (e.g., "Suzuka")</li>
                  <li>Date and time of the race</li>
                  <li>Season (year) and round number</li>
                  <li>Betting deadline (when betting closes)</li>
                  <li>Status (upcoming, active, completed)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Race Results</h3>
                <p className="mt-2">
                  After a race is completed, an administrator enters the official results, including:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Final finishing order of all drivers</li>
                  <li>DNFs (drivers who did not finish)</li>
                  <li>Fastest lap information</li>
                </ul>
                <p className="mt-2">
                  Once results are entered, all bets are automatically scored based on the scoring system.
                </p>
              </div>

              <div className="bg-muted p-4 rounded">
                <h3 className="text-lg font-medium mb-2">For Administrators</h3>
                <p>
                  To become an administrator in this demo, you need to initialize the database and log in as:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Email: admin@example.com</li>
                  <li>Name: Admin User</li>
                </ul>
                <p className="mt-2">
                  As an admin, you can access the admin dashboard at <code>/admin</code> to create and manage races.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="betting" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                How Betting Works
              </CardTitle>
              <CardDescription>
                Learn how to place bets and predict race outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Placing a Bet</h3>
                <p className="mt-2">
                  For each race, you can place a bet that includes:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Finishing Order:</strong> Predict the exact order of all 20 drivers</li>
                  <li><strong>Fastest Lap:</strong> Predict which driver will record the fastest lap</li>
                  <li><strong>DNFs:</strong> Predict which drivers will not finish the race</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Betting Deadlines</h3>
                <p className="mt-2">
                  Each race has a betting deadline, typically set before the race starts. You cannot place or update bets after this deadline.
                </p>
                <p className="mt-2">
                  The betting deadline is displayed on the race details page and on your bet form.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Using the Bet Form</h3>
                <p className="mt-2">
                  The betting interface includes:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Drag-and-Drop Ordering:</strong> Arrange drivers in your predicted finishing order</li>
                  <li><strong>Driver Selection:</strong> Alternatively, select drivers from dropdown menus for each position</li>
                  <li><strong>Fastest Lap:</strong> Select the driver you think will record the fastest lap</li>
                  <li><strong>DNF Predictions:</strong> Check the boxes for drivers you think will not finish</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Updating Bets</h3>
                <p className="mt-2">
                  You can update your bet as many times as you want before the betting deadline. After the deadline, your bet is locked.
                </p>
              </div>

              <div className="bg-muted p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Tips for Betting</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Focus on accurate predictions for the top 10 positions, as they earn the most points</li>
                  <li>Even if you're not sure about the exact order, being off by 1-3 positions still earns points</li>
                  <li>Don't forget to make fastest lap and DNF predictions for bonus points</li>
                  <li>Keep track of team and driver performance trends to make more accurate predictions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideCalculator className="h-5 w-5 text-green-500" />
                Scoring System
              </CardTitle>
              <CardDescription>
                Understand how points are calculated based on your predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Base Scoring</h3>
                <table className="w-full mt-2 border-collapse">
                  <thead>
                    <tr className="bg-muted text-left">
                      <th className="py-2 px-3 border">Prediction</th>
                      <th className="py-2 px-3 border">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border">Correct Position</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+25 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">One Position Off</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+15 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Two Positions Off</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+10 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Three Positions Off</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+5 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Driver in Top 10 but Wrong Spot</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+2 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Driver Not in Top 10 at All</td>
                      <td className="py-2 px-3 border font-medium text-red-600 dark:text-red-400">-5 points</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-medium">Bonus Points</h3>
                <table className="w-full mt-2 border-collapse">
                  <thead>
                    <tr className="bg-muted text-left">
                      <th className="py-2 px-3 border">Prediction</th>
                      <th className="py-2 px-3 border">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 border">Perfect Podium (Top 3 in exact order)</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+30 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Perfect Top 5 (Exact Order)</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+50 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Perfect Top 10 (Exact Order)</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+100 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Correct Winner</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+20 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Fastest Lap Prediction</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+10 points</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border">Correct DNF Prediction</td>
                      <td className="py-2 px-3 border font-medium text-green-600 dark:text-green-400">+15 points</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-medium">Scoring Example</h3>
                <div className="mt-2 p-4 border rounded">
                  <p className="font-medium">Example Prediction:</p>
                  <ol className="mt-2 list-decimal list-inside">
                    <li>Verstappen</li>
                    <li>Norris</li>
                    <li>Leclerc</li>
                    <li>Russell</li>
                    <li>Hamilton</li>
                  </ol>

                  <p className="font-medium mt-3">Actual Results:</p>
                  <ol className="mt-2 list-decimal list-inside">
                    <li>Verstappen ✅ (+25 points)</li>
                    <li>Leclerc ❌ (One off) (+15 points)</li>
                    <li>Norris ❌ (One off) (+15 points)</li>
                    <li>Hamilton ❌ (One off) (+15 points)</li>
                    <li>Russell ❌ (One off) (+15 points)</li>
                  </ol>

                  <p className="font-medium mt-3">Bonus:</p>
                  <ul className="mt-2 list-disc list-inside">
                    <li>Correct Winner ✅ (+20 points)</li>
                    <li>Perfect Podium ❌ (No bonus)</li>
                    <li>Perfect Top 5 ❌ (No bonus)</li>
                  </ul>

                  <p className="font-medium mt-3">Total Score: 105 points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Inviting Friends
              </CardTitle>
              <CardDescription>
                Learn how to invite friends and create private leagues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">How to Invite Friends</h3>
                <p className="mt-2">
                  In the current demo version, the invite system is simplified. Here's how it works:
                </p>
                <ol className="mt-2 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Share the URL:</strong> Send your friends the URL to the website. Anyone can join by signing up with their name and email.
                  </li>
                  <li>
                    <strong>No Verification Required:</strong> In this demo, there's no email verification, so anyone can join immediately.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium">Admin Capabilities</h3>
                <p className="mt-2">
                  If you're an administrator (use email: admin@example.com, name: Admin User), you can access the admin panel at <code>/admin</code> where you'll find:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>A demo invite system UI (not functional in this version)</li>
                  <li>League settings to configure visibility (demo only)</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded">
                <h3 className="text-lg font-medium mb-2">In a Production Version</h3>
                <p>
                  A full version of this app would include:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Private Leagues:</strong> Create closed leagues only accessible to invited members</li>
                  <li><strong>Email Invitations:</strong> Send official invites with personalized messages</li>
                  <li><strong>League Codes:</strong> Generate unique codes friends can use to join your league</li>
                  <li><strong>Public/Private Toggle:</strong> Choose whether your league is discoverable</li>
                  <li><strong>Multiple Leagues:</strong> Join or create multiple different leagues</li>
                  <li><strong>League Administrators:</strong> Assign multiple admins to help manage a league</li>
                </ul>
              </div>

              <div className="flex justify-center mt-6">
                <Button asChild>
                  <Link href="/admin">
                    <Share2 className="mr-2 h-4 w-4" />
                    Go to Admin Panel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild>
          <Link href="/races">Browse Races</Link>
        </Button>
      </div>
    </div>
  );
}
