using System.Text.RegularExpressions;

namespace AdventOfCode.Solutions2023.Puzzles;

public class Day9Puzzle : Puzzle2023
{
    public override object SolvePart1()
    {
        var histories  = ParseInput();

        var result = 0;
        
        foreach(var history in histories)
        {
            var next = GetNextValue(history);
            result += next;
        }
        
        return result;
    }

    public override object SolvePart2()
    {
        var histories  = ParseInput();

        var result = 0;
        
        foreach(var history in histories)
        {
            var next = GetFirstValue(history);
            result += next;
        }
        
        return result;
    }
    
    private int GetNextValue(List<int> history)
    {
        var matrix = new List<List<int>>();

        matrix.Add(history);
        
        while (!matrix.Last().All(x => x == 0))
        {
            matrix.Add(new List<int>());
            var currentRow = matrix[matrix.Count - 1];
            var previousRow = matrix[matrix.Count - 2];
            for (int i = 1; i < previousRow.Count ; i++)
            {
                var d = previousRow[i] - previousRow[i - 1];
                currentRow.Add(d);
            }
        }

        var result = 0;
        for (int i = matrix.Count - 2; i >= 0; i--)
        {
            result += matrix[i].Last();
        }
        
        return result;
    }
    
    private int GetFirstValue(List<int> history)
    {
        var matrix = new List<List<int>>();

        matrix.Add(history);
        
        while (!matrix.Last().All(x => x == 0))
        {
            matrix.Add(new List<int>());
            var currentRow = matrix[matrix.Count - 1];
            var previousRow = matrix[matrix.Count - 2];
            for (int i = 1; i < previousRow.Count ; i++)
            {
                var d = previousRow[i] - previousRow[i - 1];
                currentRow.Add(d);
            }
        }

        for (int i = matrix.Count - 2; i >= 0; i--)
        {
            var currentRow = matrix[i];
            var nextRow = matrix[i + 1];

            var newCurrentRow = new List<int>()
            {
                currentRow.First() - nextRow.First()
            };
            newCurrentRow.AddRange(currentRow);

            matrix[i] = newCurrentRow;
        }
        
        var result = 0;
        for (int i = matrix.Count - 2; i >= 0; i--)
        {
            result += matrix[i].First();
        }
        
        return result;
    }

    private int GetFirstValue_old(List<int> history)
    {
        var matrix = new List<List<int>>();

        matrix.Add(history);
        
        while (!matrix.Last().All(x => x == 0))
        {
            matrix.Add(new List<int>());
            var currentRow = matrix[matrix.Count - 1];
            var previousRow = matrix[matrix.Count - 2];
            for (int i = 1; i < previousRow.Count ; i++)
            {
                var d = previousRow[i] - previousRow[i - 1];
                currentRow.Add(d);
            }
        }

        for (int i = matrix.Count - 2; i >= 0; i--)
        {
            var currentRow = matrix[i];
            var nextRow = matrix[i + 1];

            var newCurrentRow = new List<int>()
            {
                currentRow.First() - nextRow.First()
            };
            newCurrentRow.AddRange(currentRow);

            matrix[i] = newCurrentRow;
        }
        
        return matrix[0].First();
    }
    
    private List<List<int>> ParseInput()
    {
        var input = new List<List<int>>();

        foreach (var line in Input)
        {
            var history = line.Split(" ").Select(s => int.Parse(s)).ToList();
            
            input.Add(history);
        }
        
        return input;
    }
}