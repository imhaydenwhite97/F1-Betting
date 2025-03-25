"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function DbInitializer() {
  const [initializing, setInitializing] = useState(false);
  const [success, setSuccess] = useState(false);

  const initializeDatabase = async () => {
    setInitializing(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/db-init', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Database initialized successfully!');
        setSuccess(true);
        // Reload to show new data
        window.location.reload();
      } else {
        const data = await response.json();
        toast.error(`Failed to initialize database: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Card className="mb-6 border-dashed border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle>Database Initialization</CardTitle>
        <CardDescription>
          Initialize the database with sample F1 drivers and races
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          <strong>Welcome to the F1 Fantasy Betting app!</strong> To get started, you'll need to initialize the database first.
          This creates all the necessary tables and adds sample F1 drivers and races.
        </p>
        <p className="text-sm mb-4">
          Once initialized, you can:
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Browse upcoming and past races</li>
            <li>Sign in to place bets (any name and email will work)</li>
            <li>Predict race results with our drag-and-drop interface</li>
            <li>View your scores after races are completed</li>
          </ul>
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={initializeDatabase}
          disabled={initializing || success}
          variant={success ? "outline" : "default"}
        >
          {initializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : success ? (
            'Database Initialized'
          ) : (
            'Initialize Database'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
