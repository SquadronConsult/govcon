import { EventCard } from '@/types/game';

// A. Positive Boosts (15 cards)
const POSITIVE_CARDS: EventCard[] = [
    {
        id: 1,
        title: "Issued a GSA MAS Mod in < 30 days!",
        effect: "Advance +5 spaces and ignore the next schedule-slip card.",
        category: 'positive',
        cardType: 'immediate',
        moveSpaces: 5,
        immunities: ['schedule-slip']
    },
    {
        id: 2,
        title: "Congressional Add-On",
        effect: "Gain 1 Program Funding token; keep it.",
        category: 'positive',
        cardType: 'immediate',
        keepCard: true
    },
    {
        id: 3,
        title: "Signed a CRADA with a National Lab",
        effect: "Roll 1d6; move ahead that many spaces and draw again if 4-6.",
        category: 'positive',
        cardType: 'immediate'
    },
    {
        id: 4,
        title: "OT Authority \"Prototype\" Approved",
        effect: "Take an extra turn immediately.",
        category: 'positive',
        cardType: 'immediate'
    },
    {
        id: 5,
        title: "Won an SBIR Phase III without protest",
        effect: "Jump to the next mountain summit square.",
        category: 'positive',
        cardType: 'immediate'
    },
    {
        id: 6,
        title: "Class Deviation Granted",
        effect: "Cancel any one FAR/DFARS penalty in play.",
        category: 'positive',
        cardType: 'immediate'
    },
    {
        id: 7,
        title: "PEO Champion Discovered at Industry Day",
        effect: "Keep; Play later to negate a Lost Stakeholder penalty.",
        category: 'positive',
        cardType: 'reaction',
        playTiming: 'on_negative_card',
        keepCard: true
    },
    {
        id: 8,
        title: "Received an \"Excellent\" CPARS",
        effect: "Move +3 and force one opponent to move –3.",
        category: 'positive',
        cardType: 'immediate',
        moveSpaces: 3,
        targetPlayer: 'opponent'
    },
    {
        id: 9,
        title: "Prime Contractor Fails Sublimit; You Slide In",
        effect: "Swap positions with any player ahead.",
        category: 'positive',
        cardType: 'choice',
        targetPlayer: 'opponent'
    },
    {
        id: 10,
        title: "Congress Passes a Full-Year Appropriation!",
        effect: "Every player may remove one active Continuing Resolution penalty.",
        category: 'positive',
        cardType: 'immediate',
        targetPlayer: 'all'
    },
    {
        id: 11,
        title: "Rapid Innovation Fund Surprise Award",
        effect: "Draw two cards, keep one, discard the other.",
        category: 'positive',
        cardType: 'choice'
    },
    {
        id: 12,
        title: "Stemmed a GAO Protest in < 100 days",
        effect: "If you were skipping turns, resume play now.",
        category: 'positive',
        cardType: 'immediate'
    },
    {
        id: 13,
        title: "OTA Consortium Waives Membership Fee",
        effect: "Next time you'd lose a token, lose none instead.",
        category: 'positive',
        cardType: 'persistent'
    },
    {
        id: 14,
        title: "Cyber Reciprocity MOU Signed",
        effect: "You are immune to single-agency cybersecurity penalties for the rest of the game.",
        category: 'positive',
        cardType: 'persistent',
        immunities: ['cybersecurity']
    },
    {
        id: 15,
        title: "Defense Production Act Title III Funding",
        effect: "Leap over one valley tile of your choice this turn.",
        category: 'positive',
        cardType: 'immediate'
    }
];

