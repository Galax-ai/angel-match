// Build-time generation of placeholder therapist avatars.
// Uses DiceBear (MIT) fully offline — produces deterministic illustrated
// portraits as static SVGs in public/therapists/. No runtime dependency and no
// network calls; the app just references the resulting files via photoUrl.
//
// Re-run any time with:  node scripts/gen-avatars.mjs

import { createAvatar } from '@dicebear/core';
import { personas } from '@dicebear/collection';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'public/therapists';
mkdirSync(OUT, { recursive: true });

// Soft, palette-matched background tints (no leading #).
const BACKGROUNDS = ['DCEAE7', 'C9E4DD', 'E3EFEC', 'CFEDE4'];

// Keep everyone warm and professional: no sunglasses, frowns, or pacifiers.
const EYES = ['open', 'happy', 'glasses'];
const MOUTH = ['smile', 'bigSmile', 'smirk', 'lips'];

// personas randomizes hair from the seed without regard to gender, so we pin
// gender-plausible hair pools (and facial hair for men only). DiceBear picks
// one entry from each array deterministically per seed.
const HAIR = {
  male: ['shortCombover', 'buzzcut', 'bald', 'balding', 'fade', 'sideShave', 'shortComboverChops'],
  female: ['long', 'bobCut', 'bobBangs', 'curlyBun', 'straightBun', 'extraLong', 'bunUndercut', 'curly'],
  nonbinary: ['sideShave', 'curly', 'shortCombover', 'curlyHighTop', 'bobCut'],
};
const FACIAL_HAIR = ['beardMustache', 'goatee', 'shadow', 'soulPatch'];

// id + gender — mirrors src/lib/therapists.ts.
const PEOPLE = [
  ['maya-okafor', 'female'],
  ['daniel-reyes', 'male'],
  ['sarah-bensen', 'female'],
  ['james-whitfield', 'male'],
  ['priya-nair', 'female'],
  ['rebecca-stein', 'female'],
  ['marcus-bell', 'male'],
  ['aisha-rahman', 'female'],
  ['tom-castellano', 'male'],
  ['grace-lim', 'female'],
  ['noah-feldman', 'nonbinary'],
  ['helen-park', 'female'],
];

for (const [id, gender] of PEOPLE) {
  const opts = {
    seed: id,
    size: 256,
    backgroundColor: BACKGROUNDS,
    backgroundType: ['solid'],
    radius: 0,
    eyes: EYES,
    mouth: MOUTH,
    hair: HAIR[gender],
  };
  if (gender === 'male') {
    opts.facialHair = FACIAL_HAIR;
    opts.facialHairProbability = 65;
  } else {
    opts.facialHairProbability = 0;
  }

  const svg = createAvatar(personas, opts).toString();
  writeFileSync(`${OUT}/${id}.svg`, svg);
  console.log(`OK  ${id}.svg  (${gender})`);
}

console.log(`\nGenerated ${PEOPLE.length} avatars into ${OUT}/`);
