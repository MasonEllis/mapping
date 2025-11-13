namespace AdventOfCode.Solutions2023.Puzzles;

public class Day8Puzzle : Puzzle2023
{
    public override object SolvePart1()
    {
        return 0;
    }

    public override object SolvePart2()
    {
        var hands = ParseInput();
        
        foreach (var hand in hands)
        {
            hand.Type = GetHandType2(hand);
        }
        
        hands.Sort(new HandComparer());
        
        var totalWinnings = 0;

        for (int i = 0; i < hands.Count; i++)
        {
            var index = i + 1;
            var bid = hands[i].Bid;
            var winnings = index * bid;
            
            totalWinnings += winnings;
        }
        
        return totalWinnings;
        return 0;
    }

    private HandType GetHandType(Hand hand)
    {
        var cardCounts = new Dictionary<char, short>();

        foreach (var ch in hand.Cards)
        {
            if (cardCounts.ContainsKey(ch))
            {
                cardCounts[ch]++;
            }
            else
            {
                cardCounts.Add(ch, 1);
            }
        }

        if (cardCounts.Any(kvp => kvp.Value == 5))
        {
            return HandType.FiveOfAKind;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 4))
        {
            return HandType.FourOfAKind;
        }

        var pairCount = cardCounts.Count(kvp => kvp.Value == 2);
        
        if (cardCounts.Any(kvp => kvp.Value == 3))
        {
            if (pairCount == 1)
            {
                return HandType.FullHouse;
            }
            
            return HandType.ThreeOfAKind;
        }

        if (pairCount == 2)
        {
            return HandType.TwoPair;
        }

        if (pairCount == 1)
        {
            return HandType.OnePair;
        }

        return HandType.HighCard;
    }

    private HandType GetHandType2(Hand hand)
    {
        var cardCounts = new Dictionary<char, short>();
        
        cardCounts.Add('J', 0);

        foreach (var ch in hand.Cards)
        {
            if (cardCounts.ContainsKey(ch))
            {
                cardCounts[ch]++;
            }
            else
            {
                cardCounts.Add(ch, 1);
            }
        }

        if (cardCounts.Any(kvp => kvp.Value == 5))
        {
            return HandType.FiveOfAKind;
        }

        if (cardCounts.Any(kvp => kvp.Value == 4) && cardCounts['J'] == 1)
        {
            return HandType.FiveOfAKind;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 3) && cardCounts['J'] == 2)
        {
            return HandType.FiveOfAKind;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 2) && cardCounts['J'] == 3)
        {
            return HandType.FiveOfAKind;
        }
        
        if (cardCounts['J'] == 4)
        {
            return HandType.FiveOfAKind;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 4))
        {
            return HandType.FourOfAKind;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 3) && cardCounts['J'] == 1)
        {
            return HandType.FourOfAKind;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 2 && kvp.Key != 'J') && cardCounts['J'] == 2)
        {
            return HandType.FourOfAKind;
        }
        
        if (cardCounts['J'] == 3)
        {
            return HandType.FourOfAKind;
        }

        var pairCount = cardCounts.Count(kvp => kvp.Value == 2);

        if (pairCount == 2 && cardCounts['J'] == 1)
        {
            return HandType.FullHouse;
        }
        
        //2 Pairs and one is a pair of jokers
        if (pairCount == 2 && cardCounts['J'] == 2)
        {
            return HandType.FullHouse;
        }
        
        if (cardCounts.Any(kvp => kvp.Value == 3))
        {
            if (pairCount == 1)
            {
                return HandType.FullHouse;
            }

            if (cardCounts['J'] == 1)
            {
                return HandType.FullHouse;
            }
            
            return HandType.ThreeOfAKind;
        }

        if (pairCount == 1 && cardCounts['J'] == 1)
        {
            return HandType.ThreeOfAKind;
        }
        
        if (cardCounts['J'] == 2)
        {
            return HandType.ThreeOfAKind;
        }
        
        if (pairCount == 2)
        {
            return HandType.TwoPair;
        }

        if (pairCount == 1)
        {
            return HandType.OnePair;
        }

        if (cardCounts['J'] == 1)
        {
            return HandType.OnePair;
        }
        
        return HandType.HighCard;
    }
    
    private List<Hand> ParseInput()
    {
        var hands = new List<Hand>();

        foreach (var line in Input)
        {
            var tokens = line.Split(" ");
            var cards = tokens[0];
            var bid = int.Parse(tokens[1]);
            hands.Add(new Hand
            {
                Cards = cards,
                Bid = bid,
            });
        }
        
        return hands;
    }
}