// B. Valley Penalties (25 cards)
const NEGATIVE_CARDS: EventCard[] = [
    {
        id: 16,
        title: "Continuing Resolution (Again)",
        effect: "Skip 2 turns.",
        category: 'negative',
        cardType: 'persistent',
        skipTurns: 2
    },
    {
        id: 17,
        title: "Bid Protest Filed at the Last Minute",
        effect: "Move back 4 and miss your next roll.",
        category: 'negative',
        cardType: 'immediate',
        moveSpaces: -4,
        skipTurns: 1
    },
    {
        id: 18,
        title: "Color-Team Review Reveals \"Pink\"",
        effect: "Discard one positive card; if none, move back 3.",
        category: 'negative',
        cardType: 'choice'
    },
    {
        id: 19,
        title: "DCMA Rejects Your Manufacturing Plan",
        effect: "Skip 3 turns to close CARs.",
        category: 'negative',
        cardType: 'persistent',
        skipTurns: 3
    },
    {
        id: 20,
        title: "Earned Value Overrun Detected",
        effect: "Pay 1 token or retreat to the previous summit.",
        category: 'negative',
        cardType: 'choice',
        tokenCost: 1
    },
    {
        id: 21,
        title: "NDAA §889 Supply-Chain Violation",
        effect: "Until fixed (draw Supply-Chain Fix positive), you may advance only on even dice.",
        category: 'negative',
        cardType: 'persistent',
        diceModifier: {
            type: 'even_only',
            duration: -1,
            fixCondition: 'Supply-Chain Fix'
        }
    },
    {
        id: 22,
        title: "Interim DFARS Clause Issued Friday at 1700",
        effect: "Roll 1d6: 1-3 skip 1 turn, 4-6 discard a positive card.",
        category: 'negative',
        cardType: 'choice'
    },
    {
        id: 23,
        title: "Small-Business Size Protest Upheld",
        effect: "Re-categorised as large — move back 6.",
        category: 'negative',
        cardType: 'immediate',
        moveSpaces: -6
    },
    {
        id: 24,
        title: "Overzealous Section 508 Reviewer",
        effect: "Lose a turn and discard any IT-related positive card.",
        category: 'negative',
        cardType: 'immediate',
        skipTurns: 1
    },
    {
        id: 25,
        title: "Insufficient IR&D Tracking",
        effect: "Lose your next roll entirely.",
        category: 'negative',
        cardType: 'persistent',
        skipTurns: 1
    },
    {
        id: 26,
        title: "CMMC 3.1 \"Drop-In\" Audit",
        effect: "Skip 2 turns and move back 2.",
        category: 'negative',
        cardType: 'immediate',
        skipTurns: 2,
        moveSpaces: -2
    },
    {
        id: 27,
        title: "Program Manager PCS'd with No Handoff",
        effect: "Until you draw New Stakeholder, roll 1d4 instead of 1d6.",
        category: 'negative',
        cardType: 'persistent',
        diceModifier: {
            type: 'use_d4',
            duration: -1,
            fixCondition: 'New Stakeholder'
        }
    },
    {
        id: 28,
        title: "Section 3610 Reimbursement Denied",
        effect: "Pay 1 token or fall to the nearest valley floor.",
        category: 'negative',
        cardType: 'choice',
        tokenCost: 1
    },
    {
        id: 29,
        title: "Congressional Inquiry into Subcontracting Plan",
        effect: "All opponents move +2 while you skip 1 turn.",
        category: 'negative',
        cardType: 'immediate',
        skipTurns: 1,
        targetPlayer: 'opponent'
    },
    {
        id: 30,
        title: "Misaligned Fiscal-Year Funds",
        effect: "Swap positions with the player directly behind you.",
        category: 'negative',
        cardType: 'immediate',
        targetPlayer: 'opponent'
    },
    {
        id: 31,
        title: "DIB-CAC Breach — Account Locked",
        effect: "Miss your next two turns.",
        category: 'negative',
        cardType: 'persistent',
        skipTurns: 2
    },
    {
        id: 32,
        title: "SAM Registration Lapses",
        effect: "You cannot collect positive cards until you reach the next checkpoint (20, 40, 60, 80).",
        category: 'negative',
        cardType: 'persistent'
    },
    {
        id: 33,
        title: "Earned a \"Marginal\" CPARS",
        effect: "Roll 1d6; move back that many spaces.",
        category: 'negative',
        cardType: 'immediate'
    },
    {
        id: 34,
        title: "FOIA Lawsuit Drags On",
        effect: "Pay 1 token and miss 1 turn or move back 8.",
        category: 'negative',
        cardType: 'choice',
        tokenCost: 1
    },
    {
        id: 35,
        title: "Multi-Year Contract Axed in Budget Drill",
        effect: "Return to the start of the current mountain.",
        category: 'negative',
        cardType: 'immediate'
    },
    {
        id: 36,
        title: "OMB Passback Cuts Your RDT&E Line",
        effect: "Discard two positive cards; if you have fewer, skip 2 turns.",
        category: 'negative',
        cardType: 'choice'
    },
    {
        id: 37,
        title: "ATO Package Returned for 'Minor Edits'",
        effect: "Skip 1 turn—paperwork only.",
        category: 'negative',
        cardType: 'persistent',
        skipTurns: 1
    },
    {
        id: 38,
        title: "ESOH Nightmare",
        effect: "Move back to the last space occupied by another player.",
        category: 'negative',
        cardType: 'immediate'
    },
    {
        id: 39,
        title: "Contracting Officer Retires Mid-Procurement",
        effect: "Until replaced (draw Replacement KO positive), you may only move on rolls of 5 or 6.",
        category: 'negative',
        cardType: 'persistent',
        diceModifier: {
            type: 'five_six_only',
            duration: -1,
            fixCondition: 'Replacement KO'
        }
    },
    {
        id: 40,
        title: "New Inflation-Adjusted Minimum Wage Clause",
        effect: "Pay 1 token or miss a turn renegotiating rates.",
        category: 'negative',
        cardType: 'choice',
        tokenCost: 1
    }
];

