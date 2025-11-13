using System.Text.RegularExpressions;

namespace AdventOfCode.Solutions2023.Puzzles;

public class Day6Puzzle : Puzzle2023
{
    public override object SolvePart1()
    {
        var result = 1;
        var input = ParseInput();

        foreach (var race in input)
        {
            var time = race.Item1;
            var record = race.Item2;
            var count = 0;  

            for (var buttonPressDuration = 1; buttonPressDuration < time; buttonPressDuration++)
            {
                var distance = buttonPressDuration * (time - buttonPressDuration);
                if (distance > record)
                {
                    count++;
                }
            }

            result *= count;
        }
        
        return result;
    }

    public override object SolvePart2()
    {
        var (time, distanceRecord) = ParseInput2();
        
        var count = 0;  

        for (var buttonPressDuration = 1; buttonPressDuration < time; buttonPressDuration++)
        {
            var distance = buttonPressDuration * (time - buttonPressDuration);
            if (distance > distanceRecord)
            {
                count++;
            }
        }
        
        return count;
    }

    private List<(int, int)> ParseInput()
    {
        var input = new List<(int, int)>();

        var line1Numbers = Input[0].Split(" ").Where(x => x != "" && x != " " && !x.Contains(":")).Select(x => int.Parse(x)).ToArray();
        var line2Numbers = Input[1].Split(" ").Where(x => x != "" && x != " " && !x.Contains(":")).Select(x => int.Parse(x)).ToArray();

        for (int i = 0; i < line1Numbers.Length; i++)
        {
            input.Add((line1Numbers[i], line2Numbers[i]));
        }
        
        return input;
    }
    
    private (long, long) ParseInput2()
    {
        var time = long.Parse(new String(Input[0].ToCharArray().Where(ch => char.IsDigit(ch)).ToArray()));
        var distance = long.Parse(new String(Input[1].ToCharArray().Where(ch => char.IsDigit(ch)).ToArray()));

        return (time, distance);
    }
}