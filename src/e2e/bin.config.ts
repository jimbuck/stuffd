import { writeFile } from 'fs';
import { Stuffd, Int, Str, Custom, List, Enum, Context } from '..';

//#region Nested

enum Region {
  North,
  East,
  South,
  West
}

@Stuffd()
export class Player {
  
  @Custom(c => `${c.first()} ${c.last()}`)
  name: string;

  @Int(1, 99)
  number: number;

  @Str(/[IORW][RB]/)
  position: string;
}

@Stuffd()
export class Team {
  
  @List(Player, 3)
  players: Array<Player>;

  @Custom(c => `${c.first()} ${c.last()}`)
  owner: string;

  @Custom(c => c.animal())
  mascot: string;

  @Custom(c => c.city())
  city: string;

  @Enum(Region)
  region: string;
}

@Stuffd()
export class League {
  
  @List(Team, 4, 8)
  teams: Array<Team>;

  @Custom(c => `${c.first()} ${c.letter({ casing: 'upper' })}. ${c.last()}`)
  chairmen: string;
}

Stuffd.task('nested', async (ctx, args) => {
  ctx.create(League, 2);
  await writeToFile(ctx.json(), args.file);
});

//#endregion

//#region Relational

Stuffd.task('relational', (ctx) => {  
  
});

//#endregion

//#region Default

Stuffd.task('default', async (ctx, args) => {
  await writeToFile('true', args.file);
});

//#endregion


//#region Helpers

function writeToFile(content: string, filename: string) {
  return new Promise<string>((resolve, reject) => {

    writeFile(filename, content, { flag: 'w' }, (err => err ? reject(err) : resolve(filename)));
  });
}

//#endregion