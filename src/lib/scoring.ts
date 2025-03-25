import { Bet, Result } from './db/schema';

export type PredictionPosition = {
  position: number;
  driverId: string;
};

export type Prediction = {
  positions: PredictionPosition[];
  fastestLap?: string;
  dnfs?: string[];
};

export type ScoringDetail = {
  type: string;
  points: number;
  description: string;
};

export type ScoringBreakdown = {
  totalScore: number;
  details: ScoringDetail[];
};

// Calculates the score for a bet based on the actual race results
export function calculateScore(
  prediction: Prediction,
  results: Result[], // Fixed the type here
  fastestLapDriverId?: string
): ScoringBreakdown {
  const details: ScoringDetail[] = [];
  let totalScore = 0;

  // Create a map of driverId to result position for easier lookup
  const resultPositions = new Map<string, number | null>();
  const resultDNFs = new Set<string>();
  const resultDriverIds = new Set<string>();

  results.forEach((result) => {
    resultPositions.set(result.driverId, result.position);
    resultDriverIds.add(result.driverId);

    if (result.dnf) {
      resultDNFs.add(result.driverId);
    }
  });

  // Score for driver positions
  prediction.positions.forEach((pred) => {
    const actualPosition = resultPositions.get(pred.driverId);

    // Driver not in results or DNF
    if (actualPosition === undefined) {
      details.push({
        type: 'position_miss',
        points: -5,
        description: `Driver not in top 10 at all: -5 points`
      });
      totalScore -= 5;
      return;
    }

    // Driver had a DNF
    if (actualPosition === null) {
      // We don't penalize for DNF predictions separately
      return;
    }

    const positionDifference = Math.abs(actualPosition - pred.position);

    if (positionDifference === 0) {
      // Exact position
      details.push({
        type: 'exact_position',
        points: 25,
        description: `Exact position match for position ${pred.position}: +25 points`
      });
      totalScore += 25;
    } else if (positionDifference === 1) {
      // One position off
      details.push({
        type: 'off_by_one',
        points: 15,
        description: `One position off for position ${pred.position}: +15 points`
      });
      totalScore += 15;
    } else if (positionDifference === 2) {
      // Two positions off
      details.push({
        type: 'off_by_two',
        points: 10,
        description: `Two positions off for position ${pred.position}: +10 points`
      });
      totalScore += 10;
    } else if (positionDifference === 3) {
      // Three positions off
      details.push({
        type: 'off_by_three',
        points: 5,
        description: `Three positions off for position ${pred.position}: +5 points`
      });
      totalScore += 5;
    } else if (actualPosition <= 10) {
      // Driver in top 10 but wrong spot
      details.push({
        type: 'in_top_ten',
        points: 2,
        description: `Driver in top 10 but wrong spot: +2 points`
      });
      totalScore += 2;
    }
  });

  // Bonus for correct podium
  const predictedPodium = prediction.positions
    .filter((p) => p.position <= 3)
    .sort((a, b) => a.position - b.position);

  const actualPodium = Array.from(results)
    .filter((r) => r.position !== null && r.position <= 3)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  if (predictedPodium.length === 3 && actualPodium.length === 3) {
    const podiumCorrect = predictedPodium.every((pred, index) =>
      pred.driverId === actualPodium[index].driverId
    );

    if (podiumCorrect) {
      details.push({
        type: 'perfect_podium',
        points: 30,
        description: 'Perfect podium prediction: +30 points'
      });
      totalScore += 30;
    }
  }

  // Bonus for correct top 5
  const predictedTop5 = prediction.positions
    .filter((p) => p.position <= 5)
    .sort((a, b) => a.position - b.position);

  const actualTop5 = Array.from(results)
    .filter((r) => r.position !== null && r.position <= 5)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  if (predictedTop5.length === 5 && actualTop5.length === 5) {
    const top5Correct = predictedTop5.every((pred, index) =>
      pred.driverId === actualTop5[index].driverId
    );

    if (top5Correct) {
      details.push({
        type: 'perfect_top_5',
        points: 50,
        description: 'Perfect top 5 prediction: +50 points'
      });
      totalScore += 50;
    }
  }

  // Bonus for correct top 10
  const predictedTop10 = prediction.positions
    .filter((p) => p.position <= 10)
    .sort((a, b) => a.position - b.position);

  const actualTop10 = Array.from(results)
    .filter((r) => r.position !== null && r.position <= 10)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  if (predictedTop10.length === 10 && actualTop10.length === 10) {
    const top10Correct = predictedTop10.every((pred, index) =>
      pred.driverId === actualTop10[index].driverId
    );

    if (top10Correct) {
      details.push({
        type: 'perfect_top_10',
        points: 100,
        description: 'Perfect top 10 prediction: +100 points'
      });
      totalScore += 100;
    }
  }

  // Bonus for correct winner
  const predictedWinner = prediction.positions.find((p) => p.position === 1);
  const actualWinner = Array.from(results).find((r) => r.position === 1);

  if (predictedWinner && actualWinner && predictedWinner.driverId === actualWinner.driverId) {
    details.push({
      type: 'correct_winner',
      points: 20,
      description: 'Correct race winner: +20 points'
    });
    totalScore += 20;
  }

  // Bonus for correct fastest lap
  if (prediction.fastestLap && prediction.fastestLap === fastestLapDriverId) {
    details.push({
      type: 'fastest_lap',
      points: 10,
      description: 'Correct fastest lap prediction: +10 points'
    });
    totalScore += 10;
  }

  // Bonus for correct DNF predictions
  if (prediction.dnfs && prediction.dnfs.length > 0) {
    prediction.dnfs.forEach((driverId) => {
      if (resultDNFs.has(driverId)) {
        details.push({
          type: 'correct_dnf',
          points: 15,
          description: `Correct DNF prediction: +15 points`
        });
        totalScore += 15;
      }
    });
  }

  return {
    totalScore,
    details
  };
}
