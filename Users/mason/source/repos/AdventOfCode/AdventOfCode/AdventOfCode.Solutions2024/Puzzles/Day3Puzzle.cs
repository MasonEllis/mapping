namespace AdventOfCode.Solutions2024.Puzzles;

public class Day2Puzzle : Puzzle2024
{
    public override object SolvePart1()
    {
        var safeReportCount = 0;

        foreach (var line in Input)
        {
            var report = line.Split(" ").Select(s => Int32.Parse(s)).ToList();

            var isSafe = IsSafe(report);
            if (isSafe)
            {
                safeReportCount++;
            }
        }

        return safeReportCount;
    }

    public override object SolvePart2()
    {
        var safeReportCount = 0;

        foreach (var line in Input)
        {
            var report = line.Split(" ").Select(s => Int32.Parse(s)).ToList();

            var isSafe = IsSafe(report);
            if (isSafe)
            {
                safeReportCount++;
                continue;
            }

            for (var i = 0; i < report.Count; i++)
            {
                var tmpReport = new int[report.Count];
                report.CopyTo(tmpReport);
                var tmpReportList = tmpReport.ToList();
                tmpReportList.RemoveAt(i);
                
                isSafe = IsSafe(tmpReportList);
                if (isSafe)
                {
                    safeReportCount++;
                    break;
                }
            }
        }

        return safeReportCount;
    }

    private bool IsSafe(List<int> report)
    {
        var isDecreasing = report[0] > report[1];
        for (var i = 0; i < report.Count - 1; i++)
        {
            if (isDecreasing && report[i] < report[i + 1])
            {
                return false;
            } 
            if (!isDecreasing && report[i] > report[i + 1])
            {
                return false;
            }

            var distance = Math.Abs(report[i] - report[i + 1]);
            if (distance < 1 || distance > 3)
            {
                return false;
            }
        }

        return true;
    }
}
    