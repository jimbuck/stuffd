import { test } from 'ava';

import { StoredEnum } from './stored-enum';

test(`Constructor accepts TS Enum`, t => {
  enum LightSwitch { Off, On }

  let storedLightSwitchEnum = new StoredEnum(LightSwitch);
  t.deepEqual(storedLightSwitchEnum.names, ['Off', 'On']);
  t.deepEqual(storedLightSwitchEnum.values, [0, 1]);
});

test(`Constructor accepts TS Enum with none-sequential values`, t => {
  enum Characteristics {
    Mysterious = 0,
    Heavy = 1 << 0,
    Shiny = 1 << 1,
    Triangular = 1 << 2
  }

  let storedLightSwitchEnum = new StoredEnum(Characteristics);
  t.deepEqual(storedLightSwitchEnum.names, ['Mysterious', 'Heavy', 'Shiny', 'Triangular']);
  t.deepEqual(storedLightSwitchEnum.values, [0, 1, 2, 4]);
});