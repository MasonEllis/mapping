namespace AdventOfCode.Solutions2023.Puzzles;

public class Day1Puzzle : Puzzle2023
{
    private Dictionary<string, short> _digitMap = new Dictionary<string, short>()
    {
        {"one", 1},
        {"two", 2},
        {"three", 3},
        {"four", 4},
        {"five", 5},
        {"six", 6},
        {"seven", 7},
        {"eight", 8},
        {"nine", 9},
    };
    
    public override object SolvePart1()
    {
        var result = 0;
        foreach (var line in Input)
        {
            var digits = line
                .Where(ch => char.IsDigit(ch))
                .Select(ch => int.Parse(ch.ToString()))
                .ToArray();

            result += digits.First() * 10 + digits.Last();
        }

        return result;
    }

    public override object SolvePart2()
    {
        var result = 0;
        foreach(var line in Input)
        {
            var firstDigit = FindFirstDigit(line);
            var lastDigit = FindLastDigit(line);

            result += firstDigit * 10 + lastDigit;
        }
        
        return result;
    }
    
    private short FindFirstDigit(string line)
    {
        for (int i = 0; i < line.Length; i++)
        {
            if (char.IsDigit(line[i]))
            {
                return short.Parse(line[i].ToString());
            }

            var subString = line.Substring(i);
            foreach(var (digitString, digit) in _digitMap)
            {
                if (subString.StartsWith(digitString))
                {
                    return digit;
                }
            }
        }
        
        return 0;
    }

    private short FindLastDigit(string line)
    {
        for (int i = line.Length - 1; i >= 0; i--)
        {
            if (char.IsDigit(line[i]))
            {
                return short.Parse(line[i].ToString());
            }

            foreach(var (digitString, digit) in _digitMap)
            {
                var subStringLen = Math.Max(0, i - digitString.Length + 1);
                var subString = line.Substring(subStringLen);
                if (subString.StartsWith(digitString))
                {
                    return digit;
                }
            }
        }
        
        return 0;
    }
}
    