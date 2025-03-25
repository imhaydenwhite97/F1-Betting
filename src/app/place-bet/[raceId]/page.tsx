"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { Race, Driver, Bet } from '@/lib/db/schema';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type PredictionPosition = {
  position: number;
  driverId: string;
};

type Prediction = {
  positions: PredictionPosition[];
  fastestLap?: string;
  dnfs?: string[];
};

export default function PlaceBetPage() {
  const { raceId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [race, setRace] = useState<Race | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [existingBet, setExistingBet] = useState<Bet | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<PredictionPosition[]>([]);
  const [fastestLap, setFastestLap] = useState<string>('');
  const [selectedDNFs, setSelectedDNFs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch race details
        const raceResponse = await fetch(`/api/races/${raceId}`);
        if (raceResponse.ok) {
          const raceData = await raceResponse.json();
          setRace(raceData);

          // Check if betting is still open
          if (new Date(raceData.bettingDeadline) < new Date() || raceData.isCompleted) {
            toast.error('Betting is closed for this race');
            router.push('/races');
            return;
          }
        } else {
          toast.error('Race not found');
          router.push('/races');
          return;
        }

        // Fetch drivers
        const driversResponse = await fetch('/api/drivers');
        if (driversResponse.ok) {
          const driversData = await driversResponse.json();
          setDrivers(driversData);
        }

        // Fetch user's existing bet for this race if any
        const betsResponse = await fetch('/api/bets');
        if (betsResponse.ok) {
          const betsData = await betsResponse.json();
          const existingBet = betsData.find((bet: Bet) => bet.raceId === raceId);

          if (existingBet) {
            setExistingBet(existingBet);
            const predictions = existingBet.predictions as Prediction;
            setSelectedPositions(predictions.positions || []);
            setFastestLap(predictions.fastestLap || '');
            setSelectedDNFs(predictions.dnfs || []);
          } else {
            // Initialize empty positions for all 20 positions
            setSelectedPositions(
              Array.from({ length: 20 }, (_, i) => ({
                position: i + 1,
                driverId: '',
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (raceId && status === 'authenticated') {
      fetchData();
    }
  }, [raceId, status, router]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedPositions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update position numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1
    }));

    setSelectedPositions(updatedItems);
  };

  const handleDriverSelect = (position: number, driverId: string) => {
    // Remove the driver from any other position
    const updatedPositions = selectedPositions.map(pos => {
      if (pos.driverId === driverId) {
        return { ...pos, driverId: '' };
      }
      if (pos.position === position) {
        return { ...pos, driverId };
      }
      return pos;
    });

    setSelectedPositions(updatedPositions);
  };

  const handleDNFToggle = (driverId: string) => {
    if (selectedDNFs.includes(driverId)) {
      setSelectedDNFs(selectedDNFs.filter(id => id !== driverId));
    } else {
      setSelectedDNFs([...selectedDNFs, driverId]);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to place a bet');
      return;
    }

    // Validate bet
    const filledPositions = selectedPositions.filter(p => p.driverId);
    if (filledPositions.length < 10) {
      toast.error('You must select at least the top 10 positions');
      return;
    }

    if (!fastestLap) {
      toast.error('You must select a driver for fastest lap');
      return;
    }

    setSubmitting(true);

    try {
      const prediction: Prediction = {
        positions: selectedPositions,
        fastestLap,
        dnfs: selectedDNFs
      };

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raceId,
          predictions: prediction
        }),
      });

      if (response.ok) {
        toast.success(existingBet ? 'Bet updated successfully' : 'Bet placed successfully');
        router.push(`/races/${raceId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to place bet');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!race) {
    return null;
  }

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border-yellow-300';
    if (position === 2) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border-gray-300';
    if (position === 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 border-amber-300';
    return 'bg-background border-border';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Place Your Bet</h1>
        <p className="text-muted-foreground">
          {existingBet ? 'Update your prediction for' : 'Predict the finishing order for'} {race.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            {race.name}
          </CardTitle>
          <CardDescription>
            Round {race.round}, {race.season} Season - {race.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Race Date: {format(new Date(race.date), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              Betting Deadline: {format(new Date(race.bettingDeadline), 'PPP p')}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Position order section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Race Finishing Order</CardTitle>
            <CardDescription>
              Drag and drop drivers to set the finishing order or select from dropdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="positions">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {selectedPositions.slice(0, 20).map((pos, index) => (
                      <Draggable
                        key={`position-${pos.position}`}
                        draggableId={`position-${pos.position}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-2 border rounded flex items-center gap-2 ${getPositionColor(pos.position)}`}
                          >
                            <div className="w-8 h-8 flex items-center justify-center rounded-full border">
                              {pos.position}
                            </div>
                            <Select
                              value={pos.driverId}
                              onValueChange={(value) => handleDriverSelect(pos.position, value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select a driver" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- Select Driver --</SelectItem>
                                {drivers.map((driver) => (
                                  <SelectItem
                                    key={driver.id}
                                    value={driver.id}
                                    disabled={selectedPositions.some(p => p.driverId === driver.id && p.position !== pos.position)}
                                  >
                                    {driver.name} ({driver.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Additional predictions section */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Predictions</CardTitle>
            <CardDescription>
              Predict fastest lap and potential DNFs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="fastest-lap">Fastest Lap</Label>
              <Select
                value={fastestLap}
                onValueChange={setFastestLap}
              >
                <SelectTrigger id="fastest-lap">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Did Not Finish (DNF) Predictions</Label>
              <div className="grid grid-cols-2 gap-2">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dnf-${driver.id}`}
                      checked={selectedDNFs.includes(driver.id)}
                      onCheckedChange={() => handleDNFToggle(driver.id)}
                    />
                    <Label
                      htmlFor={`dnf-${driver.id}`}
                      className="text-sm"
                    >
                      {driver.code}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Submitting...' : existingBet ? 'Update Bet' : 'Place Bet'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Scoring System Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Base Scoring</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li><span className="font-medium">+25 points</span> - Correct Position</li>
                <li><span className="font-medium">+15 points</span> - One Position Off</li>
                <li><span className="font-medium">+10 points</span> - Two Positions Off</li>
                <li><span className="font-medium">+5 points</span> - Three Positions Off</li>
                <li><span className="font-medium">+2 points</span> - Driver in Top 10 but Wrong Spot</li>
                <li><span className="font-medium">-5 points</span> - Driver Not in Top 10 at All</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Bonus Points</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li><span className="font-medium">+30 points</span> - Perfect Podium (Top 3 in exact order)</li>
                <li><span className="font-medium">+50 points</span> - Perfect Top 5 (Exact Order)</li>
                <li><span className="font-medium">+100 points</span> - Perfect Top 10 (Exact Order)</li>
                <li><span className="font-medium">+20 points</span> - Correct Winner</li>
                <li><span className="font-medium">+10 points</span> - Fastest Lap Prediction</li>
                <li><span className="font-medium">+15 points</span> - Correct DNF Prediction</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
