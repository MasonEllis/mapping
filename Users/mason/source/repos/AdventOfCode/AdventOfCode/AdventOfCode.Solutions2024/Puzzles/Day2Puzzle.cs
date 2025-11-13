namespace AdventOfCode.Solutions2024.Puzzles;

public class Day1Puzzle : Puzzle2024
{
    public override object SolvePart1()
    {
        var list1 = new List<int>();
        var list2 = new List<int>();
        
        foreach (var line in Input)
        {
            var tokens = line.Split(" ");
            var x = Int32.Parse(tokens[0]);
            var y = Int32.Parse(tokens.Last());

            list1.Add(x);
            list2.Add(y);
        }
        
        list1.Sort();
        list2.Sort();

        var totalDistance = 0;
        for (var i = 0; i < list1.Count; i++)
        {
            var distance = Math.Abs(list1[i] - list2[i]);
            totalDistance += distance;
        }
        
        return totalDistance;
    }

    public override object SolvePart2()
    {
        var list1 = new List<int>();
        var list2 = new List<int>();
        
        foreach (var line in Input)
        {
            var tokens = line.Split(" ");
            var x = Int32.Parse(tokens[0]);
            var y = Int32.Parse(tokens.Last());

            list1.Add(x);
            list2.Add(y);
        }
        
        list1.Sort();
        list2.Sort();

        var totalScore = 0;
        for (var i = 0; i < list1.Count; i++)
        {
            var score = list1[i] * list2.Count(x => x == list1[i]);
            totalScore += score;
        }
        
        return totalScore;
    }
}
    