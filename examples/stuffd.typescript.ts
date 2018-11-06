import { Stuffd, Integer, Str, Custom, List, Enum } from '..';

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

  @Integer(1, 99)
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

Stuffd.task('default', (ctx, args) => {
  console.log(`The args are: ${JSON.stringify(args)}`);
  ctx.create(League, 1);
  
  const json = ctx.json();

  console.log(`this is the json:`);
  console.log(json);
});