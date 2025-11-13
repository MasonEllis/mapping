using System.Text.RegularExpressions;

namespace AdventOfCode.Solutions2023.Puzzles;

public class Day8Puzzle : Puzzle2023
{
    public override object SolvePart1()
    {
        return 0;
        var (instructions, map) = ParseInput();

        var steps = 0;
        var currentLocation = "AAA";

        while (currentLocation != "ZZZ")
        {
            var instruction = instructions[steps % instructions.Length];
            if (instruction == 'L')
            {
                currentLocation = map[currentLocation].Item1;
            }
            else
            {
                currentLocation = map[currentLocation].Item2;
            }
            
            steps++;
        }
        
        return steps;
    }

    //public object SolvePart2_Brute()
    /*{
        var (instructions, map) = ParseInput();
        var steps = 0;

        var currentNodes = map.Keys.Where(key => key.EndsWith("A")).ToList();

        while (!currentNodes.All(node => node.EndsWith("Z")))
        {
            var nextNodes = new List<string>();
            var instruction = instructions[steps % instructions.Length];
            foreach (var node in currentNodes)
            {
                if (instruction == 'L')
                {
                    nextNodes.Add(map[node].Item1);
                }
                else
                {
                    nextNodes.Add(map[node].Item2);
                }

                currentNodes = nextNodes;
            }
            
            steps++;
        }
        
        return steps;
    }*/
    
    public override object SolvePart2()
    {
        var (instructions, map) = ParseInput();

        var startingNodes = map.Keys.Where(key => key.EndsWith("A")).ToList();

        var zStep = new Dictionary<string, int>();
        
        foreach (var node in startingNodes)
        {
            var steps = 0;
            var currentLocation = node;
            while (!currentLocation.EndsWith("Z"))
            {
                var instruction = instructions[steps % instructions.Length];
                if (instruction == 'L')
                {
                    currentLocation = map[currentLocation].Item1;
                }
                else
                {
                    currentLocation = map[currentLocation].Item2;
                }
            
                steps++;
            }
            
            zStep.Add(node, steps);
        }

        var result = FindLeastCommonMultiple(zStep.Values.ToArray());
        
        return result;
    }

    static long FindLeastCommonMultiple(int[] numbers)
    {
        if (numbers == null || numbers.Length == 0)
        {
            throw new ArgumentException("Array should not be null or empty.");
        }

        long lcm = numbers[0];

        for (int i = 1; i < numbers.Length; i++)
        {
            lcm = CalculateLCM(lcm, numbers[i]);
        }

        return lcm;
    }

    static long CalculateLCM(long a, long b)
    {
        return (a / CalculateGCD(a, b)) * b;
    }

    static long CalculateGCD(long a, long b)
    {
        while (b != 0)
        {
            long temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
    
    private (string, Dictionary<string, (string, string)>) ParseInput()
    {
        var instructions = Input[0];
        var map = new Dictionary<string, (string, string)>();

        for (int i = 2; i < Input.Length; i++)
        {
            var line = Input[i];
            var pattern = "[0-9A-Z]{3}";
            var tokens = Regex.Matches(line, pattern).Select(match => match.Value).ToArray();
            
            map.Add(tokens[0], (tokens[1], tokens[2]));
        }
        
        return (instructions, map);
    }
}