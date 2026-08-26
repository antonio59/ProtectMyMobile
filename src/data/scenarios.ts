/**
 * Safety slide sets.
 *
 * These are social-first assets: square slides made to be shared on Instagram,
 * TikTok and WhatsApp. Each set also gets a page of its own so a shared link
 * lands somewhere real, with the advice written out for readers who arrive from
 * search rather than from a feed.
 *
 * Slides live in /public/Scenarios/<folder>/<n>.webp (PNG alongside).
 */

export interface SafetySlideSet {
  id: string;
  title: string;
  /** Folder name under /public/Scenarios */
  folder: string;
  slides: number;
  /** One line, used in the feed and as the meta description */
  summary: string;
  /** What the thief is actually doing */
  whatHappens: string;
  /** The half second it turns on */
  theMoment: string;
  /** What to do, written for someone it has just happened to */
  whatToDo: string;
  /** Habits that lower the odds */
  prevention: string[];
  /** ISO date the set was published, used to order it in the feed */
  published: string;
}

export const safetySlideSets: SafetySlideSet[] = [
  {
    id: 'moped-snatch',
    title: 'Moped phone-snatch safety',
    folder: 'Moped Phone-Snatch Safety',
    slides: 6,
    summary: 'Kerbside grabs from mopeds and e-bikes, and how to stand so you are not the easy one.',
    whatHappens:
      'A rider and a pillion passenger work as a pair. They ride slowly along a busy pavement edge looking for a phone held out at arm’s length, then close the distance in a couple of seconds and take it at speed from the kerb side.',
    theMoment:
      'The grab happens as the bike draws level with you. You will hear the engine change note a moment before, which is the only warning you get, and by then the decision that matters is whether your hand is between the phone and the road.',
    whatToDo:
      'Let go. A phone pulled from a moving bike will take your arm, your shoulder or you with it, and people have been dragged into the road this way. Once they are gone, get somewhere safe, then report it: 999 if it has just happened and the rider is still nearby, 101 or the online report afterwards. Block the SIM with your network and freeze your bank cards.',
    prevention: [
      'Walk on the building side of the pavement, not the kerb side, and put the phone in the hand furthest from the road.',
      'Stop and stand still against a wall or in a doorway to read a message rather than walking with the phone out.',
      'Take one earbud out in traffic. A bike closing on you is something you hear before you see.',
      'Record your IMEI now, while you still have the phone: dial *#06# and save the number somewhere that is not on the phone.',
    ],
    published: '2026-05-12',
  },
  {
    id: 'street-safety',
    title: 'Street phone-snatch safety',
    folder: 'Street Phone-Snatch Safety Guide',
    slides: 7,
    summary: 'Busy-street habits that make you a harder target, and the first five minutes afterwards.',
    whatHappens:
      'On foot, the thief walks with the flow of the crowd, matches your pace behind your shoulder, and takes the phone from the hand while you are reading it. Most of them are gone into a side street or a station entrance before you have turned round.',
    theMoment:
      'It happens at the point where you stop paying attention to the street: a junction, a shop doorway, the top of an escalator, anywhere you slow down and look at the screen instead of what is around you.',
    whatToDo:
      'Do not chase. You will not catch them, and the ones who work in pairs are counting on you following one of them. Note what you can, get to somewhere with people, then report it and block the SIM.',
    prevention: [
      'Stand with your back to a wall when you need the phone, so nobody can approach from behind you.',
      'Keep the phone in an inside or front pocket, not a back pocket or an open bag.',
      'Set your lock screen to hide message previews, so a thief cannot read a bank code off a locked phone.',
      'Turn on Find My or Find Hub before you need it, not after.',
    ],
    published: '2026-05-19',
  },
  {
    id: 'public-transport',
    title: 'Staying secure on public transport',
    folder: 'Stay Secure on Public Transport',
    slides: 8,
    summary: 'Doors, platforms and crowded carriages, where a phone can leave without its owner.',
    whatHappens:
      'The classic is the door snatch: someone stands near the doors, waits for the closing tone, takes the phone from a seated or standing passenger and steps off as the doors shut. The train leaves with you on it and the phone on the platform.',
    theMoment:
      'The tone. If you are holding a phone within reach of the doors when it sounds, you are the target the whole carriage offers.',
    whatToDo:
      'Let it go rather than be pulled towards a closing door: people have been dragged onto the platform or against the doors holding on to a phone. Tell the driver or a member of staff at the next stop, and report it to the British Transport Police by texting 61016 or calling 999 if it has just happened.',
    prevention: [
      'Sit or stand away from the doors when you have the phone out, and put it away as you come into a station.',
      'On the platform, keep the phone away from the platform edge and away from the doors as they open.',
      'Use a wired or over-ear set rather than holding the phone up to read while standing.',
      'Zip the bag and wear it in front of you in a crowded carriage.',
    ],
    published: '2026-05-26',
  },
  {
    id: 'nightlife',
    title: 'Nightlife phone safety',
    folder: 'Nightlife Phone Safety',
    slides: 6,
    summary: 'Bars, clubs and the walk home, where distraction does most of the work.',
    whatHappens:
      'Nothing is snatched. A phone is left on a table, on a bar, or in a back pocket in a crowd, and it goes while you are talking to somebody who is standing slightly too close.',
    theMoment:
      'Anywhere your attention is being held: a conversation you did not start, a spilled drink, a dance floor squeeze. Distraction is the tool, the phone is just the thing nearest the edge of the table.',
    whatToDo:
      'Check for it before you leave, not in the taxi. If it has gone, use a friend’s phone to lock the device and sign out of your accounts straight away, then block the SIM. If cards were saved on it, ring the bank before anything else.',
    prevention: [
      'Off the table. A phone face down on a table is a phone under a coat a minute later.',
      'Front pocket or a zipped bag, never a back pocket in a crowd.',
      'Do not hand your unlocked phone to someone you have just met, however good the reason sounds.',
      'Turn off lock-screen wallet and payment shortcuts if you keep cards on the phone.',
    ],
    published: '2026-06-02',
  },
  {
    id: 'park-safety',
    title: 'Park phone-snatch safety',
    folder: 'Park Phone-Snatch Safety',
    slides: 6,
    summary: 'Sitting outdoors makes you predictable. Here is what that costs and how to fix it.',
    whatHappens:
      'You are seated, your things are spread out on the grass or a bench, and someone on a bike takes the phone from beside you as they pass. Parks and squares give a rider an approach and an exit that a street does not.',
    theMoment:
      'The pass. A bike that slows near you without a reason to is the whole warning, and it is worth putting the phone in a pocket for.',
    whatToDo:
      'Stay where you are and let them go. Report it with a location, and if you were near a park entrance or a main path there may be a camera. Block the SIM and lock the phone remotely.',
    prevention: [
      'Keep the phone in a pocket rather than on the grass, the bench or the top of a bag.',
      'Sit facing the path so nothing approaches from behind you.',
      'Keep bags on the far side of you, zipped, with a strap through an arm.',
      'Do not leave a phone charging in a bag while you sleep or sunbathe.',
    ],
    published: '2026-06-09',
  },
  {
    id: 'bump-and-grab',
    title: 'Beating the bump-and-grab',
    folder: 'Beat the Bump-and-Grab',
    slides: 6,
    summary: 'The deliberate bump, the apology, and the pocket that is now empty.',
    whatHappens:
      'One person walks into you, apologises, steadies you by the arm. While your attention is on them, a second person takes the phone from the pocket they just pushed you off balance to expose.',
    theMoment:
      'The apology. The contact is not the theft; the theft is the three seconds of politeness afterwards, which is when your hands are busy and your eyes are on a face.',
    whatToDo:
      'Check your pockets immediately, out loud if it helps, while the pair are still in sight. Do not grab anybody. Step back, put your hand on your pocket, and look for staff or a camera. Report it and block the SIM.',
    prevention: [
      'Carry the phone in a front or inside pocket, so the bump does not put it in reach.',
      'Treat unexpected physical contact in a crowd as a cue to check what you are carrying.',
      'In a queue or a crowd, keep bags closed and in front of you.',
      'If someone stops you to ask for directions, take a step back before you answer.',
    ],
    published: '2026-06-16',
  },
  {
    id: 'map-trick',
    title: 'Spotting the map trick',
    folder: 'Spot the Lift_ Map Trick',
    slides: 6,
    summary: 'A map or a leaflet held over the table, and the phone that goes underneath it.',
    whatHappens:
      'Someone asks for directions and lays a paper map, a menu or a leaflet across the table while they point at it. Your phone is under the paper. It leaves with the paper.',
    theMoment:
      'The paper going down. Once something is covering the table, whatever is under it is out of your sight and in theirs.',
    whatToDo:
      'Ask them to lift the paper before you answer anything. If it has already gone, tell the venue immediately: cafes and bars often have a camera on the door and staff who have seen the pair before. Then report it and block the SIM.',
    prevention: [
      'Never let anything be placed over your phone on a table.',
      'Keep the phone in a pocket while you eat rather than beside your plate.',
      'Give directions standing up and a step back from the table.',
      'Be wary of a second person who arrives while the first is still talking.',
    ],
    published: '2026-06-23',
  },
  {
    id: 'cafe-safety',
    title: 'Cafe phone-safety snapshot',
    folder: 'Cafe Phone-Safety Snapshot',
    slides: 6,
    summary: 'Table edges, window seats and the cover-and-lift, in the place people relax most.',
    whatHappens:
      'A phone sits on the edge of a table near a door or a window. Someone walks past the table on their way out and it goes with them, often under a jacket carried over the arm.',
    theMoment:
      'Anytime you turn away: to the counter, to a bag, to a friend arriving. A table by the door gives a thief a two-second exit.',
    whatToDo:
      'Tell staff before you leave the premises, while any recording still covers the last few minutes. Lock the phone remotely from another device, block the SIM, and freeze cards if the phone held them.',
    prevention: [
      'Sit away from the door and put the phone away from the table edge, or better, in a pocket.',
      'Do not use a phone to reserve a table by leaving it on the seat.',
      'Loop a bag strap around a chair leg rather than hanging it on the back.',
      'Face the room if you are working with a laptop and a phone out.',
    ],
    published: '2026-06-30',
  },
];

export function slideUrls(set: SafetySlideSet): string[] {
  return Array.from({ length: set.slides }, (_, i) =>
    encodeURI(`/Scenarios/${set.folder}/${i + 1}.webp`),
  );
}

export function findSlideSet(id: string): SafetySlideSet | undefined {
  return safetySlideSets.find((s) => s.id === id);
}
