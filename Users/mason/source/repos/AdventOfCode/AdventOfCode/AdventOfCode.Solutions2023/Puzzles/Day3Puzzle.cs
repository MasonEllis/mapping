using Microsoft.VisualBasic;

namespace AdventOfCode.Solutions2023.Puzzles;

public class Day2Puzzle : Puzzle2023
{
    private enum Color
    {
        Red,Blue,Green,Undefined
    }
    
    private class Game
    {
        internal int Id;
        internal List<List<(int, Color)>> Rounds;

        internal Game()
        {
            Rounds = new List<List<(int, Color)>>();
        }
    }

    public override object SolvePart1()
    {
        const int maxRed = 12, maxGreen = 13, maxBlue = 14;
        
        var games = ParseInput();

        var result = 0;
        
        foreach (var game in games)
        {
            var validGame = true;
            foreach (var round in game.Rounds)
            {
                foreach (var turn in round)
                {
                    if (turn.Item2 == Color.Red && turn.Item1 > maxRed)
                    {
                        validGame = false;
                        break;
                    }
                    if (turn.Item2 == Color.Blue && turn.Item1 > maxBlue)
                    {
                        validGame = false;
                        break;
                    }
                    if (turn.Item2 == Color.Green && turn.Item1 > maxGreen)
                    {
                        validGame = false;
                        break;
                    }
                }
            }

            if (validGame)
            {
                result += game.Id;
            }
        }
        
        return result;
    }

    public override object SolvePart2()
    {
        var games = ParseInput();

        var totalPower = 0;
        
        foreach (var game in games)
        {
            var (minRed, minGreen, minBlue) = (0, 0, 0);
            foreach (var round in game.Rounds)
            {
                foreach (var turn in round)
                {
                    if (turn.Item2 == Color.Red)
                    {
                        if (turn.Item1 > minRed)
                        {
                            minRed = turn.Item1;
                        }
                    }
                    if (turn.Item2 == Color.Blue)
                    {
                        if (turn.Item1 > minBlue)
                        {
                            minBlue = turn.Item1;
                        }
                    }
                    if (turn.Item2 == Color.Green)
                    {
                        if (turn.Item1 > minGreen)
                        {
                            minGreen = turn.Item1;
                        }
                    }
                }
            }

            var power = minRed * minBlue * minGreen;
            
            totalPower += power;
        }
        
        return totalPower;
    }

    private List<Game> ParseInput()
    {
        var games = new List<Game>();

        foreach (var line in Input)
        {
            var game = new Game();
            var tokens = line.Split(" ");
            game.Id = Int32.Parse(tokens[1].Split(":")[0]);

            var round = new List<(int, Color)>();

            for (int i = 2; i < tokens.Length; i += 2)
            {
                var n = Int32.Parse(tokens[i]);
                Color color = Color.Undefined;

                if (tokens[i + 1].StartsWith("blue"))
                {
                    color = Color.Blue;
                }
                else if (tokens[i + 1].StartsWith("red"))
                {
                    color = Color.Red;
                }
                else if (tokens[i + 1].StartsWith("green"))
                {
                    color = Color.Green;
                }
                
                round.Add((n, color));
                
                if (!tokens[i + 1].EndsWith(","))
                {
                    game.Rounds.Add(round);
                    round = new List<(int, Color)>();
                }
            }
            
            games.Add(game);
        }
        
        return games;
    }
}