// C. Situational / Chance (10 cards)
const SITUATIONAL_CARDS: EventCard[] = [
    {
        id: 41,
        title: "Roll the Dice on a Congressional Earmark",
        effect: "Roll 1d100: 1-95 nothing; 96-99 move +10; 100 instant win.",
        category: 'situational',
        cardType: 'immediate'
    },
    {
        id: 42,
        title: "Industry Comment Period Opens",
        effect: "All players simultaneously trade one card with the player to their left.",
        category: 'situational',
        cardType: 'immediate',
        targetPlayer: 'all'
    },
    {
        id: 43,
        title: "Severe Weather Forces Base Closure",
        effect: "Everyone skips the next turn.",
        category: 'situational',
        cardType: 'immediate',
        targetPlayer: 'all',
        skipTurns: 1
    },
    {
        id: 44,
        title: "J&A Sole-Source Under Scrutiny",
        effect: "Roll 1d6: 1-2 lose 2 turns; 3-6 no effect.",
        category: 'situational',
        cardType: 'immediate'
    },
    {
        id: 45,
        title: "Mentor-Protégé Agreement Certified",
        effect: "Give one negative card from your hand to any opponent.",
        category: 'situational',
        cardType: 'choice',
        targetPlayer: 'opponent'
    },
    {
        id: 46,
        title: "DCAA Surprise Audit",
        effect: "Highest-ranked player rolls 1d6; they move back that many spaces.",
        category: 'situational',
        cardType: 'immediate',
        targetPlayer: 'highest'
    },
    {
        id: 47,
        title: "FedRAMP Reciprocity Debate",
        effect: "Players on odd squares advance +1; even stay put this round.",
        category: 'situational',
        cardType: 'immediate',
        targetPlayer: 'all'
    },
    {
        id: 48,
        title: "Press Release Misquotes You",
        effect: "Discard the top card of the event deck face-up (affects nobody).",
        category: 'situational',
        cardType: 'immediate'
    },
    {
        id: 49,
        title: "Election-Year Uncertainty",
        effect: "Shuffle all players' positions within their current mountain/valley.",
        category: 'situational',
        cardType: 'immediate',
        targetPlayer: 'all'
    },
    {
        id: 50,
        title: "Emerging Requirement Pop-Up",
        effect: "Draw two additional cards and resolve both immediately.",
        category: 'situational',
        cardType: 'immediate'
    }
];

// D. Reaction / "Hold" Cards (6 cards)
const REACTION_CARDS: EventCard[] = [
    {
        id: 51,
        title: "Lobbyist on Speed-Dial",
        effect: "Cancel that backward move once.",
        category: 'reaction',
        cardType: 'reaction',
        playTiming: 'on_move_back',
        keepCard: true
    },
    {
        id: 52,
        title: "Surge Staffing",
        effect: "Reduce the skip-count by 1.",
        category: 'reaction',
        cardType: 'reaction',
        playTiming: 'on_skip_turns',
        keepCard: true
    },
    {
        id: 53,
        title: "GFP Windfall",
        effect: "Pay nothing instead.",
        category: 'reaction',
        cardType: 'reaction',
        playTiming: 'on_pay_token',
        keepCard: true
    },
    {
        id: 54,
        title: "Emergency OTA Justification",
        effect: "Ignore that card entirely.",
        category: 'reaction',
        cardType: 'reaction',
        playTiming: 'on_negative_card',
        keepCard: true
    },
    {
        id: 55,
        title: "Bridge Contract Extension",
        effect: "Take an extra full turn.",
        category: 'reaction',
        cardType: 'reaction',
        playTiming: 'before_last_square',
        keepCard: true
    },
    {
        id: 56,
        title: "Budget Realignment Authority",
        effect: "Swap one of your active penalties with an opponent's.",
        category: 'reaction',
        cardType: 'reaction',
        playTiming: 'before_roll',
        keepCard: true
    }
];

// Combine all cards
export const ALL_CARDS: EventCard[] = [
    ...POSITIVE_CARDS,
    ...NEGATIVE_CARDS,
    ...SITUATIONAL_CARDS,
    ...REACTION_CARDS
];

export { POSITIVE_CARDS, NEGATIVE_CARDS, SITUATIONAL_CARDS, REACTION_CARDS };

// Helper functions for deck management
export const shuffleDeck = (cards: EventCard[]): EventCard[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const createGameDecks = () => {
    return {
        positive: shuffleDeck(POSITIVE_CARDS),
        negative: shuffleDeck(NEGATIVE_CARDS),
        mixed: shuffleDeck(ALL_CARDS),
        discardPile: []
    };
};

// Program Funding Token constants
export const PFT_CONSTANTS = {
    MAX_TOKENS: 3,
    COST_TO_REMOVE_PENALTY: 2,
    GAIN_ON_SUMMIT: 1,
    GAIN_ON_CONGRESSIONAL_ADDON: 1,
    GAIN_ON_DOUBLES: 1 // house rule
}; 