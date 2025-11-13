namespace AdventOfCode.Solutions2023.Puzzles;

public class Day5Puzzle : Puzzle2023
{
    private class MapRecord
    {
        internal long SourceStart { get; set; }
        internal long DestStart { get; set; }
        internal long Length { get; set; }
    }
    
    private List<long> _seeds = new List<long>();
    private List<MapRecord> _seedToSoilMap = new List<MapRecord>();
    private List<MapRecord> _soilToFertilizerMap = new List<MapRecord>();
    private List<MapRecord> _fertilizerToWaterMap = new List<MapRecord>();
    private List<MapRecord> _waterToLightMap = new List<MapRecord>();
    private List<MapRecord> _lightToTempMap = new List<MapRecord>();
    private List<MapRecord> _tempToHumidityMap = new List<MapRecord>();
    private List<MapRecord> _humidityToLocationMap = new List<MapRecord>();
    
    public override object SolvePart1()
    {
        return 0;
        ParseInput();
        var minLocation = Int64.MaxValue;

        foreach (var seed in _seeds)
        {
            var soil = Map(_seedToSoilMap, seed);
            var fertilizer = Map(_soilToFertilizerMap, soil);
            var water = Map(_fertilizerToWaterMap, fertilizer);
            var light = Map(_waterToLightMap, water);
            var temperature = Map(_lightToTempMap, light);
            var humidity = Map(_tempToHumidityMap, temperature);
            var location = Map(_humidityToLocationMap, humidity);

            if (location < minLocation)
            {
                minLocation = location;
            }
        }
        
        return minLocation;
    }

    // public override object SolvePart2()
    // {
    //     ParseInput();
    //     var minLocation = Int64.MaxValue;
    //     var foundLocation = false;
    //     foreach (var locationMapRecord in _humidityToLocationMap.OrderBy(x => x.DestStart).ToArray())
    //     {
    //         if (!foundLocation)
    //         {
    //             for (var i = 0; i < locationMapRecord.Length; i++)
    //             {
    //                 var location = locationMapRecord.DestStart + i;
    //                 var humidity = FindMatchingSource(_humidityToLocationMap, location);
    //                 var temperature = FindMatchingSource(_tempToHumidityMap, humidity);
    //                 var light = FindMatchingSource(_lightToTempMap, temperature);
    //                 var water = FindMatchingSource(_waterToLightMap, light);
    //                 var fertilizer = FindMatchingSource(_fertilizerToWaterMap, water);
    //                 var soil = FindMatchingSource(_soilToFertilizerMap, fertilizer);
    //                 var seed = FindMatchingSource(_seedToSoilMap, soil);
    //
    //                 for (int j = 0; j < _seeds.Count; j += 2)
    //                 {
    //                     if (seed >= _seeds[j] && seed < _seeds[j] + _seeds[j + 1])
    //                     {
    //                         minLocation = location;
    //                         foundLocation = true;
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    //     var smallestSeed = _seeds[0];
    //     for (int i = 2; i < _seeds.Count; i += 2)
    //     {
    //         if (smallestSeed > _seeds[i])
    //         {
    //             smallestSeed = _seeds[i];
    //         }
    //     }
    //
    //     return minLocation;
    // }

    public override object SolvePart2()
    {
        ParseInput();
        var seedRanges = new List<(long, long)>();
        for (int i = 0; i < _seeds.Count; i += 2)
        {
            seedRanges.Add((_seeds[i], _seeds[i] + _seeds[i + 1] - 1));
        }
        
        return 0;
    }

    private List<(long, long)>MapRanges((long, long) range, List<MapRecord> map)
    {
        var mappedRanges = new List<(long, long)>();

        var i = range.Item1;
        while (i < range.Item2)
        {
            
        }
        
        return mappedRanges;
    }
    
    private long FindMatchingSource(List<MapRecord> map, long output)
    {
        foreach (var mapRecord in map)
        {
            if (output >= mapRecord.DestStart && output < mapRecord.DestStart + mapRecord.Length)
            {
                return output + (mapRecord.SourceStart - mapRecord.DestStart);
            }
        }
        
        return output;
    }
    
    private long Map(List<MapRecord> map, long input)
    {
        foreach (var mapRecord in map)
        {
            if (input >= mapRecord.SourceStart && input < mapRecord.SourceStart + mapRecord.Length)
            {
                return input - (mapRecord.SourceStart - mapRecord.DestStart);
            }
        }
        
        return input;
    }
    
    private void ParseInput()
    {
        _seeds = Input[0].Split("seeds: ")[1].Split(" ").Select(str => Int64.Parse(str)).ToList();

        var i = 3;
        while (Input[i] != "")
        {
            var numbers = Input[i].Split(" ").Select(str => Int64.Parse(str)).ToList();

            _seedToSoilMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }

        i += 2;
        while (Input[i] != "")
        {
            var numbers = Input[i].Split(" ").Select(str => Int64.Parse(str)).ToList();

            _soilToFertilizerMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }
        
        i += 2;
        while (Input[i] != "")
        {
            var numbers = Input[i].Split(" ").Select(str => Int64.Parse(str)).ToList();

            _fertilizerToWaterMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }
        
        i += 2;
        while (Input[i] != "")
        {
            var numbers = Input[i].Split(" ").Select(str => Int64.Parse(str)).ToList();

            _waterToLightMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }
        
        i += 2;
        while (Input[i] != "")
        {
            var numbers = Input[i].Split(" ").Select(str => Int64.Parse(str)).ToList();

            _lightToTempMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }
        
        i += 2;
        while (Input[i] != "")
        {
            var numbers = Input[i].Split(" ").Select(str =>Int64.Parse(str)).ToList();

            _tempToHumidityMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }
        
        i += 2;
        while (i < Input.Length)
        {
            var numbers = Input[i].Split(" ").Select(str => Int64.Parse(str)).ToList();

            _humidityToLocationMap.Add(new MapRecord()
            {
                DestStart = numbers[0],
                SourceStart = numbers[1],
                Length = numbers[2]
            });
            
            i++;
        }
    }
}