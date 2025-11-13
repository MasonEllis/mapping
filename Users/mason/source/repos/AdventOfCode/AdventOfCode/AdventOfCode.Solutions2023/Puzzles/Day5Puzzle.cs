using System.Security.Cryptography.X509Certificates;
using Microsoft.VisualBasic;

namespace AdventOfCode.Solutions2023.Puzzles;

public class Day3Puzzle : Puzzle2023
{
    public override object SolvePart1()
    {
        var result = 0;
        var digits = "";
        var numberLocations = new List<(int, List<(int, int)>)>();
        var symbolLocations = new List<(int, int)>();
        var locations = new List<(int, int)>();
        for (int i = 0; i < Input.Length; i++)
        {
            for (int j = 0; j < Input[0].Length; j++)
            {
                if (!char.IsDigit(Input[i][j]) && Input[i][j] != '.')
                {
                    symbolLocations.Add((i, j));
                }
                while (i < Input.Length && j < Input[0].Length && char.IsDigit(Input[i][j]))
                {
                    if (locations.Count == 0)
                    {
                        locations = new List<(int, int)>
                        {
                            (i, j)
                        };
                    }
                    else
                    {
                        locations.Add((i, j));
                    }
                    digits += Input[i][j];
                    j++;
                }

                if (digits != "")
                {
                    var n = Int32.Parse(digits);
                    numberLocations.Add((n, locations));
                    digits = "";
                    locations = new List<(int, int)>();
                }
            }
        }


        foreach (var numberLocation in numberLocations)
        {
            foreach (var location in numberLocation.Item2)
            {
                foreach (var symbolLocation in symbolLocations)
                {
                    if (isAdjacent(location.Item1, location.Item2, symbolLocation.Item1, symbolLocation.Item2))
                    {
                        break;
                    }
                }
            }
        }
        
        return result;
    }

    public override object SolvePart2()
    {
        long result = 0;
        var numberLocations = new List<(int, List<(int, int)>)>();
        var gearLocations = new List<(int, int)>();
        var digits = "";
        var locations = new List<(int, int)>();
        for (int i = 0; i < Input.Length; i++)
        {
            for (int j = 0; j < Input[0].Length; j++)
            {
                while (i < Input.Length && j < Input[0].Length && char.IsDigit(Input[i][j]))
                {
                    if (locations.Count == 0)
                    {
                        locations = new List<(int, int)>
                        {
                            (i, j)
                        };
                    }
                    else
                    {
                        locations.Add((i, j));
                    }
                    digits += Input[i][j];
                    j++;
                }

                if (digits != "")
                {
                    var n = Int32.Parse(digits);
                    numberLocations.Add((n, locations));
                    digits = "";
                    locations = new List<(int, int)>();
                }
            }
        }
        
        for (int i = 0; i < Input.Length; i++)
        {
            for (int j = 0; j < Input[0].Length; j++)
            {
                if (Input[i][j] == '*')
                {
                    gearLocations.Add((i, j));
                }
            }
        }

        foreach (var gearLocation in gearLocations)
        {
            var adjacentCount = 0;
            long power = 1;
            foreach (var numberLocation in numberLocations)
            {
                foreach (var location in numberLocation.Item2)
                {
                    if (isAdjacent(gearLocation.Item1, gearLocation.Item2, location.Item1, location.Item2))
                    {
                        power *= numberLocation.Item1;
                        adjacentCount++;
                        break;
                    }
                }
            }

            if (adjacentCount == 2)
            {
                result += power;
            }
        }
        
        
        return result;
    }

    private bool isAdjacentToSymbol(int i, int j, string[] input)
    {
        var adjacentLocations = new List<(int, int)>
        {
            (i - 1, j - 1),
            (i - 1, j),
            (i - 1, j + 1),
            (i, j - 1),
            (i, j + 1),
            (i + 1, j - 1),
            (i + 1, j),
            (i + 1, j + 1),
        };
        adjacentLocations = adjacentLocations.Where(location => 
            location.Item1 >= 0
            && location.Item1 < input.Length
            && location.Item2 >= 0
            && location.Item2 < input[0].Length).ToList();

        foreach (var location in adjacentLocations)
        {
            if (isSymbol(input[location.Item1][location.Item2]))
            {
                return true;
            }
        }
        
        return false;
    }

    private bool isAdjacent(int x1, int y1, int x2, int y2)
    {
        var adjacentLocations = new List<(int, int)>
        {
            (x1 - 1, y1 - 1),
            (x1 - 1, y1),
            (x1 - 1, y1 + 1),
            (x1, y1 - 1),
            (x1, y1 + 1),
            (x1 + 1, y1 - 1),
            (x1 + 1, y1),
            (x1 + 1, y1 + 1),
        };

        if (adjacentLocations.Contains((x2, y2)))
        {
            return true;
        }
        
        return false;
    }
    
    private bool isSymbol(char ch)
    {
        if (char.IsDigit(ch) || ch == '.')
        {
            return false;
        }

        return true;
    }
}